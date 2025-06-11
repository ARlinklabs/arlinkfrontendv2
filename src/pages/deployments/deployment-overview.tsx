import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { connect } from "@permaweb/aoconnect";
import { toast } from "sonner";
import Layout from "@/layouts/layout";
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/store/useGlobalState";
import useDeploymentManager from "@/hooks/use-deployment-manager";
import { getTime, TESTING_FETCH } from "@/lib/utils";
import { runLua } from "@/lib/ao-vars";
import { setArnsName } from "@/lib/ao-vars";
import { DeploymentConfig, type TDeployment } from "@/types";
import ConfigureProject from "../../components/configure-project";
import {
    ConfigureProjectSkeleton,
    DeploymentCardSkeleton,
} from "@/components/skeletons";
import DeploymentCard from "@/components/shared/deployment-card";
import { extractGithubPath } from "../utilts";
import { useDeploymentStore } from "@/store/use-deployment-store";
import { Loader2 } from "lucide-react";
import TwitterShareButton from "@/components/ui/twitter-share-button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Logs } from "@/components/ui/logs";

interface DeploymentComponentProps {
    deployment: TDeployment;
}
``;

export default function DeploymentOverview({
    deployment,
}: DeploymentComponentProps) {
    // zustand stores and hooks
    const globalState = useGlobalState();
    const deploymentConfigStore = useDeploymentStore();
    const navigate = useNavigate();
    // @ts-ignore
    const { managerProcess, deployments, refresh } = useDeploymentManager();
    const { name } = useParams();

    // states
    const [, setBuildOutput] = useState("");
    const [, setAntName] = useState("");
    const [redeploying] = useState(false);
    const [deploymentUrl, setDeploymentUrl] = useState(deployment.DeploymentId);
    const [updatingArns, setUpdatingArns] = useState(false);

    // loading states
    const [isFetchingProject, setIsFetchingProject] = useState<boolean>(true);
    const [, setError] = useState<string>("");

    // github path
    const githubUserPath = extractGithubPath(deployment.RepoUrl);

    //build logs
    const [buildLogs, setBuildLogs] = useState<string[]>([]);
    const [isFetchingLogs, setIsFetchingLogs] = useState(false);
    const [logError, setLogError] = useState("");

    const updateUnderName = async (underName: string) => {
        try {
            await runLua(
                `local res = db:exec[[
                  ALTER TABLE Deployments 
                  ADD COLUMN UnderName TEXT
                ]]`,
                managerProcess,
            );
            // console.log("Table altered:", alter);

            await runLua(
                `db:exec[[UPDATE Deployments SET UnderName='${underName}' WHERE Name='${deployment.Name}']]`,
                managerProcess,
            );
            // console.log("UnderName updated:", updateQuery);

            return { success: true };
        } catch (error) {
            console.error("Error updating UnderName:", error);
            return { success: false, error };
        }
    };

    // checking for any deploymentConfig
    useEffect(() => {
        // Early return should prevent double firing, but React 18 Strict Mode
        // will still double-invoke effects in development
        if (!deployment?.RepoUrl || !globalState.managerProcess) return;

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
                globalState.managerProcess,
            );
        };

        const getFallbackArNSName = async () => {
            try {
                const response = await connect({
                    CU_URL: "https://cu.ardrive.io",
                    MODE: "legacy",
                }).dryrun({
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
                "Failed to fetch deployment URL. Using last known values.",
            );
            setDeploymentUrl(deployment.DeploymentId || "");
            getFallbackArNSName();
        };

        const fetchDeploymentUrl = async () => {
            try {
                setIsFetchingProject(true);
                const { owner, repoName } = extractRepoInfo(deployment.RepoUrl);

                // fetchning data from the axios
                const response = await axios.get<DeploymentConfig>(
                    `${TESTING_FETCH}/config/${owner}/${repoName}`,
                );

                const { url: newDeploymentUrl, arnsUnderName } = response.data;

                console.log({
                    idFromBackend: response.data.url,
                });

                if (response.data.url !== deployment.DeploymentId) {
                    await updateDeploymentInDB(newDeploymentUrl);

                    console.log("updated the deployment history");
                    console.log({
                        onChainDataId: deployment.DeploymentId,
                    });

                    await runLua(
                        `db:exec[[
                                INSERT INTO NewDeploymentHistory (Name, DeploymentID, AssignedUndername, Date) VALUES
                                ('${
                                    deployment.Name
                                }', '${newDeploymentUrl}', '${arnsUnderName}', '${getTime()}')
                            ]]`,
                        globalState.managerProcess,
                    );
                } else {
                    console.log("no new deployment was found.");
                }

                // updating in global store
                deploymentConfigStore.addDeployment(response.data);
                deploymentConfigStore.updateDeployment(
                    githubUserPath,
                    response.data,
                );

                // if the user doesn't have the undername in his table, this will add it
                if (!deployment.UnderName) {
                    await updateUnderName(arnsUnderName);
                    setDeploymentUrl(newDeploymentUrl);
                    setAntName(arnsUnderName);
                }

                // lastly calling referesh to update the data
                refresh();
            } catch (error) {
                handleError(error);
            } finally {
                setIsFetchingProject(false);
            }
        };

        // Add deployment and refresh as dependencies to prevent unnecessary re-runs
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
                    `${TESTING_FETCH}/logs/${owner}/${folderName}`,
                );
                const rawLogsData = logs.data.replaceAll(/\\|\||\-/g, "");

                // Trim logs to remove sensitive information
                const trimmedLogs = rawLogsData.split("\n").reduce(
                    (
                        acc: { started: boolean; logs: string[] },
                        line: string,
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
                    { started: false, logs: [] as string[] },
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
                        globalState.managerProcess,
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
                        globalState.managerProcess,
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
                    `${TESTING_FETCH}/logs/${owner}/${folderName}`,
                );
                const rawLogsData = res.data.replaceAll(/\\|\||\-/g, "");

                const trimmedLogs = rawLogsData.split("\n").reduce(
                    (
                        acc: { started: boolean; logs: string[] },
                        line: string,
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
                    { started: false, logs: [] as string[] },
                );

                const safeLogsData = trimmedLogs.logs.join("\n");
                setBuildOutput(safeLogsData);

                // Update logs in the database
                if (globalState.managerProcess) {
                    await runLua(
                        `
                          db:exec([[
                            INSERT OR REPLACE INTO DeploymentLogs (DeploymentName, Logs)
                            VALUES ('${
                                deployment.Name
                            }', '${safeLogsData.replace(/'/g, "''")}')
                          ]])
                        `,
                        globalState.managerProcess,
                    );
                }
            } catch (error) {
                console.error("Error fetching latest logs:", error);
                setError(
                    "Failed to fetch latest build logs. Showing last known logs.",
                );
            }
        };

        // Execute both operations
        fetchLogsFromDB();
        fetchLatestLogs();

        // Fetch ArNS info
        connect({
            CU_URL: "https://cu.ardrive.io",
            MODE: "legacy",
        })
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
                        "No messages received or messages array is empty",
                    );
                    // Keep the last known antName value
                    setError(
                        "Failed to fetch latest ArNS information. Using last known value.",
                    );
                }
            })
            .catch((error) => {
                console.error("Error during dryrun:", error);
                // Keep the last known antName value
                setError(
                    "Failed to fetch latest ArNS information. Using last known value.",
                );
            });
    }, [globalState.managerProcess]);

    //function to build logs
    useEffect(() => {
        if (!deployment) return;
        const owner = deployment?.RepoUrl.split("/").reverse()[1];
        const folderName = deployment?.RepoUrl.replace(/\.git|\/$/, "")
            .split("/")
            .pop();

        const fetchLogs = async () => {
            setIsFetchingLogs(true);
            try {
                const res = await axios.get(
                    `${TESTING_FETCH}/logs/${owner}/${folderName}`,
                );
                const rawLogsData = res.data.replaceAll(/\\|\||\-/g, "");
                const trimmedLogs = rawLogsData.split("\n").reduce(
                    (
                        acc: { started: boolean; logs: string[] },
                        line: string,
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
                    { started: false, logs: [] as string[] },
                );

                setBuildLogs(trimmedLogs.logs);
            } catch (error) {
                console.error("Error fetching logs:", error);
                setLogError("Failed to fetch logs");
            } finally {
                setIsFetchingLogs(false);
            }
        };

        fetchLogs();
    }, [deployment]);

    const updateArns = async () => {
        if (!deployment || !deploymentUrl) {
            toast.error("Deployment information is not available");
            return;
        }

        setUpdatingArns(true);
        try {
            await setArnsName(deployment.ArnsProcess, deployment.DeploymentId);
            toast.success(
                "ArNS update initiated successfully. This may take approximately 5 minutes to fully update.",
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
                <div className="flex md:flex-row flex-col space-y-3 justify-between items-start mb-6">
                    <div className="space-y-2">
                        <h1 className="text-2xl lg:text-3xl font-semibold">
                            {deployment.Name}
                        </h1>
                        <p className="text-neutral-400 text-xs md:text-sm">
                            This production deployment is available to the user
                        </p>
                    </div>
                    <div className="space-x-2 flex items">
                        <Button
                            onClick={() => {
                                navigate(
                                    `/deployment/logs?repo=${deployment.Name}`,
                                );
                            }}
                            className="px-4 md:px-8 py-1 text-sm md:text-base bg-arlink-bg-secondary-color hover:bg-neutral-900 border-neutral-800 text-white border"
                        >
                            logs
                        </Button>
                        <TwitterShareButton
                            className="px-4 md:px-8 py-1 flex items-center rounded-md text-sm md:text-base bg-arlink-bg-secondary-color hover:bg-neutral-900 border-neutral-800 text-white border"
                            undername={deployment.UnderName}
                        />
                        <Button
                            className={`${
                                updatingArns ? "px-2 md:px-4" : "px-4 md:px-8"
                            } py-1 text-sm md:text-base bg-arlink-bg-secondary-color hover:bg-neutral-900 border-neutral-800 text-white border`}
                            onClick={updateArns}
                            disabled={updatingArns || !deploymentUrl}
                        >
                            {updatingArns ? (
                                <>
                                    <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update arns"
                            )}
                        </Button>
                    </div>
                </div>

                {isFetchingProject ? (
                    <DeploymentCardSkeleton />
                ) : (
                    <DeploymentCard deployment={deployment} />
                )}

                {isFetchingProject ? (
                    <ConfigureProjectSkeleton />
                ) : (
                    <ConfigureProject deployment={deployment} />
                )}
            </div>

            <div className="mt-2 px-14 mb-20">
                <h2 className="text-2xl font-semibold text-neutral-100 mb-4">
                    Deployment Logs
                </h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                        value="logs"
                        className="rounded-lg bg-arlink-bg-secondary-color border overflow-hidden"
                    >
                        <AccordionTrigger className="p-4 w-full">
                            <div className="flex items-center w-full justify-between">
                                <span>Build logs</span>
                                {isFetchingLogs && (
                                    <div className="text-xs flex items-center gap-2">
                                        <Loader2 className="text-neutral-600 animate-spin" />
                                        <span className="text-neutral-200">
                                            Fetching logs
                                        </span>
                                    </div>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Logs logs={buildLogs} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {logError && (
                    <div className="mt-4 border border-red-500 px-4 py-2 rounded-md">
                        <p className="text-md font-medium text-red-500">
                            {logError}
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
