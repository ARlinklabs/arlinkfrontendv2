"use client";

import { Rocket, Trash2, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";

import { BUILDER_BACKEND, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGlobalState } from "@/store/useGlobalState";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { runLua } from "@/lib/ao-vars";
import { useEffect, useState } from "react";
import useDeploymentManager from "@/hooks/useDeploymentManager";
import axios from "axios";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Logs } from "@/components/ui/logs";
import { handleFetchLogs } from "../depoly/utilts";

export default function DeploymentSetting() {
    // global states
    const [searchParams] = useSearchParams();
    const { managerProcess, deployments, refresh } = useDeploymentManager();
    const repo = searchParams.get("repo");
    const navigate = useNavigate();
    const globalState = useGlobalState();
    const deployment = globalState.deployments.find((d) => d.Name === repo);

    // setting states
    const [activeTab, setActiveTab] = useState("redeploy");
    const [showSidebar, setShowSidebar] = useState(true);
    const [error, setError] = useState<string>("");

    // loading state
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isRedeploying, setIsRedeploying] = useState<boolean>(false);
    const [buildOutput, setBuildOutput] = useState<string[]>([]);
    const [isWaitingForLogs, setIsWaitingForLogs] = useState<boolean>(false);
    const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(false);

    //logs
    const [logs, setLogs] = useState<string[]>([]);
    const [logError, setLogError] = useState<string>("");
    const [accordionValue, setAccordionValue] = useState<string | undefined>(
        undefined
    );

    const toggleSidebar = () => setShowSidebar(!showSidebar);
    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        setShowSidebar(false);
    };

    async function deleteDeployment() {
        setIsDeleting(true);
        if (!deployment) return toast.error("Deployment not found");
        if (!globalState.managerProcess)
            return toast.error("Manager process not found");

        const query = `local res = db:exec[[
          DELETE FROM Deployments
          WHERE Name = '${deployment.Name}'
        ]]`;

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
        } finally {
            setIsDeleting(false);
        }
    }

    async function redeploy() {
        if (!deployment) return;
        const projName = deployment.Name;
        const repoUrl = deployment.RepoUrl;
        const installCommand = deployment.InstallCMD;
        const buildCommand = deployment.BuildCMD;
        const outputDir = deployment.OutputDIR;
        const arnsProcess = deployment.ArnsProcess;
        const branch = deployment.Branch || "main";
        setIsRedeploying(true);
        setBuildOutput([]);
        setError("");

        try {
            handleFetchLogs({
                projectName: projName,
                repoUrl,
                setLogs,
                setIsWaitingForLogs,
                setIsFetchingLogs,
                isWaitingForLogs,
                setLogError,
            });
            const txid = await axios.post(`${BUILDER_BACKEND}/deploy`, {
                repository: repoUrl,
                branch,
                installCommand,
                buildCommand,
                outputDir,
                subDirectory: "./",
            });

            if (txid.status == 200) {
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
            } else {
                toast.error("Deployment failed");
                console.log(txid);
                setError("Deployment failed. Please try again.");
            }
        } catch (error) {
            toast.error("Deployment failed");
            console.log(error);
            setError(
                "An error occurred during deployment. Please try again later."
            );
        } finally {
            setIsRedeploying(false);
        }
    }

    useEffect(() => {
        if (isFetchingLogs) {
            setAccordionValue("item-1");
        }
    }, [isFetchingLogs]);

    return (
        <div className="flex flex-col md:py-8 md:flex-row container bg-black min-h-screen">
            <div
                className={cn(
                    "w-full md:w-48 border-neutral-800 md:p-4",
                    showSidebar ? "block" : "hidden md:block",
                    "md:static inset-0 z-50 py-4 bg-black md:bg-transparent"
                )}
            >
                <nav className="space-y-1">
                    {["redeploy", "delete", "update-arns"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabClick(tab)}
                            className={cn(
                                "flex items-center w-full md:px-3 py-2 text-sm rounded-md transition-colors",
                                activeTab === tab
                                    ? "md:bg-neutral-800 md:text-neutral-100"
                                    : "text-neutral-400 md:hover:bg-neutral-800/50 md:hover:text-neutral-100"
                            )}
                        >
                            {tab === "redeploy" && (
                                <Rocket className="mr-2 h-4 w-4" />
                            )}
                            {tab === "delete" && (
                                <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            {tab === "update-arns" && (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            {tab.charAt(0).toUpperCase() +
                                tab.slice(1).replace("-", " ")}
                        </button>
                    ))}
                </nav>
            </div>

            <div
                className={cn(
                    "flex-1 rounded-md mt-4 md:px-4 md:py-4 md:mt-0",
                    showSidebar ? "hidden md:block" : "block"
                )}
            >
                <div className="md:hidden mb-4 flex justify-between items-center">
                    {!showSidebar && (
                        <Button
                            className="bg-transparen p-0 hover:bg-transparent text-neutral-400"
                            onClick={toggleSidebar}
                        >
                            <ArrowLeft />
                            Go back
                        </Button>
                    )}
                </div>
                {activeTab === "redeploy" && (
                    <>
                        <div className="space-y-1">
                            <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">
                                Redeploy
                            </h2>
                            <p className="text-sm text-neutral-400">
                                Are you sure you want to redeploy your
                                application?
                            </p>
                        </div>
                        <Button
                            className="bg-neutral-800 mt-4 text-neutral-100 hover:bg-neutral-700"
                            disabled={isRedeploying}
                            onClick={redeploy}
                        >
                            {isRedeploying ? (
                                <div className="flex items-center gap-4">
                                    <Loader2 className="animate-spin" />
                                    Deploying
                                </div>
                            ) : (
                                <p>Redeploy</p>
                            )}
                        </Button>
                        <div className="space-y-2 w-full mt-8">
                            <Accordion
                                type="single"
                                value={accordionValue}
                                onValueChange={setAccordionValue}
                                collapsible
                                className="w-full"
                            >
                                <AccordionItem
                                    value="item-1"
                                    className="rounded-lg w-full bg-neutral-950 border border-neutral-900 overflow-hidden"
                                >
                                    <AccordionTrigger className="p-4 w-full">
                                        <div className="flex items-center w-full justify-between">
                                            <div className="pl-2">
                                                Build logs
                                            </div>
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
                    </>
                )}
                {activeTab === "delete" && (
                    <>
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">
                                Delete
                            </h2>
                            <p className="text-sm text-neutral-400">
                                Are you sure you want to delete your
                                application? This action cannot be undone.
                            </p>
                        </div>
                        <Button
                            className="mt-4"
                            onClick={deleteDeployment}
                            variant="destructive"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <div className="flex items-center gap-4">
                                    <Loader2 className="animate-spin" />
                                    Deleting
                                </div>
                            ) : (
                                <p>Delete Project</p>
                            )}
                        </Button>
                    </>
                )}
                {activeTab === "update-arns" && (
                    <>
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">
                                Update ARNs
                            </h2>
                            <div className="space-y-2">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="current"
                                        className="text-sm text-neutral-400"
                                    >
                                        Current ARN
                                    </Label>
                                    <Input
                                        id="current"
                                        placeholder="current arns will be displayed here?"
                                        className="bg-neutral-900 border-neutral-800 text-neutral-100 text-xs md:text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="new"
                                        className="text-sm text-neutral-400"
                                    >
                                        New ARN
                                    </Label>
                                    <Input
                                        id="new"
                                        placeholder="Enter new ARN"
                                        className="bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-600 text-xs md:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <Button className="bg-neutral-800 mt-4 text-neutral-100 hover:bg-neutral-700">
                            Update ARN
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
