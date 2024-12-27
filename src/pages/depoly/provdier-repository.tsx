import { useGlobalState } from "@/hooks/useGlobalState";
import type { Repository, Steps } from "@/index";
import { useEffect, useState } from "react";
import { fetchRepositories } from "./utilts";
import { CustomDropdown } from "./drop-down";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";

type GitAuthRepoSelectorTypesProps = {
	setSelectedRepo: React.Dispatch<React.SetStateAction<string>>;
	setStep: React.Dispatch<React.SetStateAction<Steps>>;
};

const GitAuthRepoSelector = ({
	setSelectedRepo,
	setStep,
}: GitAuthRepoSelectorTypesProps) => {
	// global state
	const { githubToken } = useGlobalState();

	// loading states
	const [isLoading, setIsLoading] = useState(true);
	const [isProviderSelected, setIsProviderSelected] = useState(false);

	// repository states
	const [repositories, setRepositories] = useState<Repository[]>([]);
	const [filteredRepositories, setFilteredRepositories] = useState<
		Repository[]
	>([]);

	// search query state
	const [searchQuery, setSearchQuery] = useState("");

	// use effects

	/* 
		When the user selects the github provider through the custom drop down,
		it will set up the gihtub token,
		through the github token, this useEffect will be triggered again
		and all the repositories will be fetched
	*/
	useEffect(() => {
		const handleRepository = async () => {
			setIsLoading(true);
			await fetchRepositories({
				setRepositories: setRepositories,
				githubToken,
			});
			setIsLoading(false);
		};
		if (githubToken) {
			setIsProviderSelected(true);
			handleRepository();
		} else {
		}
	}, [githubToken]);

	useEffect(() => {
		const filtered = repositories.filter((repo) =>
			repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
		);
		setFilteredRepositories(filtered);
	}, [repositories, searchQuery]);

	// handlers
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleRepoSelection = (value: string) => {
		setSelectedRepo(value);
		console.log(value);
		setStep("configuring");
	};

	return (
		<Card className="bg-arlink-bg-secondary-color p-6 rounded-lg">
			<h2 className="text-2xl font-semibold mb-4">
				Select a provider and import
			</h2>
			<div className="space-y-4">
				<div className="flex gap-2">
					<CustomDropdown />
					<div className="relative w-full md:max-w-[600px]">
						<Search className="absolute left-3 top-1/2 h-[20px] w-[20px] transform -translate-y-1/2 text-neutral-600" />
						<Input
							className="pl-10 w-full bg-arlink-bg-secondary-color hover:border-neutral-600 transition-colors placeholder:text-neutral-400 font-light border-[#383838] focus:ring-neutral-700 focus-visible:ring-neutral-700"
							placeholder="Search Repositories and Projects..."
							value={searchQuery}
							onChange={handleSearch}
						/>
					</div>
				</div>
				<div>
					<ScrollArea className="h-72 border rounded-md">
						{!isProviderSelected && (
							<div className="h-[17rem] w-full flex items-center justify-center">
								<p className="text-center">
									Please select a provider to import projects
								</p>
							</div>
						)}
						{isLoading && isProviderSelected
							? // Skeleton loader
								[1, 2, 3, 4, 5].map((arrayValue) => (
									<div
										key={arrayValue}
										className="flex items-center justify-between p-3 border-b animate-pulse"
									>
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 bg-neutral-700 rounded-md" />
											<div className="h-4 bg-neutral-700 rounded w-40" />
											<div className="h-4 bg-neutral-700 rounded w-20" />
										</div>
										<div className="w-16 h-8 bg-neutral-700 rounded" />
									</div>
								))
							: filteredRepositories.map((value) => (
									<div
										key={value.id}
										className="flex hover:bg-neutral-900 duration-75 transition-all items-center justify-between pl-2 px-4 py-3 border-b"
									>
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 ">
												<img
													src="/joose.svg"
													alt="logo"
													className="h-full w-full"
												/>
											</div>
											<span className="font-medium">{value.full_name}</span>
											<span className="text-sm text-neutral-500">
												{timeAgo(value.updated_at)}
											</span>
										</div>
										<Button
											size="sm"
											className="rounded-sm h-8 mr-1"
											onClick={() => handleRepoSelection(value.html_url)}
										>
											Import
										</Button>
									</div>
								))}
					</ScrollArea>
				</div>
			</div>
		</Card>
	);
};

export default GitAuthRepoSelector;
