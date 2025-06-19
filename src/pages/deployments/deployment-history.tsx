import { useEffect, useState } from "react";
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
    getDeploymentHistory,
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
    extractOwnerName,
    extractRepoName,
    handleFetchExistingArnsName,
} from "../utilts";
import { useActiveAddress } from "@arweave-wallet-kit/react";
import { TransactionDialog } from "@/components/transactionBlock";
import { revertNonArnsProject } from "@/actions/deploy";

export default function DeploymentHistory() {
    // hooks

    const { deployments } = useDeploymentManager();
    const [searchParams] = useSearchParams();
    const repoName = searchParams.get("repo");
    const { managerProcess } = useGlobalState();

    const [history, setHistory] = useState<DeploymentRecord[]>([]);

    const foundDeployment = deployments.find((d) => d.Name === repoName);

    // loading and error states
    const [loadingDeploymentHistory, setLoadingDeploymentHistory] =
        useState<boolean>(false);
    const [, setHistoryError] = useState<string | null>("");
    const activeAddress = useActiveAddress();
    if (!foundDeployment) return;

    const [arnsNames, setArnsNames] = useState<ArnsName[]>([]);
    const [fetchingUserArns, setFetchingUserArns] = useState<boolean>(false);

    useEffect(() => {
        if (!repoName || !foundDeployment) return;
        const fetchHistory = async () => {
            setLoadingDeploymentHistory(true);
            const { history, error } = await getDeploymentHistory(
                foundDeployment?.Name,
                managerProcess,
            );

            console.log(history);
            if (error) {
                setHistoryError(error?.message);
            }
            setHistory(history.reverse());
            setLoadingDeploymentHistory(false);
        };

        fetchHistory();
    }, []);

    const fetchArnsUndername = () => {
        try {
            handleFetchExistingArnsName({
                setArnsNames,
                activeAddress,
                setExistingArnsLoading: setFetchingUserArns,
            });
        } catch (error) {}
    };

    useEffect(() => {
        fetchArnsUndername();
    }, []);

    return (
        <div className="min-h-screen text-neutral-200">
            <div className="container mx-auto px-4 py-10 md:px-10">
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
                        ) : (
                            history.map((deployment, index) => (
                                <DeploymentHistoryCard
                                    key={index}
                                    deployment={deployment}
                                    currentDeployment={foundDeployment}
                                    index={index}
                                    fetchingUserArns={fetchingUserArns}
                                    arnsNames={arnsNames}
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
}: {
    deployment: DeploymentRecord;
    currentDeployment: TDeployment;
    index: number;
    fetchingUserArns: boolean;
    arnsNames: ArnsName[];
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
            const txid = await setArnsName(
                currentDeployment.ArnsProcess,
                deploymentID,
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

    const rollBackNonArnsUser = async (deploymentID: string) => {
        setRollBackStarted(true);
        setTransactionId("");
        setRollBackTransactionIdFetched(false);
        const ownerName = extractOwnerName(currentDeployment.RepoUrl);
        const repoProjectName = extractRepoName(currentDeployment.RepoUrl);

        const { data } = await revertNonArnsProject({
            ownerName,
            repoProjectName,
            manifestId: deploymentID,
        });

        setRollBackStarted(false);
        if (data.txid) {
            setTransactionId(data.txid);
            setRollBackTransactionIdFetched(true);
            await refresh();
            navigate(`/deployment?repo=${currentDeployment.Name}`);
        } else {
            toast.error("Failed to rollback");
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
                    {currentDeployment.ArnsProcess ? (
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
                                            />
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        index !== 0 && (
                            <Dialog>
                                <DialogTrigger>
                                    <Button
                                        size={"sm"}
                                        className="flex items-center -transparent text-sm gap-2 px-4 font-semibold rounded-xl"
                                        disabled={rollBackTransactionIdFetched}
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
                                                    disabled={rollBackStarted}
                                                    onClick={() => {
                                                        rollBackNonArnsUser(
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
                                                <DialogClose>Close</DialogClose>
                                            )}
                                        </div>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )
                    )}
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
                            {deployment.Date}
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
}: {
    fetchingUserArns: boolean;
    arnsNames: ArnsName[];
    deployment: DeploymentRecord;
    currentDeployment: TDeployment;
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
        const txid = await setArnsName(
            selectedArns.processId,
            deployment.DeploymentID,
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
        const txid = await setUndername(
            selectedArns.processId,
            currentDeployment.DeploymentId,
            newUndername,
        );
        if (txid) {
            setTransactionId(currentDeployment.DeploymentId);
            await runLua(
                `db:exec[[UPDATE Deployments SET UnderName='${newUndername}' WHERE Name='${currentDeployment.Name}']]`,
                globalState.managerProcess,
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
