import { useEffect, useMemo, useRef, useState } from "react";
import {
    Check,
    ChevronsUpDown,
    Cog,
    Copy,
    ExternalLink,
    GitBranch,
    GitBranchIcon,
    Github,
    Loader2,
    RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import useDeploymentManager, {
    getDeploymentHistoryFromGraphQL,
} from "@/hooks/use-deployment-manager";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useGlobalState } from "@/store/useGlobalState";
import { ArnsName, DeploymentRecord, TDeployment } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn, setUndername } from "@/lib/utils";
import { runLua, setArnsName } from "@/lib/ao-vars";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    handleFetchExistingArnsName,
} from "../utilts";
import { useAddress, useAoSigner } from "ao-wallet-kit";
import { TransactionDialog } from "@/components/transactionBlock";

// Helper function to format date as relative time
function formatRelativeTime(dateString: string): string {
    try {
        // Parse date string format: "YYYY-MM-DD HH:MM:SS"
        const deploymentDate = new Date(dateString.replace(' ', 'T') + 'Z');
        const now = new Date();
        const diffMs = now.getTime() - deploymentDate.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);

        if (diffSeconds < 60) {
            return diffSeconds === 1 ? '1 second ago' : `${diffSeconds} seconds ago`;
        } else if (diffMinutes < 60) {
            return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
        } else if (diffHours < 24) {
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        } else if (diffDays < 7) {
            return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
        } else if (diffWeeks < 4) {
            return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
        } else {
            // For older dates, show the actual date
            return dateString.split(' ')[0]; // Return just the date part (YYYY-MM-DD)
        }
    } catch (error) {
        // Fallback to original string if parsing fails
        return dateString;
    }
}

export default function DeploymentHistory() {
    // hooks

    const { deployments, isRefreshing, walletAddress } = useDeploymentManager();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const repoName = searchParams.get("repo");

    // Early redirect check for missing repo parameter
    useEffect(() => {
        if (!repoName) {
            toast.error("No repository specified");
            navigate("/dashboard");
            return;
        }
    }, [repoName, navigate]);

    const [history, setHistory] = useState<DeploymentRecord[]>([]);

    // Memoize foundDeployment to prevent unnecessary rerenders
    const foundDeployment = useMemo(
        () => deployments.find((d) => d.Name === repoName),
        [deployments, repoName]
    );

    // loading and error states
    const [loadingDeploymentHistory, setLoadingDeploymentHistory] =
        useState<boolean>(false);
    const activeAddress = useAddress();
    const { signer, isLoading: signerLoading } = useAoSigner();
    
    // Track if we've already fetched history to prevent duplicate fetches
    const hasFetchedRef = useRef(false);
    
    // Show loading state only when we don't have the deployment data yet
    // Don't show loading if we're just refreshing existing data
    if (!foundDeployment && (isRefreshing || (walletAddress && deployments.length === 0))) {
        return (
            <div className="min-h-screen text-neutral-200">
                <div className="w-full px-4 py-10 md:px-[40px]">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold flex items-center tracking-tight text-neutral-100">
                                Deployment history
                            </h1>
                            <div className="flex items-center space-x-2 text-sm text-neutral-400">
                                <GitBranchIcon className="h-4 w-4" />
                                <span>Loading deployment history...</span>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2 rounded-md">
                            <MinimalDeploymentSkeleton />
                            <MinimalDeploymentSkeleton />
                            <MinimalDeploymentSkeleton />
                            <MinimalDeploymentSkeleton />
                            <MinimalDeploymentSkeleton />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!foundDeployment) {
        toast.error("Deployment not found");
        navigate("/dashboard");
        return (
            <div className="min-h-screen text-neutral-200">
                <div className="w-full px-4 py-10 md:px-[40px]">
                    <div className="text-xl">Searching for deployment...</div>
                </div>
            </div>
        );
    }

    const [arnsNames, setArnsNames] = useState<ArnsName[]>([]);
    const [fetchingUserArns, setFetchingUserArns] = useState<boolean>(false);

    useEffect(() => {
        if (!repoName || !foundDeployment) {
            hasFetchedRef.current = false;
            return;
        }
        
        // Prevent duplicate fetches
        if (hasFetchedRef.current) {
            return;
        }
        
        const fetchHistory = async () => {
            hasFetchedRef.current = true;
            setLoadingDeploymentHistory(true);
            try {
                let historyResult;
                
                // Use GraphQL method if deployment has an undername (ArNS users)
                // GraphQL doesn't require signer - it's just a read query
                if (foundDeployment.UnderName && foundDeployment.ArnsProcess) {
                    console.log('[DeploymentHistory] Using GraphQL method for ArNS deployment');
                    console.log('[DeploymentHistory] Undername:', foundDeployment.UnderName);
                    console.log('[DeploymentHistory] ArNS Process:', foundDeployment.ArnsProcess);
                    
                    // Query GraphQL for Set-Record transactions by undername (no signer needed)
                    historyResult = await getDeploymentHistoryFromGraphQL(
                        foundDeployment.UnderName,
                        foundDeployment.Name,
                    );
                } else {
                    console.log('[DeploymentHistory] Using legacy Lua method for non-ArNS deployment');
                    historyResult = await getDeploymentHistoryFromGraphQL(
                        foundDeployment.UnderName,
                        foundDeployment.Name,
                    
                    );
                }

                console.log('[DeploymentHistory] History fetched:', {
                    history: historyResult.history,
                    historyLength: historyResult.history?.length,
                    error: historyResult.error?.message,
                    historyIsArray: Array.isArray(historyResult.history),
                });
                
                if (historyResult.error) {
                    console.error('[DeploymentHistory] Error:', historyResult.error.message);
                    toast.error("Failed to load deployment history", {
                        description: historyResult.error.message,
                    });
                }
                
                // Ensure history is always an array, even if undefined/null
                const historyArray = Array.isArray(historyResult.history) 
                    ? historyResult.history 
                    : [];
                
                console.log('[DeploymentHistory] Setting history state:', {
                    arrayLength: historyArray.length,
                    firstRecord: historyArray[0],
                });
                
                // GraphQL already returns newest first (INGESTED_AT_DESC), no reverse needed
                setHistory(historyArray);
            } catch (error) {
                console.error('[DeploymentHistory] Failed to fetch history:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch history';
                toast.error("Failed to load deployment history", {
                    description: errorMessage,
                });
                hasFetchedRef.current = false; // Allow retry on error
            } finally {
                setLoadingDeploymentHistory(false);
            }
        };

        fetchHistory();
        // Note: signer, signerLoading, managerProcess are not needed for GraphQL queries
        // They're included for backward compatibility with legacy Lua method
    }, [repoName, foundDeployment]);

    const fetchArnsUndername = () => {
        try {
            handleFetchExistingArnsName({
                setArnsNames,
                activeAddress: activeAddress || undefined,
                setExistingArnsLoading: setFetchingUserArns,
            });
        } catch (error) {}
    };

    useEffect(() => {
        fetchArnsUndername();
    }, []);

    return (
        <div className="min-h-screen text-neutral-200">
            <div className="w-full px-4 py-10 md:px-[40px]">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold flex items-center tracking-tight text-neutral-100">
                            Deployment history
                        </h1>
                        <div className="flex items-center space-x-2 text-sm text-neutral-400">
                            <GitBranchIcon className="h-4 w-4" />
                            <span>
                                Review your complete deployment history,
                                navigate to any deployment, or modify ARNs as
                                needed
                            </span>
                        </div>
                    </div>

                    <Separator />
                    {/* <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                            <Input
                                placeholder="Search deployments..."
                                className="pl-9 w-full bg-arlink-bg-secondary-color border-neutral-800 text-neutral-200 placeholder-neutral-500"
                                onChange={(e) =>
                                    setDeploymentName(e.target.value)
                                }
                                value={deploymentName}
                            />
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-[240px] justify-start text-left font-normal bg-arlink-bg-secondary-color border-neutral-800 text-neutral-200"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? (
                                            format(date, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 bg-arlink-bg-secondary-color border-neutral-800"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        className="bg-arlink-bg-secondary-color text-neutral-200"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div> */}

                    <div className="space-y-2 rounded-md">
                        {loadingDeploymentHistory ? (
                            <>
                                <MinimalDeploymentSkeleton />
                                <MinimalDeploymentSkeleton />
                                <MinimalDeploymentSkeleton />
                                <MinimalDeploymentSkeleton />
                                <MinimalDeploymentSkeleton />
                            </>
                        ) : history.length === 0 ? (
                            <div className="p-6 rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80 text-center">
                                <p className="text-neutral-400">No deployment history found</p>
                                <p className="text-sm mt-2 text-neutral-500">
                                    This deployment hasn't been deployed yet, or history data is unavailable.
                                </p>
                            </div>
                        ) : (
                            history.map((deployment, index) => (
                                <DeploymentHistoryCard
                                    key={`${deployment.DeploymentID}-${index}`}
                                    deployment={deployment}
                                    currentDeployment={foundDeployment}
                                    index={index}
                                    fetchingUserArns={fetchingUserArns}
                                    arnsNames={arnsNames}
                                    signer={signer}
                                    signerLoading={signerLoading}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const DeploymentHistoryCard = ({
    deployment,
    currentDeployment,
    index,
    fetchingUserArns,
    arnsNames,
    signer,
    signerLoading,
}: {
    deployment: DeploymentRecord;
    currentDeployment: TDeployment;
    index: number;
    fetchingUserArns: boolean;
    arnsNames: ArnsName[];
    signer: any;
    signerLoading: boolean;
}) => {
    const [rollBackStarted, setRollBackStarted] = useState(false);
    const { refresh } = useDeploymentManager();
    const navigate = useNavigate();

    const [rollBackTransactionIdFetched, setRollBackTransactionIdFetched] =
        useState(false);

    const [transactionId, setTransactionId] = useState<string | null>(null);

    const handleRollBack = async (deploymentID: string) => {
        if (!currentDeployment.ArnsProcess) {
            setRollBackTransactionIdFetched(false);
            setRollBackStarted(true);
            
            if (!signer || signerLoading) {
                toast.error("Please connect your wallet to rollback");
                setRollBackStarted(false);
                return;
            }
            
            const txid = await setArnsName(
                currentDeployment.ArnsProcess,
                deploymentID,
                "@",
                signer,
            );

            setRollBackStarted(false);
            if (txid) {
                setTransactionId(txid);
                setRollBackTransactionIdFetched(true);
                await refresh();
                navigate(`/deployment?repo=${currentDeployment.Name}`);
            } else {
                toast.error("Failed to rollback");
            }
        }
    };

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCloseDialog = () => {
        setTransactionId(null);
        setIsDialogOpen(false);
    };

    useEffect(() => {
        if (transactionId) {
            console.log("hello from transactiond Id ");
            setIsDialogOpen(true);
        }
    }, [transactionId]);

    return (
        <>
            {transactionId && (
                <TransactionDialog
                    isOpen={isDialogOpen}
                    setIsOpen={setIsDialogOpen}
                    transactionId={transactionId}
                    onClose={handleCloseDialog}
                    title={"Your process has been started"}
                />
            )}

            <div
                key={`${deployment.DeploymentID}`}
                className="p-4 sm:p-6 flex flex-col sm:flex-row rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80 hover:bg-arlink-bg-secondary-color items-start sm:items-center justify-between"
            >
                {/* left - column */}
                <div className="space-y-4 sm:space-y-6 w-full sm:w-auto">
                    <div className="space-y-2">
                        <h3 className="text-lg sm:text-xl flex flex-wrap items-center gap-2 sm:gap-4 font-semibold">
                            {deployment.Name}
                            {index === 0 && (
                                <span className="inline-flex items-center text-sm gap-2">
                                    <span className="size-2 inline-block rounded-full bg-cyan-200" />{" "}
                                    Current
                                </span>
                            )}
                        </h3>
                        <div className="flex flex-col text-sm text-neutral-500 mt-1">
                            <div className="flex-center gap-2">
                                <span className="text-white">Id</span>
                                <span className="pl-4 text-wrap">
                                    {deployment.DeploymentID}
                                </span>
                                <button
                                    type="button"
                                    aria-label="Copy deployment ID"
                                    onClick={() => {
                                        navigator.clipboard.writeText(deployment.DeploymentID)
                                            .then(() => {
                                                console.log("Deployment ID copied to clipboard");
                                            })
                                            .catch(err => {
                                                console.error("Failed to copy: ", err);
                                            });
                                    }}
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                            <div className="flex-center gap-2">
                                <span className="text-white">Live</span>{" "}
                                <Link
                                    to={`https://${currentDeployment?.UnderName}_arlink.arweave.net`}
                                    className="hover:underline"
                                    target="_blank"
                                >
                                    https://
                                    {currentDeployment?.UnderName}
                                    _arlink.arweave.net
                                </Link>
                                <button
                                    type="button"
                                    aria-label="Copy deployment ID"
                                >
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Only show buttons when ArnsProcess exists and is different from UnderName */}
                    {currentDeployment.ArnsProcess && 
                     currentDeployment.UnderName && 
                     currentDeployment.ArnsProcess !== currentDeployment.UnderName ? (
                        <div className="flex flex-wrap items-center gap-2">
                            {index !== 0 && (
                                <Dialog>
                                    <DialogTrigger>
                                        <Button
                                            size={"sm"}
                                            className="flex items-center -transparent text-sm gap-2 px-4 font-semibold rounded-xl"
                                            disabled={
                                                rollBackTransactionIdFetched
                                            }
                                        >
                                            <RefreshCcw />
                                            Roll back
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-neutral-950 border-neutral-900 ">
                                        <DialogHeader>
                                            <DialogTitle>
                                                {rollBackTransactionIdFetched
                                                    ? "Your roll back is in process"
                                                    : "Roll back your changes"}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {rollBackTransactionIdFetched
                                                    ? "Roll back is in progress you can close this"
                                                    : "Do you want to roll back to this deployment? "}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <div className="w-full ">
                                                {!rollBackTransactionIdFetched ? (
                                                    <Button
                                                        className="font-semibold tracking-tight rounded-lg"
                                                        size={"sm"}
                                                        disabled={
                                                            rollBackStarted
                                                        }
                                                        onClick={() => {
                                                            handleRollBack(
                                                                deployment.DeploymentID,
                                                            );
                                                        }}
                                                    >
                                                        {rollBackStarted && (
                                                            <Loader2 className="animate-spin" />
                                                        )}
                                                        {rollBackStarted
                                                            ? "Saving"
                                                            : "Save"}{" "}
                                                        changes
                                                    </Button>
                                                ) : (
                                                    <DialogClose>
                                                        Close
                                                    </DialogClose>
                                                )}
                                            </div>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                            <Dialog>
                                <DialogTrigger>
                                    <Button
                                        size={"sm"}
                                        variant={"outline"}
                                        className="flex items-center bg-transparent text-sm gap-2 px-4 font-semibold rounded-xl"
                                    >
                                        <Cog />
                                        Manage arns
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-neutral-950 border-neutral-900">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Manage your arns here
                                        </DialogTitle>
                                        <DialogDescription>
                                            <ArnsTabSelector
                                                fetchingUserArns={
                                                    fetchingUserArns
                                                }
                                                arnsNames={arnsNames}
                                                deployment={deployment}
                                                currentDeployment={
                                                    currentDeployment
                                                }
                                                signer={signer}
                                                signerLoading={signerLoading}
                                            />
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : null}
                </div>
                {/* right - column */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 mt-4 sm:mt-0">
                    {/* first column */}
                    <div className="space-y-4 sm:space-y-8 sm:text-normal text-sm flex flex-col items-start">
                        <Link
                            to={`${currentDeployment.RepoUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center hover:underline cursor-pointer gap-2"
                        >
                            <Github size={20} /> Github
                        </Link>
                        <Link
                            to={`https://arweave.net/${deployment.DeploymentID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center hover:underline cursor-pointer gap-2"
                        >
                            <ExternalLink size={20} /> Visit
                        </Link>
                    </div>
                    <div className="space-y-4 sm:space-y-8 flex flex-col items-start sm:items-end">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-2 rounded-full bg-neutral-800/30 px-3 py-1">
                                <GitBranch className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-full bg-neutral-800/30 px-3 py-1">
                                <div className="w-2 h-2 rounded-full bg-neutral-400" />
                                <span className="text-neutral-400 text-sm -translate-y-[1.5px]">
                                    {currentDeployment.Branch}
                                </span>
                            </div>
                        </div>
                        <p className="font-semibold text-sm">
                            {formatRelativeTime(deployment.Date)}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

const ArnsTabSelector = ({
    fetchingUserArns,
    arnsNames,
    deployment,
    currentDeployment,
    signer,
    signerLoading,
}: {
    fetchingUserArns: boolean;
    arnsNames: ArnsName[];
    deployment: DeploymentRecord;
    currentDeployment: TDeployment;
    signer: any;
    signerLoading: boolean;
}) => {
    const [selectedArns, setSelectedArns] = useState<ArnsName | undefined>(
        undefined,
    );
    const globalState = useGlobalState();
    const [arnsDropDownOpen, setArnsDropDownOpen] = useState<boolean>(false);
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentArns, setCurrentArns] = useState<ArnsName | undefined>(
        undefined,
    );
    const [newUndername, setNewUndername] = useState<string>("");

    const handleCloseDialog = () => {
        setTransactionId(null);
        setIsDialogOpen(false);
    };

    const handleArnsSelection = (arnsName: ArnsName) => {
        setSelectedArns(arnsName);
        setArnsDropDownOpen(false);
    };

    const handleSwitchToAnotherArns = async () => {
        setNewUndername("");
        if (!selectedArns) return toast.error("please select an arns");
        
        if (!signer || signerLoading) {
            toast.error("Please connect your wallet to switch ArNS");
            return;
        }
        
        const txid = await setArnsName(
            selectedArns.processId,
            deployment.DeploymentID,
            "@",
            signer,
        );
        if (txid) {
            setTransactionId(selectedArns.processId);
            toast.success("Successfully changed arns", {
                description:
                    "This process may take time please check the progress throught transaction id",
            });
        } else {
            toast.error("Failed to switch arns");
        }
    };

    useEffect(() => {
        if (transactionId) {
            setIsDialogOpen(true);
        }
    }, [transactionId]);

    useEffect(() => {
        setCurrentArns(
            arnsNames.find(
                (arns) => arns.processId === currentDeployment.ArnsProcess,
            ),
        );
    }, [arnsNames]);

    const [assigningANewUndername, setAssigningANewUndername] =
        useState<boolean>(false);
    const changeUndername = async () => {
        if (!currentArns) return toast.error("not an arns user");
        if (!selectedArns) return toast.error("please select an arns");
        if (newUndername.trim().length === 0)
            return toast.error("please enter an undername value");

        setAssigningANewUndername(true);
        
        if (!signer || signerLoading) {
            toast.error("Please connect your wallet to assign undername");
            setAssigningANewUndername(false);
            return;
        }
        
        const txid = await setUndername(
            selectedArns.processId,
            currentDeployment.DeploymentId,
            newUndername,
            signer,
        );
        if (txid) {
            setTransactionId(currentDeployment.DeploymentId);
            await runLua(
                `db:exec[[UPDATE Deployments SET UnderName='${newUndername}' WHERE Name='${currentDeployment.Name}']]`,
                globalState.managerProcess,
                undefined,
                signer,
            );
            setAssigningANewUndername(false);
        } else {
            setAssigningANewUndername(false);
            setNewUndername("");
        }
    };

    return (
        <>
            {transactionId && (
                <TransactionDialog
                    isOpen={isDialogOpen}
                    setIsOpen={setIsDialogOpen}
                    transactionId={transactionId}
                    onClose={handleCloseDialog}
                    title={`Your ${
                        newUndername ? "undername" : "arns"
                    } will be switched soon`}
                />
            )}
            <Tabs defaultValue="account" className="w-full mt-4">
                <TabsList className="grid bg-neutral-900 w-full grid-cols-2">
                    <TabsTrigger value="account">Switch arns</TabsTrigger>
                    <TabsTrigger value="password">Undername</TabsTrigger>
                </TabsList>
                <TabsContent
                    value="account"
                    className="bg-arlink-bg-secondary-color"
                >
                    <Card className="border-none p-0">
                        <CardHeader className="px-2">
                            <CardTitle>Switch arns</CardTitle>
                            <CardDescription>
                                Switch to any arns you own easily
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 px-2">
                            {fetchingUserArns ? (
                                <Skeleton className="w-full flex items-center justify-between gap-3 px-3 h-10 text-center focus:ring-0 focus:ring-offset-0 outline-none bg-neutral-900 border-[#383838] text-white">
                                    <div className="flex items-center gap-3">
                                        Fetching existing arns
                                        <Loader2
                                            size={15}
                                            className="animate-spin"
                                        />
                                    </div>
                                    <ChevronsUpDown size={15} />
                                </Skeleton>
                            ) : (
                                <Popover
                                    open={arnsDropDownOpen}
                                    onOpenChange={setArnsDropDownOpen}
                                >
                                    <PopoverTrigger
                                        className="w-full bg-arlink-bg-secondary-color border-[#383838]"
                                        asChild
                                    >
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={arnsDropDownOpen}
                                            className="justify-between"
                                        >
                                            {selectedArns
                                                ? selectedArns.name
                                                : "Select an arns name"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="max-w-3xl p-0 border-[#383838] bg-arlink-bg-secondary-color w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                                        <Command>
                                            <CommandInput placeholder="Select an existing arns..." />
                                            <CommandList>
                                                <CommandEmpty>
                                                    No arns found.
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {arnsNames.map(
                                                        (arnsObj) => (
                                                            <CommandItem
                                                                key={
                                                                    arnsObj.processId
                                                                }
                                                                value={
                                                                    arnsObj.name
                                                                }
                                                                onSelect={() =>
                                                                    handleArnsSelection(
                                                                        arnsObj,
                                                                    )
                                                                }
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedArns?.name ===
                                                                            arnsObj.name
                                                                            ? "opacity-100"
                                                                            : "opacity-0",
                                                                    )}
                                                                />
                                                                {arnsObj.name}
                                                            </CommandItem>
                                                        ),
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </CardContent>
                        <CardFooter className="px-2">
                            <Button
                                type="button"
                                size="sm"
                                className="flex items-center text-sm gap-2 px-4 font-semibold"
                                onClick={handleSwitchToAnotherArns}
                            >
                                Switch arns
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="password">
                    <Card className="border-none p-0">
                        <CardHeader className="px-2">
                            <CardTitle>Undername</CardTitle>
                            <CardDescription>
                                Manage your undername here
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 px-2">
                            <div className="space-y-1">
                                <Label htmlFor="current">Current arns</Label>
                                {fetchingUserArns || !currentArns ? (
                                    <Skeleton className="h-[37px] w-full" />
                                ) : (
                                    <Input
                                        className="bg-arlink-bg-secondary-color"
                                        id="current"
                                        type="text"
                                        readOnly
                                        value={currentArns?.name}
                                    />
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="current">Change arns</Label>
                                {fetchingUserArns ? (
                                    <Skeleton className="w-full flex items-center justify-between gap-3 px-3 h-10 text-center focus:ring-0 focus:ring-offset-0 outline-none bg-neutral-900 border-[#383838] text-white">
                                        <div className="flex items-center gap-3">
                                            Fetching existing arns
                                            <Loader2
                                                size={15}
                                                className="animate-spin"
                                            />
                                        </div>
                                        <ChevronsUpDown size={15} />
                                    </Skeleton>
                                ) : (
                                    <Popover
                                        open={arnsDropDownOpen}
                                        onOpenChange={setArnsDropDownOpen}
                                    >
                                        <PopoverTrigger
                                            className="w-full bg-arlink-bg-secondary-color border-[#383838]"
                                            asChild
                                        >
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={arnsDropDownOpen}
                                                className="justify-between"
                                            >
                                                {selectedArns
                                                    ? selectedArns.name
                                                    : "Select an arns name"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="max-w-3xl p-0 border-[#383838] bg-arlink-bg-secondary-color w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                                            <Command>
                                                <CommandInput placeholder="Select an existing arns..." />
                                                <CommandList>
                                                    <CommandEmpty>
                                                        No arns found.
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {arnsNames.map(
                                                            (arnsObj) => (
                                                                <CommandItem
                                                                    key={
                                                                        arnsObj.processId
                                                                    }
                                                                    value={
                                                                        arnsObj.name
                                                                    }
                                                                    onSelect={() =>
                                                                        handleArnsSelection(
                                                                            arnsObj,
                                                                        )
                                                                    }
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            selectedArns?.name ===
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
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="new">New undername</Label>
                                <Input
                                    className="bg-arlink-bg-secondary-color"
                                    id="new"
                                    type="text"
                                    value={newUndername}
                                    placeholder="add a new undername"
                                    onChange={(e) =>
                                        setNewUndername(e.target.value)
                                    }
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="px-2">
                            <Button onClick={changeUndername}>
                                {assigningANewUndername
                                    ? "Assigning"
                                    : "Assign"}{" "}
                                undername
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    );
};

function MinimalDeploymentSkeleton() {
    return (
        <div className="p-4 rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Left column */}
                <div className="space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" className="bg-transparent">
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            <Skeleton className="h-4 w-16" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent"
                        >
                            <Skeleton className="h-4 w-24" />
                        </Button>
                    </div>
                </div>
                {/* Right column */}
                <div className="flex flex-col sm:items-end gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Button size="sm" variant="ghost">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
