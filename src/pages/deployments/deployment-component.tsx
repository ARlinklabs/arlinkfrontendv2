import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { connect } from "@permaweb/aoconnect";
import { toast } from "sonner";
import Layout from "@/layouts/layout";
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/store/useGlobalState";
import useDeploymentManager from "@/hooks/useDeploymentManager";
import { BUILDER_BACKEND, TESTING_FETCH } from "@/lib/utils";
import { runLua } from "@/lib/ao-vars";
import { setArnsName } from "@/lib/ao-vars";
import { DeploymentConfig, type TDeployment } from "@/types";
import ConfigureProject from "./configure-project";
import {
    ConfigureProjectSkeleton,
    DeploymentCardSkeleton,
} from "@/components/skeletons";
import DeploymentCard from "@/components/deployment-card";
import { extractGithubPath } from "../depoly/utilts";
import { useDeploymentStore } from "@/store/use-deployment-store";

interface DeploymentComponentProps {
    deployment: TDeployment;
}

export default function DeploymentComponent({
    deployment,
}: DeploymentComponentProps) {
    // zustand stores and hooks
    const globalState = useGlobalState();
    const deploymentConfigStore = useDeploymentStore();

    //@ts-ignore
    const { managerProcess, deployments, refresh } = useDeploymentManager();
    const navigate = useNavigate();
    const { name } = useParams();

    // states
    const [, setBuildOutput] = useState("");
    const [antName, setAntName] = useState("");
    const [redeploying, setRedeploying] = useState(false);
    const [deploymentUrl, setDeploymentUrl] = useState("");
    const [updatingArns, setUpdatingArns] = useState(false);

    // loading states
    const [isFetchingProject, setIsFetchingProject] = useState<boolean>(true);
    const [, setError] = useState<string>("");

    // github path
    const githubUserPath = extractGithubPath(deployment.RepoUrl);

    // checking for any deploymentConfig
    useEffect(() => {
        if (!deployment?.RepoUrl) return;

        const extractRepoInfo = (repoUrl: string) => {
            const parts = repoUrl.split("/").reverse();
            return {
                owner: parts[1],
                repoName: parts[0].replace(".git", ""),
            };
        };

        const updateDeploymentInDB = async (newDeploymentUrl: string) => {
            if (!globalState.managerProcess || !newDeploymentUrl) return;

            await runLua(
                `db:exec[[UPDATE Deployments SET DeploymentId='${newDeploymentUrl}' WHERE Name='${deployment.Name}']]`,
                globalState.managerProcess
            );
        };

        const getFallbackArNSName = async () => {
            try {
                const response = await connect().dryrun({
                    process: deployment?.ArnsProcess,
                    tags: [{ name: "Action", value: "Info" }],
                });

                if (response.Messages?.[0]) {
                    const data = JSON.parse(response.Messages[0].Data);
                    setAntName(data.Name);
                }
            } catch (error) {
                console.error("Failed to fetch fallback ArNS name");
            }
        };

        const handleError = (error: unknown) => {
            console.error("Error fetching deployment URL:", error);
            toast.error("Failed to fetch deployment URL");
            setError(
                "Failed to fetch deployment URL. Using last known values."
            );
            setDeploymentUrl(deployment.DeploymentId || "");
            getFallbackArNSName();
        };

        const fetchDeploymentUrl = async () => {
            try {
                setIsFetchingProject(true);
                const { owner, repoName } = extractRepoInfo(deployment.RepoUrl);

                const response = await axios.get<DeploymentConfig>(
                    `${TESTING_FETCH}/config/${owner}/${repoName}`
                );

                const { url: newDeploymentUrl, arnsUnderName } = response.data;
                deploymentConfigStore.addDeployment(response.data);
                deploymentConfigStore.updateDeployment(
                    githubUserPath,
                    response.data
                );
                setDeploymentUrl(newDeploymentUrl);
                setAntName(arnsUnderName);
                await updateDeploymentInDB(newDeploymentUrl);
            } catch (error) {
                handleError(error);
            } finally {
                setIsFetchingProject(false);
            }
        };

        fetchDeploymentUrl();
    }, [globalState.managerProcess]);

    useEffect(() => {
        if (!deployment?.RepoUrl) return;
        const interval = setInterval(async () => {
            const folderName = deployment?.RepoUrl.replace(/\.git|\/$/, "")
                .split("/")
                .pop();
            const owner = deployment?.RepoUrl.split("/").reverse()[1];
            if (!redeploying) return clearInterval(interval);
            try {
                const logs = await axios.get(
                    `${TESTING_FETCH}/logs/${owner}/${folderName}`
                );
                const rawLogsData = logs.data.replaceAll(/\\|\||\-/g, "");

                // Trim logs to remove sensitive information
                const trimmedLogs = rawLogsData.split("\n").reduce(
                    (
                        acc: { started: boolean; logs: string[] },
                        line: string
                    ) => {
                        if (
                            acc.started ||
                            line.includes("Cloning repository...")
                        ) {
                            acc.started = true;
                            acc.logs.push(line);
                        }
                        return acc;
                    },
                    { started: false, logs: [] as string[] }
                );

                const safeLogsData = trimmedLogs.logs.join("\n");
                setBuildOutput(safeLogsData);

                // Create table if it doesn't exist and update logs
                if (globalState.managerProcess) {
                    await runLua(
                        `
                            db:exec[[
                            CREATE TABLE IF NOT EXISTS DeploymentLogs (
                                DeploymentName TEXT PRIMARY KEY,
                                Logs TEXT
                            )
                            ]]
                            db:exec([[
                            INSERT OR REPLACE INTO DeploymentLogs (DeploymentName, Logs)
                            VALUES ('${
                                deployment.Name
                            }', '${safeLogsData.replace(/'/g, "''")}')
                            ]])
                        `,
                        globalState.managerProcess
                    );
                }
            } catch (error) {
                console.error("Error fetching logs:", error);
                setError("Failed to fetch build logs. Please try again later.");
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [redeploying, deployment?.RepoUrl, globalState.managerProcess]);

    const redeploy = async () => {
        if (!deployment) return;
        const projName = deployment.Name;
        const repoUrl = deployment.RepoUrl;
        const installCommand = deployment.InstallCMD;
        const buildCommand = deployment.BuildCMD;
        const outputDir = deployment.OutputDIR;
        const arnsProcess = deployment.ArnsProcess;
        const branch = deployment.Branch || "main";
        setRedeploying(true);
        setBuildOutput("");
        setError("");
        try {
            const txid = await axios.post(`${BUILDER_BACKEND}/deploy`, {
                repository: repoUrl,
                branch,
                installCommand,
                buildCommand,
                outputDir,
            });

            if (txid.status === 200) {
                toast.success("Deployment successful");

                await runLua("", arnsProcess, [
                    { name: "Action", value: "Set-Record" },
                    { name: "Sub-Domain", value: "@" },
                    { name: "Transaction-Id", value: txid.data },
                    { name: "TTL-Seconds", value: "3600" },
                ]);

                await runLua(
                    `db:exec[[UPDATE Deployments SET DeploymentId='${txid.data}' WHERE Name='${projName}']]`,
                    globalState.managerProcess
                );

                navigate(`/deployment?repo=${projName}`);
                await refresh();
                window.open(`https://arweave.net/${txid.data}`, "_blank");

                setRedeploying(false);
            } else {
                toast.error("Deployment failed");
                console.log(txid);
                setRedeploying(false);
                setError("Deployment failed. Please try again.");
            }
        } catch (error) {
            toast.error("Deployment failed");
            console.log(error);
            setRedeploying(false);
            setError(
                "An error occurred during deployment. Please try again later."
            );
        }
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        refresh();
    }, []);

    useEffect(() => {
        if (!deployment) return;
        const owner = deployment?.RepoUrl.split("/").reverse()[1];
        const folderName = deployment?.RepoUrl.replace(/\.git|\/$/, "")
            .split("/")
            .pop();

        // First try to get logs from the database
        const fetchLogsFromDB = async () => {
            if (globalState.managerProcess) {
                try {
                    const result = await runLua(
                        `
            local res = db:exec([[
              SELECT Logs FROM DeploymentLogs
              WHERE DeploymentName = '${deployment.Name}'
            ]])
            return res[1] and res[1].Logs or ''
          `,
                        globalState.managerProcess
                    );

                    if (result && typeof result === "string") {
                        setBuildOutput(result);
                    }
                } catch (error) {
                    console.error("Error fetching logs from database:", error);
                }
            }
        };

        // Then try to get latest logs from backend
        const fetchLatestLogs = async () => {
            try {
                const res = await axios.get(
                    `${TESTING_FETCH}/logs/${owner}/${folderName}`
                );
                const rawLogsData = res.data.replaceAll(/\\|\||\-/g, "");

                const trimmedLogs = rawLogsData.split("\n").reduce(
                    (
                        acc: { started: boolean; logs: string[] },
                        line: string
                    ) => {
                        if (
                            acc.started ||
                            line.includes("Cloning repository...")
                        ) {
                            acc.started = true;
                            acc.logs.push(line);
                        }
                        return acc;
                    },
                    { started: false, logs: [] as string[] }
                );

                const safeLogsData = trimmedLogs.logs.join("\n");
                setBuildOutput(safeLogsData);

                // Update logs in the database
                if (globalState.managerProcess) {
                    await runLua(
                        `
            db:exec([[
              INSERT OR REPLACE INTO DeploymentLogs (DeploymentName, Logs)
              VALUES ('${deployment.Name}', '${safeLogsData.replace(
                            /'/g,
                            "''"
                        )}')
            ]])
          `,
                        globalState.managerProcess
                    );
                }
            } catch (error) {
                console.error("Error fetching latest logs:", error);
                // If fetching latest logs fails, we'll keep using the database logs
                // that were already set by fetchLogsFromDB
                setError(
                    "Failed to fetch latest build logs. Showing last known logs."
                );
            }
        };

        // Execute both operations
        fetchLogsFromDB();
        fetchLatestLogs();

        // Fetch ArNS info
        connect()
            .dryrun({
                process: deployment?.ArnsProcess,
                tags: [{ name: "Action", value: "Info" }],
            })
            .then((r) => {
                if (r.Messages && r.Messages.length > 0) {
                    const d = JSON.parse(r.Messages[0].Data);
                    setAntName(d.Name);
                } else {
                    console.error(
                        "No messages received or messages array is empty"
                    );
                    // Keep the last known antName value
                    setError(
                        "Failed to fetch latest ArNS information. Using last known value."
                    );
                }
            })
            .catch((error) => {
                console.error("Error during dryrun:", error);
                // Keep the last known antName value
                setError(
                    "Failed to fetch latest ArNS information. Using last known value."
                );
            });
    }, [globalState.managerProcess]);

    async function deleteDeployment() {
        if (!deployment) return toast.error("Deployment not found");
        if (!globalState.managerProcess)
            return toast.error("Manager process not found");

        const query = `local res = db:exec[[
      DELETE FROM Deployments
      WHERE Name = '${deployment.Name}'
    ]]`;
        console.log(query);

        try {
            const res = await runLua(query, globalState.managerProcess);
            if (res.Error) {
                toast.error(res.Error);
                setError("Failed to delete deployment. Please try again.");
                return;
            }
            console.log(res);
            await refresh();

            toast.success("Deployment deleted successfully");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error deleting deployment:", error);
            toast.error("An error occurred while deleting the deployment");
            setError("Failed to delete deployment. Please try again later.");
        }
    }

    const updateArns = async () => {
        if (!deployment || !deploymentUrl) {
            toast.error("Deployment information is not available");
            return;
        }

        setUpdatingArns(true);
        try {
            await setArnsName(deployment.ArnsProcess, deploymentUrl);
            toast.success(
                "ArNS update initiated successfully. This may take approximately 5 minutes to fully update."
            );
        } catch (error) {
            console.error("Error updating ArNS:", error);
            toast.error("Failed to update ArNS. Please try again.");
        } finally {
            setUpdatingArns(false);
        }
    };

    if (!deployment)
        return (
            <Layout>
                <div className="text-xl">
                    Searching{" "}
                    <span className="text-muted-foreground">{name} </span> ...
                </div>
            </Layout>
        );

    return (
        <Layout>
            <div className="md:p-10 p-4 container">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">
                        Production Deployment
                    </h1>
                    <div className="space-x-2 flex items-center">
                        <Button className="px-8 py-1 bg-arlink-bg-secondary-color hover:bg-neutral-900 border-neutral-800 text-white border">
                            logs
                        </Button>
                        <Button
                            className="px-8 py-1 bg-arlink-bg-secondary-color hover:bg-neutral-900 border-neutral-800 text-white border"
                            onClick={updateArns}
                            disabled={updatingArns || !deploymentUrl}
                        >
                            Update arns
                        </Button>
                    </div>
                </div>

                {isFetchingProject ? (
                    <DeploymentCardSkeleton />
                ) : (
                    <DeploymentCard
                        antName={antName}
                        deployment={deployment}
                        deploymentUrl={deploymentUrl}
                    />
                )}

                {isFetchingProject ? (
                    <ConfigureProjectSkeleton />
                ) : (
                    <ConfigureProject deployment={deployment} />
                )}
            </div>
        </Layout>
    );
}
