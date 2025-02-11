import { useGlobalState } from "@/store/useGlobalState";
import type { ProtocolLandRepo, Repository, Steps } from "@/types";
import { useEffect, useState } from "react";
import { fetchProtocolLandRepos, fetchRepositories } from "../utilts";
import { CustomDropdown } from "../../components/shared/drop-down";
import { Info, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useActiveAddress } from "arweave-wallet-kit";
import { RepoSkeleton } from "@/components/skeletons";
import { RepositoryItem } from "@/components/shared/repository-item";
import useDeploymentManager from "@/hooks/use-deployment-manager";

type GitAuthRepoSelectorTypesProps = {
    setSelectedRepo: React.Dispatch<
        React.SetStateAction<{ name: string; url: string }>
    >;
    setStep: React.Dispatch<React.SetStateAction<Steps>>;
};

const RepoProvider = ({
    setSelectedRepo,
    setStep,
}: GitAuthRepoSelectorTypesProps) => {
    // global state
    const { githubToken } = useGlobalState();
    const address = useActiveAddress();

    // loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isProviderSelected, setIsProviderSelected] = useState(false);

    // repository states
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [protocolLandRepos, setProtocolLandRepos] = useState<
        ProtocolLandRepo[]
    >([]);
    const [filteredRepositories, setFilteredRepositories] = useState<
        Repository[]
    >([]);

    const { managerProcess } = useDeploymentManager();

    // search query state
    const [searchQuery, setSearchQuery] = useState("");

    // option
    const [provider, setProvider] = useState<"github" | "protocol">("github");
    const [filteredProtocolRepos, setFilteredProtocolRepos] = useState<
        ProtocolLandRepo[]
    >([]);

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
        if (provider === "github") {
            const filtered = repositories.filter((repo) =>
                repo.full_name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
            );
            setFilteredRepositories(filtered);
        } else {
            const filtered = protocolLandRepos.filter((repo) =>
                repo.name.toLowerCase().includes(searchQuery.toLowerCase()),
            );
            setFilteredProtocolRepos(filtered);
        }
    }, [repositories, searchQuery, protocolLandRepos]);

    // handlers
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleRepoSelection = ({
        name,
        url,
    }: {
        name: string;
        url: string;
    }) => {
        setSelectedRepo({
            name,
            url,
        });
        setStep("configuring");
    };

    const handleProtocolLandrepoSelection = ({
        name,
        url,
    }: {
        name: string;
        url: string;
    }) => {
        setSelectedRepo({ name, url });
        setStep("configuring-protocol");
    };

    const handleProvider = (provider: "github" | "protocol") => {
        setProvider(provider);
    };

    useEffect(() => {
        const handleProviderChange = async () => {
            if (provider === "github") {
                if (githubToken) {
                    setIsLoading(true);
                    await fetchRepositories({
                        setRepositories,
                        githubToken,
                    });
                    setIsProviderSelected(true);
                    setIsLoading(false);
                }
            } else if (provider === "protocol") {
                setIsLoading(true);
                await fetchProtocolLandRepos({
                    address,
                    setProtocolLandRepos,
                });
                setIsProviderSelected(true);
                setIsLoading(false);
            }
        };
        handleProviderChange();
    }, [provider]);

    return (
        <Card className="bg-arlink-bg-secondary-color lg:w-2/3 w-full p-6 rounded-lg">
            <h2 className="md:text-2xl text-md font-semibold mb-4">
                Select a provider and import
            </h2>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <CustomDropdown
                        isLoading={isLoading}
                        handleProvider={handleProvider}
                    />
                    <div className="relative w-full md:max-w-[600px]">
                        <Search className="absolute left-3 top-1/2 h-[20px] w-[20px] transform -translate-y-1/2 text-neutral-600" />
                        <Input
                            className="pl-10 w-full text-xs lg:text-md md:text-sm bg-arlink-bg-secondary-color hover:border-neutral-600 transition-colors placeholder:text-neutral-400 font-light border-[#383838] focus:ring-neutral-700 focus-visible:ring-neutral-700"
                            placeholder="Search Repositories and Projects..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                </div>
                <div>
                    <ScrollArea className="h-[370px] border rounded-md">
                        {/*  this is added but not showing I will fix this don't worry  */}
                        {!isProviderSelected ? (
                            <div className="h-[370px] px-4 w-full flex items-center justify-center">
                                <p className="text-center leading-[1.2] tracking-tight text-xl font-semibold -translate-y-2">
                                    <span className="flex md:flex-row flex-col md:items-start items-center justify-center gap-2">
                                        <Info className="w-6 h-6" />
                                        Please select a provider from the drop
                                        down menu
                                    </span>
                                    <br />
                                </p>
                            </div>
                        ) : isLoading || !managerProcess ? (
                            [1, 2, 3, 4, 5, 6].map((arrayValue) => (
                                <RepoSkeleton key={arrayValue} />
                            ))
                        ) : provider === "github" ? (
                            filteredRepositories.map((repo) => (
                                <RepositoryItem
                                    key={repo.id}
                                    id={repo.id.toString()}
                                    fullName={repo.full_name}
                                    updatedAt={repo.updated_at}
                                    url={repo.html_url}
                                    onImport={() => {
                                        handleRepoSelection({
                                            name: repo.name,
                                            url: repo.html_url,
                                        });
                                    }}
                                />
                            ))
                        ) : (
                            filteredProtocolRepos.map((value) => (
                                <RepositoryItem
                                    key={value.cloneUrl}
                                    fullName={value.name}
                                    id={value.cloneUrl}
                                    onImport={() => {
                                        handleProtocolLandrepoSelection({
                                            name: value.name,
                                            url: value.cloneUrl,
                                        });
                                    }}
                                    url={value.cloneUrl}
                                />
                            ))
                        )}
                    </ScrollArea>
                </div>
            </div>
        </Card>
    );
};

export default RepoProvider;
