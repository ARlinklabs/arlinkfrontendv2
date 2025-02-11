import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGlobalState } from "@/store/useGlobalState";
import { handleGitHubCallback, initiateGitHubAuth } from "@/actions/github";
import useDeploymentManager from "@/hooks/use-deployment-manager";

type Option = {
    id: string;
    label: string;
};

const options: Option[] = [
    { id: "1", label: "Github" },
    { id: "2", label: "Protocol land" },
];

interface CustomDropdownProps {
    handleProvider: (provider: "github" | "protocol") => void;
    isLoading: boolean;
}

export function CustomDropdown({ handleProvider }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<Option | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const { managerProcess } = useDeploymentManager();
    useEffect(() => {
        console.log(managerProcess);
    }, [managerProcess]);

    // handling github auth
    // states for github
    const { githubToken, setGithubToken } = useGlobalState();
    const [searchParams] = useSearchParams();

    const onSuccess = (optionId: string) => {
        if (optionId === "1") {
            setSelectedOption({ id: "1", label: "Github" });
        }
    };

    // step - 2
    // user get's redirected to the github authentication page and generates code also loading state get's triggered here
    const handleGithubLogin = async () => {
        setLoadingId("1");
        await initiateGitHubAuth();
    };

    // step - 3
    // useEffect will be called for the first time and also when the search params changes
    // this will initialize the github token to the global store
    // biome-ignore lint/correctness/useExhaustiveDependencies: <ignore this, if we did what it said we will get infinite render>
    useEffect(() => {
        // initial checkup
        // if the user already has the github token we set the value of drop down to this
        const handleAuth = async () => {
            const code = searchParams.get("code");

            // generating token with the code
            if (code) {
                try {
                    const token = await handleGitHubCallback(code);
                    setGithubToken(token);

                    window.history.replaceState(
                        {},
                        "",
                        window.location.pathname,
                    );
                    onSuccess("1");
                } catch (error) {
                    console.log("Failed to authenticate with github", error);
                } finally {
                    setLoadingId(null);
                }
            }
        };

        // if we don't have github token then we call this function to set the github token
        if (!githubToken) {
            handleAuth();
        }
    }, [searchParams]);

    useEffect(() => {
        if (githubToken) {
            const option: Option = {
                label: "Github",
                id: "1",
            };
            setSelectedOption(option);
        }
    }, [githubToken, searchParams]);

    // step - 1
    // user clicks on the drop down menu and chooses the github
    const handleSelect = (option: Option) => {
        if (option.id === "1") {
            if (!githubToken) {
                handleGithubLogin();
            } else {
                setSelectedOption({
                    id: option.id,
                    label: option.label,
                });
                handleProvider("github");
            }
        } else {
            setSelectedOption({
                id: option.id,
                label: option.label,
            });
            handleProvider("protocol");
        }
        setIsOpen(false);
    };

    // <debugging> checking for the github token by logging in
    // useEffect(() => {
    // 	console.log(githubToken);
    // }, [githubToken]);

    return (
        <div className="relative md:w-[500px] text-nowrap w-[300px]">
            <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-sm bg-arlink-bg-secondary-color border border-[#383838] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-700 transition-colors focus:border-transparent"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="md:text-md text-sm">
                    {selectedOption
                        ? selectedOption.label
                        : "Select a provider"}
                </span>
                <ChevronDown
                    className={`w-4 h-4 ml ${
                        isOpen ? "rotate-0" : "rotate-180"
                    } transition-all ml-2`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 w-full mt-1 bg-arlink-bg-secondary-color border border-[#383838] rounded-md shadow-lg"
                    >
                        {options.map((option) => (
                            <button
                                type="button"
                                key={option.id}
                                className="w-full px-3 py-2 md:text-sm text-xs text-left hover:bg-neutral-800 focus:outline-none focus:bg-neutral-700 flex items-center justify-between"
                                onClick={() => handleSelect(option)}
                                disabled={loadingId === option.id}
                            >
                                <span>{option.label}</span>
                                {loadingId === option.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : selectedOption?.id === option.id ? (
                                    <Check className="w-4 h-4 text-neutral-500" />
                                ) : null}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
