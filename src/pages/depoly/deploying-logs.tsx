import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Logs } from "@/components/ui/logs";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const DeployingLogs = ({
    logs,
    logError,
    isFetchingLogs,
    isWaitingForLogs,
}: {
    logs: string[];
    logError: string;
    isFetchingLogs: boolean;
    isWaitingForLogs: boolean;
}) => {
    const [accordionValue, setAccordionValue] = useState<string | undefined>(
        undefined
    );

    useEffect(() => {
        if (isFetchingLogs) {
            setAccordionValue("item-1");
        }
    }, [isFetchingLogs]);

    return (
        <div className="bg-arlink-bg-secondary-color p-6 rounded-lg mt-6 border border-[#383838]">
            <h2 className="text-xl font-semibold mb-4">Deployment Process</h2>
            <div className="space-y-2 w-full">
                <Accordion
                    type="single"
                    value={accordionValue}
                    onValueChange={setAccordionValue}
                    collapsible
                    className="w-full"
                >
                    <AccordionItem
                        value="item-1"
                        className="rounded-lg w-full border overflow-hidden"
                    >
                        <AccordionTrigger className="p-4 w-full">
                            <div className="flex items-center w-full justify-between">
                                <div className="pl-2">Build logs</div>
                                {isWaitingForLogs && (
                                    <div className="text-xs flex items-center pr-4 gap-2">
                                        <Loader2 className="text-neutral-600 animate-spin" />
                                        <span className="text-neutral-200">
                                            Build is starting
                                        </span>
                                    </div>
                                )}
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
                            <Logs logs={logs} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {logError !== "Waiting for logs..." && logError && (
                <div className=" border px-4 py-2 mt-3 rounded-md">
                    <p className="text-md font-medium">Deployment Error</p>
                    <p className="text-sm text-red-500 font-medium">
                        {logError}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DeployingLogs;

// useEffect(() => {
// 	if (!name || !repoUrl) return;

// 	const repo = extractRepoName(repoUrl);
// 	const owner = extractOwnerName(repoUrl);
// 	const startTime = Date.now();
// 	const waitTime = 10000;

// 	const fetchLogs = async () => {
// 		try {
// 			const logs = await axios.get(
// 				`${BUILDER_BACKEND}/logs/${owner}/${repo}`,
// 			);

// 			setLogs(logs.data.split("\n"));
// 		} catch (error) {
// 			if (isAxiosError(error) && error.response?.status === 404) {
// 				const elapsedTime = Date.now() - startTime;
// 				if (elapsedTime < waitTime) {
// 					setError("Waiting for logs...");
// 				} else {
// 					setError(
// 						"Failed to fetch logs after 1 minute. They may not be available yet.",
// 					);
// 					if (intervalRef.current) {
// 						console.log(intervalRef.current);
// 						clearInterval(intervalRef.current);
// 					}
// 				}
// 			} else {
// 				setError("An error occurred while fetching logs.");
// 				console.error("Error fetching logs:", error);
// 				if (intervalRef.current) {
// 					console.log(intervalRef.current);
// 					clearInterval(intervalRef.current);
// 				}
// 			}
// 			console.log(error);
// 		}
// 	};

// 	// Initial fetch
// 	fetchLogs();

// 	// Set up interval
// 	intervalRef.current = setInterval(fetchLogs, 2000);

// 	// Cleanup function
// 	return () => {
// 		if (intervalRef.current) {
// 			clearInterval(intervalRef.current);
// 		}
// 	};
// }, [name, repoUrl, setLogs]);
