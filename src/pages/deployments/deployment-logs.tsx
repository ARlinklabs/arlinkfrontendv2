import { useGlobalState } from "@/store/useGlobalState";
import { useEffect, useState } from "react";
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
import axios from "axios";
import { runLua } from "@/lib/ao-vars";
import { TESTING_FETCH } from "@/lib/utils";
import { toast } from "sonner";
import type { TDeployment } from "@/types";
import { useAoSigner } from "ao-wallet-kit";

const DeploymentLogs = () => {
    // hooks and global state
    const { deployments } = useGlobalState();
    const globalState = useGlobalState();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { signer, isLoading: signerLoading } = useAoSigner();

    // repo and deployment variable
    const repo = searchParams.get("repo");
    const [deployment, setDeployment] = useState<TDeployment | null>(null);

    // states
    const [buildOutput, setBuildOutput] = useState<string[]>([]);

    // error states
    const [logError, setLogError] = useState<string>("");

    // loading states
    const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(false);

    // Deployment existence check
    useEffect(() => {
        if (!repo) {
            toast.error("No repository specified");
            navigate("/dashboard");
            return;
        }

        const foundDeployment = deployments.find((d) => d.Name === repo);
        if (!foundDeployment) {
            toast.error("Deployment not found");
            navigate("/dashboard");
            return;
        }

        setDeployment(foundDeployment);
    }, [repo, deployments, navigate]);

    // useEffect
    useEffect(() => {
        if (!deployment) return;
        const owner = deployment?.RepoUrl.split("/").reverse()[1];
        const folderName = deployment?.RepoUrl.replace(/\.git|\/$/, "")
            .split("/")
            .pop();
        const fetchLogsFromDB = async () => {
            if (globalState.managerProcess && signer && !signerLoading) {
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
                        undefined,
                        signer,
                    );

                    console.log({
                        buildOutput: result,
                    });

                    // if (result && typeof result === "string") {
                    // 	setBuildOutput(result);
                    // }
                } catch (error) {
                    console.error("Error fetching logs from database:", error);
                }
            }
        };

        // Then try to get latest logs from backend
        const fetchLatestLogs = async () => {
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
                console.log({
                    trimmedLogs: res,
                });
                setBuildOutput(trimmedLogs.logs);
                const safeLogsData = trimmedLogs.logs.join("\n");

                // Update logs in the database
                if (globalState.managerProcess && signer && !signerLoading) {
                    await runLua(
                        `
							db:exec([[
							INSERT OR REPLACE INTO DeploymentLogs (DeploymentName, Logs)
							VALUES ('${deployment.Name}', '${safeLogsData.replace(/'/g, "''")}')
							]])
          				`,
                        globalState.managerProcess,
                        undefined,
                        signer,
                    );
                }
            } catch (error) {
                console.error("Error fetching latest logs:", error);
                // If fetching latest logs fails, we'll keep using the database logs
                // that were already set by fetchLogsFromDB
                setLogError(
                    "Failed to fetch latest build logs. Showing last known logs.",
                );
            } finally {
                setIsFetchingLogs(false);
            }
        };

        // Only run when we have a signer
        if (signer && !signerLoading) {
            fetchLogsFromDB();
            fetchLatestLogs();
        }
    }, [deployment, globalState.managerProcess, signer, signerLoading]);

    // Loading state while searching for deployment
    if (!deployment) {
        return (
            <Layout>
                <div className="text-xl">Searching for deployment...</div>
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
