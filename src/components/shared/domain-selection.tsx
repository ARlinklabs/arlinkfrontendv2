import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { PopoverContent } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { DomainSelectionType } from "@/types";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Check, ChevronDown, ChevronsUpDown, Loader2, Download, Wallet, CheckCircle2 } from "lucide-react";
import { useWalletType } from "@/lib/wallet-strategies/hooks";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { getWalletOwnedNames } from "@/lib/get-arns";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useActiveAddress } from "@/lib/wallet-strategies";
import type { ArnsName } from "@/types";
import { ANT, ArconnectSigner } from "@ar.io/sdk";

export default function DomainSelection({
    activeTab,
    setActiveTab,
    projectName,
    // custom arns name with arweave domain
    setCustomArnsName,
    customArnsName,
    // user wallet domain arns names
    arnsNames,
    arnsName,
    arnsDropDown,
    setArnsDropDownModal,
    handleFetchExistingArnsName,
    setExistingArnsLoading,
    existingArnsLoading,
    handleArnsSelection,
}: // ----
DomainSelectionType) {
    const { isWAuth } = useWalletType();
    const wauthAddress = useActiveAddress(); // Get WAuth wallet address
    const [isImportNamesModalOpen, setIsImportNamesModalOpen] = useState(false);
    
    // Import modal states
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);
    const [availableNames, setAvailableNames] = useState<ArnsName[]>([]);
    const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
    const [isFetchingNames, setIsFetchingNames] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // Handle connecting to Arweave wallet
    const handleConnect = async () => {
        if (!window.arweaveWallet) {
            toast.error("Please install an Arweave wallet extension");
            return;
        }

        setIsConnecting(true);
        try {
            await window.arweaveWallet.connect([
                "ACCESS_ADDRESS",
                "ACCESS_PUBLIC_KEY",
                "SIGN_TRANSACTION",
            ]);
            
            const address = await window.arweaveWallet.getActiveAddress();
            setConnectedWalletAddress(address);
            setIsConnected(true);
            toast.success("Wallet connected successfully");
            
            // Fetch names after connection
            await handleFetchNamesFromConnectedWallet(address);
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            toast.error("Failed to connect wallet");
        } finally {
            setIsConnecting(false);
        }
    };

    // Fetch ArNS names from connected wallet
    const handleFetchNamesFromConnectedWallet = async (address: string) => {
        setIsFetchingNames(true);
        try {
            const names = await getWalletOwnedNames(address);
            setAvailableNames(names);
            if (names.length === 0) {
                toast.info("No ArNS names found in this wallet");
            }
        } catch (error) {
            console.error("Failed to fetch names:", error);
            toast.error("Failed to fetch ArNS names");
        } finally {
            setIsFetchingNames(false);
        }
    };

    // Toggle name selection
    const handleToggleName = (processId: string) => {
        setSelectedNames(prev => {
            const newSet = new Set(prev);
            if (newSet.has(processId)) {
                newSet.delete(processId);
            } else {
                newSet.add(processId);
            }
            return newSet;
        });
    };

    // Import selected names
    const handleImport = async () => {
        if (selectedNames.size === 0) {
            toast.error("Please select at least one name to import");
            return;
        }

        if (!wauthAddress) {
            toast.error("WAuth address not found");
            return;
        }

        if (!window.arweaveWallet) {
            toast.error("Arweave wallet not connected");
            return;
        }

        setIsImporting(true);
        const selectedNamesArray = Array.from(selectedNames);
        
        // Create signer from connected Arweave wallet
        const arweaveSigner = new ArconnectSigner(window.arweaveWallet);
        
        const importPromises = selectedNamesArray.map(async (processId) => {
            const nameLookup = availableNames.find(n => n.processId === processId)?.name || processId;
            
            try {
                const ant = ANT.init({
                    // @ts-ignore
                    signer: arweaveSigner,
                    processId: processId
                });
                
                const { id } = await ant.addController({
                    controller: wauthAddress
                });
                
                toast.success(`Successfully added controller for ${nameLookup}`);
                return { success: true, processId, transactionId: id };
            } catch (error) {
                console.error(`Error adding controller for ${processId}:`, error);
                const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
                toast.error(`Failed to add controller for ${nameLookup}: ${errorMessage}`);
                return { success: false, processId };
            }
        });

        await Promise.all(importPromises);
        setIsImporting(false);
        
        // Close modal and refresh
        await handleCloseModal();
    };

    // Close modal and cleanup
    const handleCloseModal = async () => {
        // Disconnect wallet if connected
        if (isConnected && window.arweaveWallet) {
            try {
                await window.arweaveWallet.disconnect();
            } catch (error) {
                console.error("Failed to disconnect wallet:", error);
            }
        }

        // Reset states
        setIsImportNamesModalOpen(false);
        setIsConnected(false);
        setConnectedWalletAddress(null);
        setAvailableNames([]);
        setSelectedNames(new Set());
        setIsFetchingNames(false);
        setIsImporting(false);

        // Refresh ArNS names for WAuth wallet
        if (handleFetchExistingArnsName) {
            await handleFetchExistingArnsName();
        }
    };

    return (
        <>
            <p className="text-sm text-neutral-400 font-medium mb-3">Domain</p>
            <Tabs
                value={activeTab}
                onValueChange={(value) =>
                    setActiveTab(value as "arlink" | "existing")
                }
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-2 bg-neutral-900 border">
                    <TabsTrigger
                        onClick={() => {
                            setExistingArnsLoading(() => true);
                        }}
                        value="arlink"
                        className="data-[state=active]:bg-neutral-200 data-[state=active]:text-neutral-800"
                    >
                        Arlink
                    </TabsTrigger>
                    <TabsTrigger
                        onClick={handleFetchExistingArnsName}
                        value="existing"
                        className="data-[state=active]:bg-neutral-200 data-[state=active]:text-neutral-800"
                    >
                        Existing arns
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="arlink" className="relative mt-3">
                    <Input
                        placeholder={`${projectName}`}
                        value={customArnsName}
                        className="bg-[#0C0C0C] border-[#383838] text-white"
                        onChange={(e) =>
                            setCustomArnsName(() => e.target.value)
                        }
                    />
                    <p className="text-sm text-neutral-400 border-[#383838] border-l h-full flex items-center justify-center px-3 py-2 right-0 rounded-md rounded-l-none leading-none absolute  top-1/2 -translate-y-1/2">
                        _arlink.ar.io
                    </p>
                </TabsContent>
                <TabsContent value="existing" className="mt-3">
                    {existingArnsLoading ? (
                        <Skeleton className="w-full flex items-center justify-between gap-3 px-3 h-10 text-center focus:ring-0 focus:ring-offset-0 outline-none  bg-neutral-900 border-[#383838] text-white">
                            <div className="flex items-center gap-3">
                                Fetching existing arns
                                <Loader2 size={15} className="animate-spin" />
                            </div>
                            <ChevronDown size={15} />
                        </Skeleton>
                    ) : (
                        <>
                            <Popover
                                open={arnsDropDown}
                                onOpenChange={setArnsDropDownModal}
                            >
                                <PopoverTrigger
                                    className="w-full bg-arlink-bg-secondary-color border-[#383838]"
                                    asChild
                                >
                                    <Button
                                        variant="outline"
                                        aria-expanded={arnsDropDown}
                                        className=" justify-between"
                                    >
                                        {arnsName
                                            ? arnsName.name
                                            : "Select an arns name"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="max-w-3xl p-0 border-[#383838] bg-arlink-bg-secondary-color
									w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]
									"
                                >
                                    <Command className="w-full">
                                        <CommandInput placeholder="Select an existing arns..." />
                                        <CommandList>
                                            <CommandEmpty>
                                                No arns found.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {arnsNames.map((arnsObj) => (
                                                    <CommandItem
                                                        key={arnsObj.processId}
                                                        value={arnsObj.name}
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
                                                        {arnsObj.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                            {isWAuth && (
                                                <div className="border-t border-neutral-800 p-2">
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800"
                                                        onClick={() => {
                                                            setIsImportNamesModalOpen(true);
                                                            setArnsDropDownModal(false);
                                                        }}
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Import Names
                                                    </Button>
                                                </div>
                                            )}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </>
                    )}
                </TabsContent>
            </Tabs>

            {/* Import Names Modal */}
            <Dialog open={isImportNamesModalOpen} onOpenChange={(open) => {
                if (!open && !isImporting) {
                    handleCloseModal();
                }
            }}>
                <DialogContent className="bg-neutral-950 border-neutral-800 text-neutral-100 sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Import ArNS Names</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Connect an Arweave wallet to import ArNS names to your WAuth account.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4 overflow-y-auto flex-1">
                        {!isConnected ? (
                            // Not connected state
                            <div className="space-y-4">
                                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Wallet className="h-5 w-5 text-neutral-400" />
                                        <h3 className="font-medium">Connect Arweave Wallet</h3>
                                    </div>
                                    <p className="text-sm text-neutral-400 mb-4">
                                        Connect your Arweave wallet to view and import ArNS names. The names will be added as controllers to your WAuth address: 
                                        <span className="block mt-2 font-mono text-xs text-neutral-300 truncate">
                                            {wauthAddress}
                                        </span>
                                    </p>
                                    <Button
                                        onClick={handleConnect}
                                        disabled={isConnecting}
                                        className="w-full bg-white hover:bg-neutral-200 text-black"
                                    >
                                        {isConnecting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <Wallet className="mr-2 h-4 w-4" />
                                                Connect Wallet
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // Connected state
                            <div className="space-y-4">
                                {/* Connected wallet info */}
                                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-medium">Connected</span>
                                        </div>
                                        <span className="text-xs text-neutral-400 font-mono truncate max-w-[200px]">
                                            {connectedWalletAddress}
                                        </span>
                                    </div>
                                </div>

                                {/* Loading names */}
                                {isFetchingNames && (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                                        <span className="ml-3 text-neutral-400">Fetching ArNS names...</span>
                                    </div>
                                )}

                                {/* Names list */}
                                {!isFetchingNames && availableNames.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-neutral-300">
                                                Select names to import ({selectedNames.size} selected)
                                            </h3>
                                        </div>
                                        
                                        <div className="border border-neutral-800 rounded-lg divide-y divide-neutral-800 max-h-[300px] overflow-y-auto">
                                            {availableNames.map((name) => (
                                                <div
                                                    key={name.processId}
                                                    className="flex items-center gap-3 p-3 hover:bg-neutral-900 transition-colors cursor-pointer"
                                                    onClick={() => handleToggleName(name.processId)}
                                                >
                                                    <Checkbox
                                                        checked={selectedNames.has(name.processId)}
                                                        onCheckedChange={() => handleToggleName(name.processId)}
                                                        className="border-neutral-600"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">{name.name}</p>
                                                        <p className="text-xs text-neutral-500 font-mono truncate">
                                                            {name.processId}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No names found */}
                                {!isFetchingNames && availableNames.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                                        <Download className="h-12 w-12 mb-3 opacity-50" />
                                        <p className="text-sm">No ArNS names found in this wallet</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer actions */}
                    {isConnected && availableNames.length > 0 && (
                        <div className="border-t border-neutral-800 pt-4 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleCloseModal}
                                disabled={isImporting}
                                className="flex-1 border-neutral-700 hover:bg-neutral-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={isImporting || selectedNames.size === 0}
                                className="flex-1 bg-white hover:bg-neutral-200 text-black"
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    `Import ${selectedNames.size} Name${selectedNames.size !== 1 ? 's' : ''}`
                                )}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
