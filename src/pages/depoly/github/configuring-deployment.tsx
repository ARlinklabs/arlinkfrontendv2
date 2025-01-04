import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalState } from "@/store/useGlobalState";
import {
    DirectoryStructure,
    type ArnsName,
    type BuildSettings,
    type Steps,
} from "@/types";
import { getRepoConfig } from "@/lib/getRepoconfig";
import { SelectGroup } from "@radix-ui/react-select";
import axios, { isAxiosError } from "axios";
import {
    AlertTriangle,
    ChevronDown,
    ChevronLeft,
    ExternalLink,
    Loader2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import RootDirectoryDrawer from "../../../components/rootdir-drawer";
import { useActiveAddress } from "arweave-wallet-kit";
import { toast } from "sonner";
import DomainSelection from "../../../components/shared/domain-selection";
import { getWalletOwnedNames } from "@/lib/get-arns";
import useDeploymentManager from "@/hooks/useDeploymentManager";
import { BUILDER_BACKEND } from "@/lib/utils";
import { runLua, setArnsName as setUpArnsName } from "@/lib/ao-vars";
import { useNavigate } from "react-router-dom";
import DeploymentLogs from "../../../components/shared/deploying-logs";
import {
    analyzeProjectDeploymentStructure,
    analyzeRepoStructure,
    createTokenizedRepoUrl,
    detectFrameworkImage,
    extractOwnerName,
    extractRepoName,
    handleFetchExistingArnsName,
    handleFetchLogs,
    indexInMalik,
} from "../utilts";
import NewDeploymentCard from "@/components/shared/new-deployment-card";
import { BuildDeploymentSetting } from "@/components/shared/build-settings";
import { NextJsProjectWarningCard } from "@/components/skeletons";

const ConfiguringDeploymentProject = ({
    repoName,
    repoUrl,
    setStep,
}: {
    repoName: string;
    repoUrl: string;
    setStep: React.Dispatch<React.SetStateAction<Steps>>;
}) => {
    // global state and primary hooks
    const { githubToken, managerProcess: mgProcess } = useGlobalState();
    const { managerProcess, refresh, deployments } = useDeploymentManager();
    const navigate = useNavigate();

    const activeAddress = useActiveAddress();
    const [frameWork, setFrameWork] = useState<{
        name: string;
        dir: string;
        svg: string;
    }>({
        name: "unknown",
        svg: "unknown.svg",
        dir: "unknown",
    });

    // project states
    const [projectName, setProjectName] = useState<string>("");
    const [subDir, setSubDir] = useState<DirectoryStructure[]>([]);

    // branches state
    const [branches, setBranches] = useState<string[]>(["main", "master"]);
    const [selectedBranch, setSelectedBranch] = useState<string>("main");

    // directory states
    const [rootDirectory, setRootDirectory] = useState("./");
    const [isRootDirectoryDrawerOpen, setIsRootDirectoryDrawerOpen] =
        useState(false);

    // domain states
    const [activeTab, setActiveTab] = useState<"arlink" | "existing">("arlink");
    const [customArnsName, setCustomArnsName] = useState<string>("");
    const [arnsProcess, setArnsProcess] = useState<string>("");

    // for the arns domain from wallet
    const [arnsNames, setArnsNames] = useState<ArnsName[]>([]);
    const [arnsName, setArnsName] = useState<ArnsName | undefined>(undefined);

    // build and output setting states
    const [buildSettings, setBuildSettings] = useState<BuildSettings>({
        buildCommand: { enabled: false, value: "npm run build" },
        installCommand: { enabled: false, value: "npm install" },
        outPutDir: { enabled: false, value: "./dist" },
    });

    // loading states
    const [loadingBranches, setLoadingBranches] = useState<boolean>(true);
    const [existingArnsLoading, setExistingArnsLoading] =
        useState<boolean>(true);
    const [fetchingSubDir, setFetchingSubDir] = useState<boolean>(false);

    // error states < will keep adding more after deploy button >
    const [branchError, setBranchError] = useState<string>("");
    const [arnsDropdownModal, setarnsDropdownModal] = useState(false);

    // deployment state
    const [isDeploying, setIsDeploying] = useState<boolean>(false);
    const [deploymentStarted, setDeploymentStarted] = useState<boolean>(false);
    const [deploymentComplete, setDeploymentComplete] =
        useState<boolean>(false);
    const [deploymentSucceded, setDeploymentSucceded] =
        useState<boolean>(false);

    const [deploymentFailed, setDeploymentFailed] = useState<boolean>(false);

    const [logs, setLogs] = useState<string[]>([]);
    const [logError, setLogError] = useState<string>("");
    const [isWaitingForLogs, setIsWaitingForLogs] = useState<boolean>(false);
    const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(false);

    // use effects
    useEffect(() => {
        const handleInit = async () => {
            // if we don't have the repo url we return
            if (!repoUrl) return;

            // extracting the owner and repo
            const [, , , owner, repo] = repoUrl.split("/");

            // getting the project name
            const defaultProjName = repo.replace(/\.git$/, "");

            // using the default project name, owner and repo to fetch repos
            await handleFetchRepository(defaultProjName, owner, repo);
            await handleFetchBranches();
        };

        const handleFetchRepository = async (
            defaultProjectName: string,
            owner: string,
            repo: string
        ) => {
            // Fetch repository configuration
            const config = await getRepoConfig(owner, repo);

            console.log({
                config,
            });

            setProjectName(defaultProjectName);
            setCustomArnsName(defaultProjectName);
            setBuildSettings((prev) => ({
                ...prev,
                buildCommand: {
                    value: "npm run build",
                    enabled: false,
                },
                installCommand: {
                    value: config.installCommand || "npm install",
                    enabled: false,
                },
                outPutDir: {
                    value: config.outputDir
                        ? config.outputDir === ".next"
                            ? "./dist"
                            : config.outputDir
                        : "./dist",
                    enabled: false,
                },
            }));

            setFrameWork(detectFrameworkImage(config.outputDir));
        };

        handleInit();
    }, [repoUrl]);

    // handlers

    // function to fetch all the branches
    async function handleFetchBranches() {
        if (!repoUrl) return;
        const [owner, repo] = repoUrl
            .replace("https://github.com/", "")
            .split("/");
        setBranchError("");

        try {
            const response = await axios.get<[{ name: string }]>(
                `https://api.github.com/repos/${owner}/${repo}/branches`,
                {
                    headers: {
                        Authorization: `token ${githubToken}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                }
            );

            console.log(response.data);
            const branchesNames = response.data.map((branch) => branch.name);
            setBranches(branchesNames);
        } catch (error) {
            console.error("Error fetching branches:", error);
            // If the error is 404, assume it's a single-branch repository
            if (isAxiosError(error) && error.response?.status === 404) {
                setBranches(["main"]); // Assume 'main' as the default branch
                setSelectedBranch("main");
            } else {
                setBranchError(
                    "Failed to fetch branches. Please check your repository access."
                );
            }
        } finally {
            setLoadingBranches(false);
        }
    }

    async function handleArnsSelection(arnsName: ArnsName) {
        setArnsProcess(arnsName.processId);
        setArnsName(
            arnsNames.find((arns) => arns.processId === arnsName.processId)
        );
        setarnsDropdownModal(false);
    }

    // build and output settings handler commands
    const deployProject = async () => {
        // deployment states
        setIsDeploying(true);
        setDeploymentStarted(true);
        setDeploymentComplete(false);
        setDeploymentSucceded(false);

        if (!projectName) return toast.error("Project name is required");
        if (!repoUrl) return toast.error("repository is required");
        if (!selectedBranch) return toast.error("branch is required");
        if (!buildSettings.installCommand.value)
            return toast.error("install command is required");
        if (!buildSettings.buildCommand.value)
            return toast.error("build command is required");
        if (!buildSettings.outPutDir.value)
            return toast.error("output dir is specified");
        if (!mgProcess) return toast.error("manager process not found");
        if (deployments.find((dep) => dep.Name === projectName))
            return toast.error("Project name already exists");
        if (!githubToken)
            return toast.error("github token not found", {
                description: "",
            });

        let finalArnsProcess = arnsProcess;
        let customRepo = null;

        // this is to check if the user has selected a custom domain or not
        // if he has not selected a custom domain, then we add the custom name and build the url
        if (arnsName?.name && activeTab === "existing") {
            console.log("Hello from the frist blokc");
            setCustomArnsName("");
            finalArnsProcess = arnsName.name;
            console.log("hello world");
        } else if (activeTab === "arlink") {
            if (customArnsName.length === 0) setCustomArnsName(projectName);
            setArnsName(undefined);
            finalArnsProcess = `${customArnsName}.arlink.arweave.net`;
            customRepo = projectName;
        }

        const tokenizedRepoUrl = createTokenizedRepoUrl(repoUrl, githubToken);

        try {
            handleFetchLogs({
                projectName,
                repoUrl,
                setLogs,
                setIsWaitingForLogs,
                setIsFetchingLogs,
                isWaitingForLogs,
                setLogError,
            });
            // const response = await axios.get(
            // 	`https://vmi1968527.contaboserver.net/backend/config/${owner}/${repoName}`,
            // );
            const response = await axios.post(
                // 	`https://vmi1968527.contaboserver.net/backend/}`,
                `${BUILDER_BACKEND}/deploy`,
                {
                    repository: tokenizedRepoUrl,
                    installCommand: buildSettings.installCommand.value,
                    buildCommand: buildSettings.buildCommand.value,
                    outputDir: buildSettings.outPutDir.value,
                    subDirectory: rootDirectory,
                    protocolLand: false,
                    repoName: repoName,
                    branch: selectedBranch,
                    githubToken,
                    walletAddress: activeAddress,
                    customArnsName: customArnsName || "",
                },
                {
                    timeout: 60 * 60 * 1000,
                    headers: { "Content-Type": "application/json" },
                }
            );

            // after the deployment has started we call this function
            // This function is responsible for fetching logs,
            // it handles error and the delay we were talking about efficently
            if (response.status === 200 && response.data) {
                console.log(`https://arweave.net/${response.data}`);
                toast.success("Deployment successful");
                setDeploymentSucceded(true);
                setDeploymentComplete(true);

                // repsonse.data.arnsProcess
                console.log(response.data.arnsUnderName);

                // assuming we get the transaction id after this is successful
                const query = `local res = db:exec[[
						INSERT INTO Deployments (Name, RepoUrl, Branch, InstallCMD, BuildCMD, OutputDIR, ArnsProcess)
							VALUES
						('${projectName}', '${repoUrl}', '${selectedBranch}', '${buildSettings.installCommand.value}', '${buildSettings.buildCommand.value}', '${buildSettings.outPutDir.value}', '${finalArnsProcess}')
				]]`;

                const res = await runLua(query, mgProcess);

                // if there was any error we show the toast
                if (res.Error) return toast.error(res.Error);
                console.log(res);
                await refresh();

                if (arnsName) {
                    await setUpArnsName(finalArnsProcess, response.data);
                }

                await indexInMalik({
                    projectName,
                    description: "An awesome decentralized project",
                    txid: response.data,
                    owner: activeAddress,
                    link: `https://arweave.net/${response.data}`,
                    arlink: finalArnsProcess,
                });

                // In the deploy function within pages/deploy.tsx, update this line:
                navigate(`/deployment?repo=${projectName}`);
            } else {
                throw new Error("Deployment failed: Unexpected response");
            }
        } catch (error) {
            console.error("Deployment error:", error);
            setDeploymentSucceded(false);
            setDeploymentComplete(false);
            setDeploymentFailed(true);
        } finally {
            setIsDeploying(false);
            setDeploymentComplete(true);
        }
    };

    const handleFetchArns = async () => {
        handleFetchExistingArnsName({
            setArnsNames,
            activeAddress,
            setExistingArnsLoading,
        });
    };

    const handleSettingChange = (
        setting: keyof BuildSettings,
        field: keyof BuildSettings[keyof BuildSettings],
        value: string | boolean
    ) => {
        setBuildSettings((prev) => ({
            ...prev,
            [setting]: {
                ...prev[setting],
                [field]: value,
            },
        }));
    };

    useEffect(() => {
        if (!repoUrl) return;
        if (githubToken === null) return;

        const init = async () => {
            setFetchingSubDir(true);
            try {
                const data = await analyzeRepoStructure(
                    extractOwnerName(repoUrl),
                    repoUrl,
                    githubToken as string
                );

                setSubDir(data);
            } catch (error) {
                console.log(error);
            } finally {
                setFetchingSubDir(false);
            }
        };

        init();
    }, []);

    return (
        <div className="text-white px-8 mb-20 max-w-3xl mx-auto">
            <button
                type="button"
                onClick={() => setStep("importing")}
                className="mb-6 flex items-center gap-2 text-neutral-600 hover:text-neutral-100 text-sm cursor-pointer"
            >
                <ChevronLeft size={18} /> Go back
            </button>
            <h1 className="text-2xl font-bold mb-6">
                Set up ur deployment process
            </h1>
            <div className="rounded-lg mb-6">
                <NewDeploymentCard
                    projectName={projectName}
                    framework={frameWork}
                    activeTab={activeTab}
                    customArnsName={customArnsName}
                    arnsName={arnsName}
                    selectedBranch={selectedBranch}
                />
                {frameWork.dir.toLocaleLowerCase().includes("next") && (
                    <NextJsProjectWarningCard />
                )}
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-neutral-400 text-sm font-medium mb-1"
                        >
                            Projects name
                        </label>
                        <Input
                            id="name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Enter your project name here"
                            className="bg-[#0D0D0D]  p-4 placeholder:text-neutral-500 rounded-md mt-3 border-[#383838] text-white"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="branch"
                            className="block text-neutral-400 text-sm font-medium mb-1"
                        >
                            Branch
                        </label>
                        {loadingBranches ? (
                            <Skeleton className="w-full text-sm border border-neutral-600 flex items-center justify-between gap-3 px-3 h-10 text-center focus:ring-0 focus:ring-offset-0 outline-none  bg-neutral-900 text-white">
                                <div className="flex items-center gap-3">
                                    Fetching branches
                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                    />
                                </div>
                                <ChevronDown size={15} />
                            </Skeleton>
                        ) : (
                            <Select
                                value={selectedBranch}
                                onValueChange={(value) =>
                                    setSelectedBranch(value)
                                }
                            >
                                <SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0 outline-none  bg-[#0C0C0C] border-[#383838] text-white">
                                    <SelectValue placeholder="main" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {branches.map((branch) => (
                                            <SelectItem
                                                key={branch}
                                                value={branch}
                                            >
                                                {branch}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    {branchError && (
                        <p className="text-red-500">{branchError}</p>
                    )}

                    <div>
                        <label
                            htmlFor="directory"
                            className="block text-neutral-400 text-sm font-medium mb-3"
                        >
                            Root directory
                        </label>
                        <div className="flex relative ">
                            <Input
                                id="directory"
                                value={rootDirectory}
                                readOnly
                                disabled={fetchingSubDir}
                                className="bg-[#0D0D0D] p-4 placeholder:text-neutral-500 rounded-md border-[#383838] text-white"
                            />
                            <Button
                                className="absolute h-8 right-1 top-1/2 rounded-sm -translate-y-1/2 font-semibold"
                                onClick={() =>
                                    setIsRootDirectoryDrawerOpen(true)
                                }
                                disabled={fetchingSubDir}
                            >
                                Change
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <DomainSelection
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    setExistingArnsLoading={setExistingArnsLoading}
                    handleFetchExistingArnsName={handleFetchArns}
                    setCustomArnsName={setCustomArnsName}
                    projectName={projectName}
                    customArnsName={customArnsName}
                    arnsDropDown={arnsDropdownModal}
                    setArnsDropDownModal={setarnsDropdownModal}
                    arnsNames={arnsNames}
                    existingArnsLoading={existingArnsLoading}
                    arnsName={arnsName}
                    handleArnsSelection={handleArnsSelection}
                />
            </div>

            <div className="bg-[#0C0C0C] p-6 rounded-lg mb-6 border border-[#383838]">
                <p className="text-md text-neutral-400 font-medium mb-3">
                    Build And Output Settings
                </p>

                <div className="space-y-4">
                    <BuildDeploymentSetting
                        buildSettings={buildSettings}
                        onSettingChange={handleSettingChange}
                    />
                </div>
            </div>

            <Button
                className="w-full bg-white hover:bg-neutral-200 text-black"
                onClick={deployProject}
            >
                Deploy now
            </Button>

            {deploymentStarted && (
                <DeploymentLogs
                    logs={logs}
                    isFetchingLogs={isFetchingLogs}
                    isWaitingForLogs={isWaitingForLogs}
                    logError={logError}
                />
            )}

            <RootDirectoryDrawer
                subDir={subDir}
                isOpen={isRootDirectoryDrawerOpen}
                onClose={() => setIsRootDirectoryDrawerOpen(false)}
                onSelect={setRootDirectory}
            />
        </div>
    );
};

export default ConfiguringDeploymentProject;
