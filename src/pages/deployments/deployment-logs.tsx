import { useGlobalState } from "@/store/useGlobalState";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

const DeploymentLogs = () => {
    // hooks and global state
    const { deployments } = useGlobalState();
    const globalState = useGlobalState();
    const [searchParams] = useSearchParams();

    // repo and deployment variable
    const repo = searchParams.get("repo");
    const deployment = deployments.find((project) => project.Name === repo);

    // states
    const [buildOutput, setBuildOutput] = useState<string[]>([]);

    // error states
    const [logError, setLogError] = useState<string>("");

    // loading states
    const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(false);

    // useEffect
    useEffect(() => {
        if (!deployment) return;
        const owner = deployment?.RepoUrl.split("/").reverse()[1];
        const folderName = deployment?.RepoUrl.replace(/\.git|\/$/, "")
            .split("/")
            .pop();
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
                    `https://vmi1968527.contaboserver.net/backend/logs/${owner}/${folderName}`
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
                console.log({
                    trimmedLogs: res,
                });
                setBuildOutput(trimmedLogs.logs);
                const safeLogsData = trimmedLogs.logs.join("\n");

                // Update logs in the database
                if (globalState.managerProcess) {
                    await runLua(
                        `
							db:exec([[
							INSERT OR REPLACE INTO DeploymentLogs (DeploymentName, Logs)
							VALUES ('${deployment.Name}', '${safeLogsData.replace(/'/g, "''")}')
							]])
          				`,
                        globalState.managerProcess
                    );
                }
            } catch (error) {
                console.error("Error fetching latest logs:", error);
                // If fetching latest logs fails, we'll keep using the database logs
                // that were already set by fetchLogsFromDB
                setLogError(
                    "Failed to fetch latest build logs. Showing last known logs."
                );
            } finally {
                setIsFetchingLogs(false);
            }
        };

        fetchLogsFromDB();
        fetchLatestLogs();

        // Fetch ArNS info
        // connect()
        // 	.dryrun({
        // 		process: deployment?.ArnsProcess,
        // 		tags: [{ name: "Action", value: "Info" }],
        // 	})
        // 	.then((r) => {
        // 		if (r.Messages && r.Messages.length > 0) {
        // 			const d = JSON.parse(r.Messages[0].Data);
        // 			setAntName(d.Name);
        // 		} else {
        // 			console.error("No messages received or messages array is empty");
        // 			// Keep the last known antName value
        // 			setError(
        // 				"Failed to fetch latest ArNS information. Using last known value.",
        // 			);
        // 		}
        // 	})
        // 	.catch((error) => {
        // 		console.error("Error during dryrun:", error);
        // 		// Keep the last known antName value
        // 		setError(
        // 			"Failed to fetch latest ArNS information. Using last known value.",
        // 		);
        // 	});
    }, [deployment, globalState.managerProcess]);

    useEffect(() => {
        console.log(
            "HEY IDIOT THE LOGS ARE HERE CHECK THEM HERE YOU PEIECE OF SHIT"
        );
        console.log({
            buildOutput,
        });
        console.log(
            "HEY IDIOT THE LOGS ARE HERE CHECK THEM HERE YOU PEIECE OF SHIT"
        );
    }, [buildOutput]);

    return (
        <Layout>
            <div className="container py-5 ">
                <div className="rounded-lg mt-6 border-[#383838]">
                    <h2 className="text-3xl font-semibold mb-6">
                        Deployment Logs
                    </h2>
                    <div className="space-y-2 w-full">
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
