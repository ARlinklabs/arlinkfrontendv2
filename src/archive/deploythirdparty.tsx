"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Search, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Ansi from "@agbishop/react-ansi-18";
import Layout from "@/layouts/layout";
import { useGlobalState } from "@/store/useGlobalState";
import { runLua } from "@/lib/ao-vars";
import { toast } from "sonner";
import axios from "axios";
import { BUILDER_BACKEND } from "@/lib/utils";
import useDeploymentManager from "@/hooks/useDeploymentManager";
import { useActiveAddress } from "arweave-wallet-kit";
import fetchUserRepos from "@/lib/fetchprotolandrepo";
import { getWalletOwnedNames } from "@/lib/get-arns";
import { Switch } from "@/components/ui/switch";
import { setArnsName } from "@/lib/ao-vars";
import { useNavigate } from "react-router-dom";

type ProtocolLandRepo = {
    name: string;
    cloneUrl: string;
};

// Define a custom type for Axios errors
type AxiosErrorType = {
    isAxiosError: boolean;
    response?: {
        status: number;
    };
};

// Update the type guard function
function isAxiosError(error: any): error is AxiosErrorType {
    return error && error.isAxiosError === true;
}

function Logs({
    name,
    deploying,
    repoUrl,
    owner,
}: {
    name: string;
    deploying?: boolean;
    repoUrl: string;
    owner: string;
}) {
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!name || !repoUrl || !owner) return;
        const repo = name;
        let startTime = Date.now();
        const waitTime = 60000; // 1 minute in milliseconds

        const interval: ReturnType<typeof setInterval> = setInterval(
            async () => {
                if (!deploying) return clearInterval(interval);

                try {
                    const logs = await axios.get(
                        `${BUILDER_BACKEND}/logs/${owner}/${repo}`
                    );
                    console.log(logs.data);
                    //@ts-ignore
                    setOutput(
                        (logs.data as string).replaceAll(/\\|\||\-/g, "")
                    );
                    setError(null);

                    setTimeout(() => {
                        const logsDiv = document.getElementById("logs");
                        logsDiv?.scrollTo({
                            top: logsDiv.scrollHeight,
                            behavior: "smooth",
                        });
                    }, 100);
                } catch (error: unknown) {
                    if (isAxiosError(error) && error.response?.status === 404) {
                        const elapsedTime = Date.now() - startTime;
                        if (elapsedTime < waitTime) {
                            setError("Waiting for logs...");
                        } else {
                            setError(
                                "Failed to fetch logs after 1 minute. They may not be available yet."
                            );
                            clearInterval(interval);
                        }
                    } else {
                        setError("An error occurred while fetching logs.");
                        console.error("Error fetching logs:", error);
                        clearInterval(interval);
                    }
                }
            },
            1000
        );

        return () => {
            clearInterval(interval);
        };
    }, [name, deploying, repoUrl, owner]);

    return (
        <div>
            <div className="pl-2 mb-1">Build Logs</div>
            {error ? (
                <div className="text-yellow-500 pl-2 mb-2">{error}</div>
            ) : null}
            <pre
                className="font-mono text-xs border p-2 rounded-lg px-4 bg-black/30 overflow-scroll max-h-[250px]"
                id="logs"
            >
                <Ansi log={output} />
            </pre>
        </div>
    );
}

export default function DeployThirdParty() {
    const globalState = useGlobalState();
    const navigate = useNavigate();
    //@ts-ignore
    const { managerProcess, refresh, deployments } = useDeploymentManager();
    const address = useActiveAddress();
    const [projName, setProjName] = useState("");
    const [repoUrl, setRepoUrl] = useState("");
    const [installCommand, setInstallCommand] = useState("npm ci");
    const [buildCommand, setBuildCommand] = useState("npm run build");
    const [outputDir, setOutputDir] = useState("./dist");
    const [deploying, setDeploying] = useState(false);
    const [arnsProcess, setArnsProcess] = useState("");
    const [protocolLandRepos, setProtocolLandRepos] = useState<
        ProtocolLandRepo[]
    >([]);
    const [selectedRepo, setSelectedRepo] = useState<ProtocolLandRepo | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [arnsNames, setArnsNames] = useState<
        { name: string; processId: string }[]
    >([]);
    const [loadingArnsNames, setLoadingArnsNames] = useState(false);
    const [showArnsDropdown, setShowArnsDropdown] = useState(false);
    const [step, setStep] = useState<
        "repositories" | "project" | "domain" | "deploy"
    >("repositories");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [useArns, setUseArns] = useState(false);
    const [customArnsName, setCustomArnsName] = useState("");

    useEffect(() => {
        async function fetchRepos() {
            if (!address) {
                toast.error("Please connect your wallet first");
                setLoading(false);
                return;
            }
            try {
                const repos = await fetchUserRepos(address);
                setProtocolLandRepos(repos);
            } catch (error) {
                console.error("Error fetching repositories:", error);
                toast.error("Failed to fetch repositories");
            } finally {
                setLoading(false);
            }
        }

        fetchRepos();
    }, [address]);

    const filteredRepositories = protocolLandRepos.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRepoSelect = (repo: ProtocolLandRepo) => {
        setSelectedRepo(repo);
        setRepoUrl(repo.cloneUrl);
        setProjName(repo.name);
        setStep("project");
    };

    const handleBack = () => {
        switch (step) {
            case "repositories":
                // We'll keep it at "repositories" instead of setting to "initial"
                break;
            case "project":
                setStep("repositories");
                break;
            case "domain":
                setStep("project");
                break;
            case "deploy":
                if (!deploying) {
                    setStep("domain");
                }
                break;
        }
    };

    const handleNext = () => {
        switch (step) {
            case "project":
                setStep("domain");
                break;
            case "domain":
                deploy();
                break;
        }
    };

    //--------------------FETCH ARNS NAMES----------------------
    async function fetchArnsNames() {
        if (!address) {
            toast.error("Wallet address not found");
            return;
        }
        setLoadingArnsNames(true);
        try {
            const names = await getWalletOwnedNames(address);
            setArnsNames(names);
        } catch (error) {
            console.error("Error fetching ArNS names:", error);
            toast.error("Failed to fetch ArNS names");
        } finally {
            setLoadingArnsNames(false);
        }
    }

    //--------------------ARNS SELECTION SHIT----------------------
    function handleArnsSelection(
        selectedArns: { name: string; processId: string } | null
    ) {
        if (selectedArns) {
            setArnsProcess(selectedArns.processId);
            setUseArns(true);
        } else {
            setArnsProcess("");
            setUseArns(false);
        }
        setShowArnsDropdown(false);
    }


    //--------------------DEPLOYMENT SHIT----------------------
    async function deploy() {
        if (!projName) return toast.error("Project Name is required");
        if (!repoUrl) return toast.error("Repository URL is required");
        if (!installCommand) return toast.error("Install Command is required");
        if (!buildCommand) return toast.error("Build Command is required");
        if (!outputDir) return toast.error("Output Directory is required");
        if (!address) return toast.error("Wallet address is required");

        if (deploying) return;
        if (!globalState.managerProcess)
            return toast.error("Manager process not found");
        if (deployments.find((dep) => dep.Name === projName))
            return toast.error("Project name already exists");

        let finalArnsProcess = arnsProcess;
        //@ts-ignore
        let customRepo = null;
        if (!useArns && customArnsName) {
            finalArnsProcess = `${customArnsName}.arlink.arweave.net`;
            customRepo = customArnsName;
        }

        setDeploying(true);
        setStep("deploy");

        const query = `local res = db:exec[[
            INSERT INTO Deployments (Name, RepoUrl, InstallCMD, BuildCMD, OutputDIR, ArnsProcess)
                VALUES
            ('${projName}', '${repoUrl}', '${installCommand}', '${buildCommand}', '${outputDir}', '${finalArnsProcess}')
        ]]`;
        console.log(query);

        const res = await runLua(query, globalState.managerProcess);
        if (res.Error) return toast.error(res.Error);
        console.log(res);
        await refresh();

        try {
            const txid = await axios.post(
                `${BUILDER_BACKEND}/deploy`,
                {
                    repository: repoUrl,
                    installCommand,
                    buildCommand,
                    outputDir,
                    branch: "main", // Assuming main branch for Protocol Land repos
                    subDirectory: "./",
                    protocolLand: true,
                    repoName: selectedRepo.name,
                    walletAddress: address,
                    customArnsName: customArnsName || "",
                },
                {
                    timeout: 60 * 60 * 1000,
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (txid.status === 200) {
                console.log("https://arweave.net/" + txid.data);
                toast.success("Deployment successful");

                //@ts-ignore
                const updres = await runLua(
                    `db:exec[[UPDATE Deployments SET DeploymentId='${txid.data}' WHERE Name='${projName}']]`,
                    globalState.managerProcess
                );

                // Only set ArNS name if we're using ArNS (either existing or custom)
                if (useArns || customArnsName) {
                    await setArnsName(finalArnsProcess, txid.data);
                }

                navigate(`/deployment?repo=${projName}`);
            } else {
                toast.error("Deployment failed");
                console.log(txid);
            }
        } catch (error) {
            toast.error("Deployment failed");
            console.log(error);
        }

        setDeploying(false);
    }

    return (
        <Layout>
            <div className="min-h-screen">
                <header className="flex justify-between items-center p-6 border-b border-border bg-transparent">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Deploy from Protocol Land
                        </h1>
                    </div>
                </header>

                <div className="p-6 max-w-4xl mx-auto">
                    {step === "repositories" && (
                        <div className="space-y-6">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search repositories..."
                                    className="w-full pl-10 bg-card/50 shadow-md"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center">
                                        <Loader className="animate-spin inline-block mr-2" />
                                        Loading repositories...
                                    </div>
                                ) : filteredRepositories.length > 0 ? (
                                    filteredRepositories.map((repo) => (
                                        <div
                                            key={repo.cloneUrl}
                                            className="flex items-center justify-between bg-card/50 p-4 rounded-md shadow-lg"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-md"></div>
                                                <div>
                                                    <p className="font-medium">
                                                        {repo.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    handleRepoSelect(repo)
                                                }
                                                className="bg-background/50 shadow-md"
                                            >
                                                Import
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center">
                                        No repositories found. Please make sure
                                        your wallet is connected and you have
                                        repositories on Protocol Land.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === "project" && (
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="project-name">
                                    Project Name
                                </Label>
                                <Input
                                    id="project-name"
                                    value={projName}
                                    onChange={(e) =>
                                        setProjName(e.target.value)
                                    }
                                    className="mt-1 bg-card/50 shadow-md"
                                />
                            </div>
                            <div>
                                <Label htmlFor="output-dir">
                                    Output Directory
                                </Label>
                                <Input
                                    id="output-dir"
                                    value={outputDir}
                                    onChange={(e) =>
                                        setOutputDir(e.target.value)
                                    }
                                    className="mt-1 bg-card/50 shadow-md"
                                    placeholder="./dist"
                                />
                            </div>
                            <div>
                                <Label htmlFor="install-command">
                                    Install Command
                                </Label>
                                <Input
                                    id="install-command"
                                    value={installCommand}
                                    onChange={(e) =>
                                        setInstallCommand(e.target.value)
                                    }
                                    className="mt-1 bg-card/50 shadow-md"
                                />
                            </div>
                            <div>
                                <Label htmlFor="build-command">
                                    Build Command
                                </Label>
                                <Input
                                    id="build-command"
                                    value={buildCommand}
                                    onChange={(e) =>
                                        setBuildCommand(e.target.value)
                                    }
                                    className="mt-1 bg-card/50 shadow-md"
                                />
                            </div>
                        </div>
                    )}

                    {step === "domain" && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="use-arns"
                                    checked={useArns}
                                    onCheckedChange={(checked) => {
                                        setUseArns(checked);
                                        if (!checked) {
                                            setArnsProcess("");
                                        }
                                    }}
                                />
                                <Label htmlFor="use-arns">
                                    Use existing ArNS
                                </Label>
                            </div>
                            {useArns ? (
                                <>
                                    <Label htmlFor="arns-process">
                                        ArNS Name
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Select an ArNS name or enter Process ID"
                                            id="arns-process"
                                            value={arnsProcess}
                                            onChange={(e) =>
                                                setArnsProcess(e.target.value)
                                            }
                                            onFocus={() => {
                                                setShowArnsDropdown(true);
                                                if (arnsNames.length === 0) {
                                                    fetchArnsNames();
                                                }
                                            }}
                                            className="bg-card/50 shadow-md"
                                        />
                                        {showArnsDropdown && (
                                            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                                                <ul className="py-1">
                                                    <li
                                                        className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-gray-200"
                                                        onClick={() =>
                                                            handleArnsSelection(
                                                                null
                                                            )
                                                        }
                                                    >
                                                        None
                                                    </li>
                                                    {arnsNames.map((arns) => (
                                                        <li
                                                            key={arns.processId}
                                                            className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-gray-200"
                                                            onClick={() =>
                                                                handleArnsSelection(
                                                                    arns
                                                                )
                                                            }
                                                        >
                                                            {arns.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {loadingArnsNames && (
                                                    <div className="flex justify-center py-2">
                                                        <Loader className="animate-spin text-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <Label htmlFor="custom-arns-name">
                                        Custom ArNS Undername
                                    </Label>
                                    <Input
                                        placeholder="yournamechoice"
                                        id="custom-arns-name"
                                        value={customArnsName}
                                        onChange={(e) =>
                                            setCustomArnsName(e.target.value)
                                        }
                                        className="mt-1 bg-card/50 shadow-md"
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Your custom name will be:{" "}
                                        {customArnsName
                                            ? `${customArnsName}_arlink.arweave.net`
                                            : ""}{" "}
                                        (if available)
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === "deploy" && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">
                                Deployment Logs
                            </h2>
                            <div className="bg-card/50 p-4 rounded-md h-64 overflow-y-auto shadow-lg">
                                <Logs
                                    name={selectedRepo?.name || ""}
                                    deploying={deploying}
                                    repoUrl={repoUrl}
                                    owner={address || ""}
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-between">
                        {step !== "repositories" && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={step === "deploy" && deploying}
                                className="bg-background/50 shadow-md"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        )}
                        {(step === "project" || step === "domain") && (
                            <Button
                                className="ml-auto bg-primary/80 hover:bg-primary/90 shadow-lg"
                                onClick={handleNext}
                            >
                                {step === "domain" ? "Deploy" : "Next"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <footer className="mt-8 p-6 border-t border-border text-center text-muted-foreground bg-transparent">
                    <a href="#" className="hover:text-foreground">
                        Learn more about deploying projects →
                    </a>
                </footer>
            </div>
        </Layout>
    );
}
