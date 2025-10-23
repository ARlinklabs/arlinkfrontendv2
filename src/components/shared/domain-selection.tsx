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
import { Check, ChevronDown, ChevronsUpDown, Loader2, Download } from "lucide-react";
import { useWalletType } from "@/lib/wallet-strategies/hooks";
import { addcontroller } from "@/actions/arns/arnslater";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

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
    const [isImportNamesModalOpen, setIsImportNamesModalOpen] = useState(false);

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
            <Dialog open={isImportNamesModalOpen} onOpenChange={setIsImportNamesModalOpen}>
                <DialogContent className="bg-neutral-950 border-neutral-800 text-neutral-100 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Import ArNS Names</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Import your ArNS names from external sources or wallets.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <p className="text-sm text-neutral-400">
                            This feature allows you to import ArNS names that are associated with your WAuth wallet but may not be automatically detected.
                        </p>
                        
                        {/* Placeholder content - can be extended based on requirements */}
                        <div className="flex items-center justify-center py-8 text-neutral-500">
                            <div className="text-center space-y-2">
                                <Download className="h-12 w-12 mx-auto opacity-50" />
                                <p className="text-sm">Import functionality coming soon</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
