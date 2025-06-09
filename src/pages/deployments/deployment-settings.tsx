"use client";

import {
    Rocket,
    Trash2,
    RefreshCw,
    ArrowLeft,
    Loader2,
    ChevronDown,
    Check,
    ChevronsUpDown,
    ExternalLink,
    XCircle,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BUILDER_BACKEND, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGlobalState } from "@/store/useGlobalState";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { runLua, setArnsName as setArnsNameWithProcessId } from "@/lib/ao-vars";
import { useEffect, useRef, useState } from "react";
import useDeploymentManager from "@/hooks/use-deployment-manager";
import axios, { isAxiosError } from "axios";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Logs } from "@/components/ui/logs";
import {
    extractOwnerName,
    extractRepoName,
    handleFetchExistingArnsName,
} from "../utilts";
import { useActiveAddress } from "arweave-wallet-kit";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { ArnsName } from "@/types";
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { CommandGroup } from "cmdk";
import { deleteFromServer, performDeleteDeployment } from "@/actions/deploy";

export default function DeploymentSetting() {
    // global states
    const [searchParams] = useSearchParams();
    const { refresh } = useDeploymentManager();
    const repo = searchParams.get("repo");
    const navigate = useNavigate();
    const globalState = useGlobalState();
    const deployment = globalState.deployments.find((d) => d.Name === repo);

    // setting states
    const [activeTab, setActiveTab] = useState("redeploy");
    const [showSidebar, setShowSidebar] = useState(true);
    const [, setError] = useState<string>("");

    // loading state
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isRedeploying, setIsRedeploying] = useState<boolean>(false);
    const [, setBuildOutput] = useState<string[]>([]);
    const deploymentFailedRef = useRef(false);
    const [isWaitingForLogs, setIsWaitingForLogs] = useState<boolean>(false);
    const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(false);
    const [deploymentFailed, setDeploymentFailed] = useState<boolean>(false);
    const [showRedployWarning, setRedeployWarning] = useState<boolean>(true);

    //logs
    const [logs, setLogs] = useState<string[]>([]);
    const [logError, setLogError] = useState<string>("");
    const [accordionValue, setAccordionValue] = useState<string | undefined>(
        undefined,
    );

    const toggleSidebar = () => setShowSidebar(!showSidebar);
    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        setShowSidebar(false);
    };

    // arns data
    const activeAddress = useActiveAddress();
    // const [arnsNames, setArnsNames] = useState<ArnsName[]>([
    //     { name: "my-app-1.arweave", processId: "process-123" },
    //     { name: "my-app-2.arweave", processId: "process-456" },
    //     { name: "test-app.arweave", processId: "process-789" },
    //     { name: "demo-app.arweave", processId: "process-012" },
    // ]);

    const [arnsNames, setArnsNames] = useState<ArnsName[]>([]);
    const [existingArnsLoading, setExistingArnsLoading] =
        useState<boolean>(false);
    const [arnsDropdownModal, setArnsDropDownModal] = useState(false);
    const [arnsName, setArnsName] = useState<ArnsName | undefined>(undefined);
    const [arnsProcess, setArnsProcess] = useState<string | undefined>(
        undefined,
    );
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [updatingArns, setUpdatingArns] = useState<boolean>(false);

    async function deleteDeployment() {
        setIsDeleting(true);
        if (!deployment) {
            toast.error("Deployment not found");
            setIsDeleting(false);
            return;
        }
        if (!globalState.managerProcess) {
            toast.error("Manager process not found");
            setIsDeleting(false);
            return;
        }

        try {
            const ownerName = extractOwnerName(deployment.RepoUrl);
            // technical debt need to fix error handling here 
            const repoProjectName = extractRepoName(deployment.RepoUrl);
                await deleteFromServer({
                ownerName,
                repoProjectName,
            });
            
            // Always perform delete deployment after server delete completes
            await performDeleteDeployment(
                deployment.Name,
                globalState.managerProcess,
                refresh,
            );
            
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
        const isGithub = deployment.RepoUrl.includes("github.com");
        if (!isGithub) toast.error("protocol land is not supported");
        if (isRedeploying) return;

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

        const ownerName = extractOwnerName(repoUrl);
        const repoName = extractRepoName(repoUrl);

        const POLLING_INTERVAL = 2000;
        const MAX_POLLING_TIME = 600000;
        const startTime = Date.now();
        let intervalId: NodeJS.Timeout | null = null;

        const clearIntervalPolling = () => {
            console.log("stopping polling");
            if (intervalId) {
                setIsFetchingLogs(false);
                setIsWaitingForLogs(false);
                clearInterval(intervalId);
            }
        };

        // Start the log polling in parallel
        const logPollingPromise = async () => {
            setIsWaitingForLogs(true);
            await new Promise((resolve) => setTimeout(resolve, 10000));
            setIsWaitingForLogs(false);
            setIsFetchingLogs(true);

            const fetchLogs = async () => {
                console.log("started polling");
                if (deploymentFailedRef.current) {
                    clearIntervalPolling();
                }
                if (Date.now() - startTime > MAX_POLLING_TIME) {
                    clearIntervalPolling();
                    setDeploymentFailed(true);
                    return;
                }

                try {
                    const logs = await axios.get(
                        `${BUILDER_BACKEND}/logs/${ownerName}/${repoName}`,
                    );
                    setLogs(logs.data.split("\n"));
                } catch (error) {
                    console.log(deploymentFailed);
                    if (isAxiosError(error)) {
                        if (deploymentFailed) {
                            clearIntervalPolling();
                        }
                    }
                    // I don't want to see red red spams in the logs xD
                }
            };

            intervalId = setInterval(fetchLogs, POLLING_INTERVAL);
        };

        if (!deploymentFailedRef.current) {
            logPollingPromise();
        }

        try {
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
                    { name: "TTL-Seconds", value: "900" },
                ]);

                await runLua(
                    `db:exec[[UPDATE Deployments SET DeploymentId='${txid.data}' WHERE Name='${projName}']]`,
                    globalState.managerProcess,
                );

                navigate(`/deployment?repo=${projName}`);
                await refresh();
            } else {
                setIsFetchingLogs(false);
                setIsWaitingForLogs(false);
                console.log(txid);
                deploymentFailedRef.current = true;
                setDeploymentFailed(true);
                setError("Deployment failed. Please try again.");
                setLogError("Deployment failed. Please try again.");
                clearIntervalPolling();
            }
        } catch (error) {
            setIsFetchingLogs(false);
            setDeploymentFailed(true);
            deploymentFailedRef.current = true;
            clearIntervalPolling();
            toast.error("Deployment failed");
            console.log(error);
            setError(
                "An error occurred during deployment. Please try again later.",
            );
            setLogError(
                "An error occurred during deployment. Please try again later.",
            );
        } finally {
            setIsRedeploying(false);
        }
    }

    useEffect(() => {});

    useEffect(() => {
        console.log({
            ref: deploymentFailedRef.current,
            deploymentFailed,
        });
    }, [deploymentFailed]);

    useEffect(() => {
        setIsFetchingLogs(false);
        setIsWaitingForLogs(false);
    }, [deploymentFailedRef.current]);

    async function handleArnsSelection(arnsName: ArnsName) {
        setArnsProcess(arnsName.processId);
        setArnsName(
            arnsNames.find((arns) => arns.processId === arnsName.processId),
        );
        setArnsDropDownModal(false);
    }

    useEffect(() => {
        if (isFetchingLogs && !deploymentFailedRef.current) {
            setAccordionValue("item-1");
        }
    }, [isFetchingLogs]);

    const handleFetchArns = async () => {
        await handleFetchExistingArnsName({
            setArnsNames,
            activeAddress,
            setExistingArnsLoading,
        });
    };

    useEffect(() => {
        handleFetchArns();
    }, []);

    const hanldeUpdateArns = async () => {
        try {
            setUpdatingArns(true);
            if (!arnsName) toast.error("select an arns name");
            if (deployment && arnsName) {
                const txid = await setArnsNameWithProcessId(
                    arnsName.processId,
                    deployment.DeploymentId,
                );
                setTransactionId(txid);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setUpdatingArns(false);
        }
    };

    useEffect(() => {
        if (transactionId) {
            setIsOpen(true);
        }
    }, [transactionId]);

    return (
        <div className="flex flex-col z-0 md:py-8 md:flex-row container bg-random min-h-[80vh]">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px] bg-neutral-950 border border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-neutral-100">
                            Your arns will be set shortly
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            This is the transactionId{" "}
                            <strong>{transactionId}</strong>, you can use this
                            transactionId to keep the track of your progress
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <div className="col-span-4 text-neutral-100">
                                Link
                                <div className="hover:underline pt-1 text-neutral-300">
                                    <Link
                                        to={`https://www.ao.link/#/message/${transactionId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex text-sm hover:underline items-center gap-2 hover:text-neutral-100 transition-colors duration-200"
                                    >
                                        Check to see the progress
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setTransactionId(null);
                                setIsOpen(false);
                            }}
                            className="bg-neutral-800 text-neutral-100 border-neutral-700 hover:bg-neutral-700 hover:text-neutral-100"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <div
                className={cn(
                    "w-full md:w-48 z-20 border-neutral-800 md:p-4",
                    showSidebar ? "block" : "hidden md:block",
                    "md:static inset-0 z-50 py-4 bg-random md:bg-transparent",
                )}
            >
                <nav className="space-y-1">
                    {["redeploy", "delete", "configure-arns"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabClick(tab)}
                            className={cn(
                                "flex items-center w-full md:px-3 py-2 text-sm rounded-md transition-colors",
                                activeTab === tab
                                    ? "md:bg-neutral-800 md:text-neutral-100"
                                    : "text-neutral-400 md:hover:bg-neutral-800/50 md:hover:text-neutral-100",
                            )}
                        >
                            {tab === "redeploy" && (
                                <Rocket className="mr-2 h-4 w-4" />
                            )}
                            {tab === "delete" && (
                                <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            {tab === "configure-arns" && (
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
                    showSidebar ? "hidden md:block" : "block",
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
                        <div className="space-y-4">
                            {showRedployWarning && (
                                <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-4 flex flex-col">
                                    <div className="font-semibold pb-2 text-yellow-500 ">
                                        Warning
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div>
                                            <ul className="text-sm text-yellow-500 leading-relaxed list-disc pl-4">
                                                <li>
                                                    This feature will only work
                                                    if you have a new commit in
                                                    your repo
                                                </li>
                                                <li>
                                                    This feature is not
                                                    available for the protocol
                                                    land
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="flex justify-start mt-3">
                                        <button
                                            onClick={() =>
                                                setRedeployWarning(false)
                                            }
                                            className="px-3 py-1.5 text-sm font-medium text-yellow-500 hover:text-yellow-400 bg-yellow-900/30 transition-colors rounded-md hover:bg-yellow-900/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/40"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">
                                    Redeploy
                                </h2>
                                <p className="text-sm text-neutral-400">
                                    Are you sure you want to redeploy your
                                    application?
                                </p>
                            </div>
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

                            {logError && (
                                <div className="flex items-center gap-2 p-4 rounded-lg bg-red-950/50 border border-red-900">
                                    <XCircle
                                        className="text-red-500"
                                        size={20}
                                    />
                                    <p className="text-red-400 text-sm">
                                        {logError}
                                    </p>
                                </div>
                            )}
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
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    className="mt-4"
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
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action is irreversible.
                                        The data will be deleted from the our
                                        records  but all deployments will
                                        remain permanently stored on Arweave
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-700 hover:bg-red-800 text-white font-bold"
                                        onClick={deleteDeployment}
                                    >
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )}

                {activeTab === "configure-arns" && (
                    <>
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">
                                Configure Arns
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
                                        value={deployment?.UnderName}
                                        placeholder="current arns will be displayed here?"
                                        className="bg-neutral-900 border-neutral-800 text-neutral-100 text-xs md:text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="current"
                                        className="text-sm pt-2 text-neutral-400"
                                    >
                                        Available arns
                                    </Label>
                                    {existingArnsLoading ? (
                                        <Skeleton className="w-full flex items-center justify-between gap-3 px-3 h-10 text-center focus:ring-0 focus:ring-offset-0 outline-none  bg-neutral-900 border-[#383838] text-white">
                                            <div className="flex items-center gap-3">
                                                Fetching existing arns
                                                <Loader2
                                                    size={15}
                                                    className="animate-spin"
                                                />
                                            </div>
                                            <ChevronDown size={15} />
                                        </Skeleton>
                                    ) : (
                                        <div>
                                            <Popover
                                                open={arnsDropdownModal}
                                                onOpenChange={
                                                    setArnsDropDownModal
                                                }
                                            >
                                                <PopoverTrigger
                                                    className="w-full border  bg-arlink-bg-secondary-color border-neutral-700"
                                                    asChild
                                                >
                                                    <Button
                                                        variant="outline"
                                                        aria-expanded={
                                                            arnsDropdownModal
                                                        }
                                                        className=" justify-between"
                                                    >
                                                        {arnsName
                                                            ? arnsName.name
                                                            : "Select an arns name"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="p-0 transition-all border-[#383838] bg-arlink-bg-secondary-color
                                                 w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]
                                             "
                                                >
                                                    <Command className="w-full bg-arlink-bg-secondary-color">
                                                        <CommandInput placeholder="Select an existing arns..." />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                No arns found.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {arnsNames.map(
                                                                    (
                                                                        arnsObj,
                                                                    ) => (
                                                                        <CommandItem
                                                                            key={
                                                                                arnsObj.processId
                                                                            }
                                                                            value={
                                                                                arnsObj.name
                                                                            }
                                                                            className="transition-all duration-75"
                                                                            onSelect={() => {
                                                                                handleArnsSelection(
                                                                                    {
                                                                                        processId:
                                                                                            arnsObj.processId,
                                                                                        name: arnsObj.name,
                                                                                    },
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    arnsName?.name ===
                                                                                        arnsObj.name
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0",
                                                                                )}
                                                                            />
                                                                            {
                                                                                arnsObj.name
                                                                            }
                                                                        </CommandItem>
                                                                    ),
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={hanldeUpdateArns}
                            className="bg-neutral-800 mt-4 text-neutral-100 hover:bg-neutral-700"
                            disabled={updatingArns}
                        >
                            {updatingArns ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating ARN...
                                </>
                            ) : (
                                "Update ARN"
                            )}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
