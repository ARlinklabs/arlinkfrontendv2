import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/layouts/layout";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import { Logs } from "@/components/ui/logs";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import useDeploymentManager from "@/hooks/use-deployment-manager";
import { extractGithubPath } from "../utilts";
import { Skeleton } from "@/components/ui/skeleton";

const DeploymentLogs = () => {
    // hooks and global state
    const { deployments, hasFetchedOnce } = useDeploymentManager();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // repo and deployment variable
    const repo = searchParams.get("repo");
    const deployment = useMemo(
        () => deployments.find((d) => d.Name === repo),
        [deployments, repo],
    );

    // states
    const [buildOutput, setBuildOutput] = useState<string[]>([]);

    // error states
    const [logError, setLogError] = useState<string>("");

    // loading states
    const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(false);

    // Only redirect after initial fetch has completed
    useEffect(() => {
        if (!repo) {
            toast.error("No repository specified");
            navigate("/dashboard");
            return;
        }

        if (hasFetchedOnce && !deployment) {
            toast.error("Deployment not found");
            navigate("/dashboard");
        }
    }, [repo, deployment, hasFetchedOnce, navigate]);

    // Fetch logs from backend
    useEffect(() => {
        if (!deployment) return;
        const githubPath = extractGithubPath(deployment.RepoUrl);
        const [owner, folderName] = githubPath.split("/");

        const fetchLatestLogs = async () => {
            setIsFetchingLogs(true);
            try {
                const res = await apiRequest(`/logs/${owner}/${folderName}`);
                if (!res.ok) throw new Error("Failed to fetch logs");
                const rawLogsData = (await res.text()).replaceAll(/\\|\||\-/g, "");

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
                setBuildOutput(trimmedLogs.logs);
            } catch (error) {
                console.error("Error fetching latest logs:", error);
                setLogError(
                    "Failed to fetch latest build logs.",
                );
            } finally {
                setIsFetchingLogs(false);
            }
        };

        fetchLatestLogs();
    }, [deployment]);

    // Skeleton while waiting for initial fetch
    if (!deployment) {
        return (
            <Layout>
                <div className="w-full px-4 py-4 md:px-[40px]">
                    <div className="rounded-lg mt-6">
                        <Skeleton className="h-9 w-52 bg-neutral-800 mb-4" />
                        <div className="rounded-lg bg-arlink-bg-secondary-color border overflow-hidden">
                            <div className="p-4 flex items-center justify-between">
                                <Skeleton className="h-5 w-24 bg-neutral-800" />
                            </div>
                            <div className="p-4 space-y-2">
                                {[...Array(8)].map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full bg-neutral-800/50" style={{ width: `${60 + Math.random() * 40}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="w-full px-4 py-4 md:px-[40px]">
                <div className="rounded-lg mt-6 border-[#383838]">
                    <h1 className="text-3xl font-semibold flex items-center tracking-tight text-neutral-100">
                        Deployment Logs
                    </h1>
                    <div className="space-y-2 w-full mt-4">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem
                                value="item-1"
                                className="rounded-lg bg-arlink-bg-secondary-color w-full border overflow-hidden"
                            >
                                <AccordionTrigger className="p-4 w-full">
                                    <div className="flex items-center w-full justify-between">
                                        <div className="pl-2">Build logs</div>
                                        {isFetchingLogs && (
                                            <div className="text-xs flex items-center pr-4 gap-2">
                                                <Loader2 className="text-neutral-600 animate-spin" />
                                                <span className="text-neutral-200">
                                                    Fetching logs
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Logs logs={buildOutput} />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                    {logError && (
                        <div className=" border px-4 py-2 mt-3 rounded-md">
                            <p className="text-md font-medium">
                                Deployment Error
                            </p>
                            <p className="text-sm text-red-500 font-medium">
                                {logError}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default DeploymentLogs;
