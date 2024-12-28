import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { extractOwnerName, extractRepoName } from "./utilts";
import axios, { isAxiosError } from "axios";
import { BUILDER_BACKEND } from "@/lib/utils";

const DeploymentLogs = ({
	projectName,
	repoUrl,
	logs,
	setLogs,
}: {
	projectName: string;
	repoUrl: string;
	logs: string[];
	setLogs: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
	return (
		<div className="bg-arlink-bg-secondary-color p-6 rounded-lg mt-6 border border-[#383838]">
			<h2 className="text-xl font-semibold mb-4">Deployment Process</h2>
			<div className="space-y-2 w-full">
				<Accordion type="single" collapsible className="w-full">
					<AccordionItem
						value="item-1"
						className="border rounded-lg overflow-hidden"
					>
						<AccordionTrigger className={"p-4"}>Build logs</AccordionTrigger>
						<AccordionContent>
							<Logs
								logs={logs}
								setLogs={setLogs}
								name={projectName}
								deploying={false}
								repoUrl={repoUrl}
							/>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
};

function Logs({
	name,
	deploying,
	repoUrl,
	logs,
	setLogs,
}: {
	name: string;
	deploying?: boolean;
	repoUrl: string;
	logs: string[];
	setLogs: React.Dispatch<React.SetStateAction<string[]>>;
}) {
	console.log(name);
	// const [logs, setLogs] = useState<string[]>([
	// 	"Build started at Sat Dec 28 07:40:35 UTC 2024",
	// 	"Repository: https://ghu_mJXttRtPJhH3UmkmCx8Yhc5iVPhFZx0Xhefk@github.com/DMZTdhruv/demo-test.git (Branch: main)",
	// 	"Build Directory: /home/dmztdhruv/code/arlink/backend/builds/DMZTdhruv/demo-test",
	// 	"Cloning repository...",
	// 	"Installing dependencies...",
	// 	"",
	// 	"added 142 packages, and audited 143 packages in 53s",
	// 	"",
	// 	"40 packages are looking for funding",
	// 	"  run `npm fund` for details",
	// 	"",
	// 	"found 0 vulnerabilities",
	// 	"Building project...",
	// 	"",
	// 	"> arlink-demo-test-repo-1@0.0.0 build",
	// 	"> tsc -b && vite build",
	// 	"",
	// 	"vite v6.0.6 building for production...",
	// 	"transforming...",
	// 	"",
	// 	"WARNING: Deprecation notice: The `example-package` will no longer be maintained after Dec 2025.",
	// 	"ERROR: Failed to resolve module `non-existent-module`. Ensure the module exists and is installed correctly.",
	// 	"WARNING: Skipped optimization for large file: /path/to/large/file.js",
	// 	"ERROR: Build failed due to syntax error in `/src/components/Header.js:45:12`",
	// 	"WARNING: Unused dependency detected: `unused-package`",
	// 	"ERROR: Out of memory while processing `/src/assets/large-image.png`. Consider increasing memory allocation.",
	// ]);
	const [error, setError] = useState<string | null>(null);
	const intervalRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		console.log(logs);
	}, [logs]);

	useEffect(() => {
		if (!name || !repoUrl) return;

		const repo = extractRepoName(repoUrl);
		const owner = extractOwnerName(repoUrl);
		const startTime = Date.now();
		const waitTime = 10000;

		const fetchLogs = async () => {
			try {
				const logs = await axios.get(
					`${BUILDER_BACKEND}/logs/${owner}/${repo}`,
				);

				setLogs(logs.data.split("\n"));
			} catch (error) {
				if (isAxiosError(error) && error.response?.status === 404) {
					const elapsedTime = Date.now() - startTime;
					if (elapsedTime < waitTime) {
						setError("Waiting for logs...");
					} else {
						setError(
							"Failed to fetch logs after 1 minute. They may not be available yet.",
						);
						if (intervalRef.current) {
							console.log(intervalRef.current);
							clearInterval(intervalRef.current);
						}
					}
				} else {
					setError("An error occurred while fetching logs.");
					console.error("Error fetching logs:", error);
					if (intervalRef.current) {
						console.log(intervalRef.current);
						clearInterval(intervalRef.current);
					}
				}
				console.log(error);
			}
		};

		// Initial fetch
		fetchLogs();

		// Set up interval
		intervalRef.current = setInterval(fetchLogs, 2000);

		// Cleanup function
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [name, repoUrl, setLogs]);

	useEffect(() => {
		if (error && error !== "Waiting for logs...") {
			toast.error("Error", {
				description: error,
			});
		}
	}, [error]);

	return (
		<div className="w-full">
			<div className="w-full border-t border-neutral-800 mx-auto bg-neutral-950 overflow-hidden">
				<div className="h-96 overflow-y-scroll overflow-x-hidden">
					<div className="font-mono py-4 text-sm leading-6 cursor-default">
						{logs
							.filter((line) => (line.length !== 0 ? line : null))
							.map((line, index) => (
								<div
									key={line}
									className={`flex ${
										line.toLowerCase().includes("error")
											? "bg-red-900/50 hover:bg-red-900/80"
											: line.toLowerCase().includes("warning")
												? "bg-yellow-500/20 hover:bg-yellow-500/30"
												: "hover:bg-neutral-800"
									}  py-0.25  `}
								>
									<span className="text-neutral-500 w-12 flex-shrink-0 text-right pr-4">
										{index + 1}
									</span>
									<span
										className={` ${
											line.toLowerCase().includes("error")
												? "text-red-400"
												: line.toLowerCase().includes("warning")
													? "text-yellow-400"
													: "text-white"
										} flex-1`}
									>
										{line}
									</span>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);
}
export default DeploymentLogs;
