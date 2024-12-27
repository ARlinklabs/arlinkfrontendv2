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
import type { DomainSelectionType } from "@/index";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Check, ChevronDown, ChevronsUpDown, Loader2 } from "lucide-react";

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
	// ----
}: DomainSelectionType) {
	return (
		<>
			<p className="text-sm text-neutral-400 font-medium mb-3">Domain</p>
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as "arlink" | "existing")}
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
						onChange={(e) => setCustomArnsName(() => e.target.value)}
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
							<Popover open={arnsDropDown} onOpenChange={setArnsDropDownModal}>
								<PopoverTrigger
									className="w-full bg-arlink-bg-secondary-color border-[#383838]"
									asChild
								>
									<Button
										variant="outline"
										aria-expanded={arnsDropDown}
										className=" justify-between"
									>
										{arnsName ? arnsName.name : "Select an arns name"}
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
											<CommandEmpty>No arns found.</CommandEmpty>
											<CommandGroup>
												{arnsNames.map((arnsObj) => (
													<CommandItem
														key={arnsObj.processId}
														value={arnsObj.name}
														onSelect={() => {
															handleArnsSelection({
																processId: arnsObj.processId,
																name: arnsObj.name,
															});
														}}
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																arnsName?.name === arnsObj.name
																	? "opacity-100"
																	: "opacity-0",
															)}
														/>
														{arnsObj.name}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</>
					)}
				</TabsContent>
			</Tabs>
		</>
	);
}
