import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/layouts/layout";
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/store/useGlobalState";
import useDeploymentManager from "@/hooks/use-deployment-manager";
import { getProjectConfig, mapConfigToDeployment, API_BASE, extractApiError, apiRequest } from "@/lib/api";
import type { TDeployment } from "@/types";
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

interface DeploymentComponentProps {
    deployment: TDeployment;
}

export default function DeploymentOverview({
    deployment,
}: DeploymentComponentProps) {
    const globalState = useGlobalState();
    const deploymentConfigStore = useDeploymentStore();
    const navigate = useNavigate();
    const { refresh } = useDeploymentManager();
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

    // github path with error handling
    const githubUserPath = (() => {
        try {
            if (!deployment?.RepoUrl) {
                console.warn(
                    "No RepoUrl found for deployment:",
                    deployment?.Name,
                );
                return "unknown/unknown";
            }
            return extractGithubPath(deployment.RepoUrl);
        } catch (error) {
            console.warn(
                "Invalid GitHub URL for deployment:",
                deployment?.Name,
                deployment?.RepoUrl,
            );
            try {
                const parts = deployment.RepoUrl.split("/").filter(Boolean);
                if (parts.length >= 2) {
                    return `${parts[parts.length - 2]}/${parts[parts.length - 1].replace(".git", "")}`;
                }
            } catch (fallbackError) {
                console.warn(
                    "Fallback path extraction failed:",
                    fallbackError,
                );
            }
            return "unknown/unknown";
        }
    })();

    // Extract owner from RepoUrl; use deployment.Name as projectName for API paths
    const extractOwner = (repoUrl: string) => {
        const path = extractGithubPath(repoUrl);
        return path.split("/")[0];
    };

    // Fetch deployment config from backend
    useEffect(() => {
        if (!deployment?.RepoUrl || !globalState.managerProcess) return;

        const fetchDeploymentUrl = async () => {
            try {
                setIsFetchingProject(true);
                const owner = extractOwner(deployment.RepoUrl);

                const config = await getProjectConfig(owner, deployment.Name);

                const newDeploymentUrl = config.url;
                const arnsUnderName = config.arnsUnderName;

                if (newDeploymentUrl && newDeploymentUrl !== deployment.DeploymentId) {
                    console.log("New deployment detected from backend:", {
                        old: deployment.DeploymentId,
                        new: newDeploymentUrl,
                    });
                }

                // Update deployment store
                deploymentConfigStore.addDeployment(config as any);
                deploymentConfigStore.updateDeployment(githubUserPath, config as any);

                if (arnsUnderName) {
                    setAntName(arnsUnderName);
                }

                if (newDeploymentUrl) {
                    setDeploymentUrl(newDeploymentUrl);
                }

                // Update the global deployment with fresh data
                const mapped = mapConfigToDeployment(config);
                globalState.updateDeployment(mapped);

                refresh();
            } catch (error) {
                console.error("Error fetching deployment URL:", error);
                setError("Failed to fetch deployment URL. Using last known values.");
                setDeploymentUrl(deployment.DeploymentId || "");
            } finally {
                setIsFetchingProject(false);
            }
        };

        fetchDeploymentUrl();
    }, [globalState.managerProcess]);

    // Fetch build logs from backend
    useEffect(() => {
        if (!deployment?.RepoUrl) return;
        const owner = extractOwner(deployment.RepoUrl);

        const fetchLatestLogs = async () => {
            try {
                const res = await apiRequest(`/logs/${owner}/${deployment.Name}`);
                if (!res.ok) return;
                const rawLogsData = (await res.text()).replaceAll(
                    /\\|\||\-/g,
                    "",
                );

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

                setBuildOutput(trimmedLogs.logs.join("\n"));
            } catch (error) {
                console.error("Error fetching latest logs:", error);
                setError("Failed to fetch latest build logs.");
            }
        };

        fetchLatestLogs();
    }, [globalState.managerProcess]);

    // Poll logs during redeployment
    useEffect(() => {
        if (!deployment?.RepoUrl) return;
        const owner = extractOwner(deployment.RepoUrl);
        const interval = setInterval(async () => {
            if (!redeploying) return clearInterval(interval);
            try {
                const res = await apiRequest(`/logs/${owner}/${deployment.Name}`);
                if (!res.ok) return;
                const rawLogsData = (await res.text()).replaceAll(
                    /\\|\||\-/g,
                    "",
                );
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
                setBuildOutput(trimmedLogs.logs.join("\n"));
            } catch (error) {
                console.error("Error fetching logs:", error);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [redeploying, deployment?.RepoUrl]);

    useEffect(() => {
        refresh();
    }, []);

    const updateArns = async () => {
        if (!deployment || !deploymentUrl) {
            toast.error("Deployment information is not available");
            return;
        }

        setUpdatingArns(true);
        try {
            // ArNS update is now handled by the backend during deploy
            // This button can trigger a manual ARNS re-point via backend
            const owner = extractOwner(deployment.RepoUrl);
            const res = await apiRequest(`/updatereporecord/${owner}/${deployment.Name}`, {
                method: "POST",
                body: JSON.stringify({ txid: deploymentUrl }),
            });
            if (res.ok) {
                toast.success("ArNS update initiated successfully.");
            } else {
                const errMsg = await extractApiError(res);
                throw new Error(errMsg);
            }
        } catch (error) {
            console.error("Error updating ArNS:", error);
            toast.error(error instanceof Error ? error.message : "Failed to update ArNS. Please try again.");
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
            <div className="w-full px-4 py-10 md:px-[40px]">
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
        </Layout>
    );
}
