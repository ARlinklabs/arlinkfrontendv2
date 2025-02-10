import { Button } from "@/components/ui/button";
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
import { AlertTriangle, ChevronDown, ChevronLeft, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import RootDirectoryDrawer from "./rootdir-drawer";
import { useActiveAddress } from "arweave-wallet-kit";
import { toast } from "sonner";
import DomainSelection from "./shared/domain-selection";
import useDeploymentManager from "@/hooks/use-deployment-manager";
import { BUILDER_BACKEND, getTime, TESTING_FETCH } from "@/lib/utils";
import { runLua, setArnsName as setArnsNameWithProcessId } from "@/lib/ao-vars";
import { useNavigate } from "react-router-dom";
import DeploymentLogs from "./shared/deploying-logs";
import {
    analyzeRepoStructure,
    createTokenizedRepoUrl,
    detectFrameworkImage,
    extractOwnerName,
    extractRepoName,
    handleFetchExistingArnsName,
    indexInMalik,
} from "../pages/utilts";
import NewDeploymentCard from "@/components/shared/new-deployment-card";
import { BuildDeploymentSetting } from "@/components/shared/build-settings";
import { NextJsProjectWarningCard } from "@/components/skeletons";
import { createGitHubWebhook } from "@/actions/github/Webhook";

const ConfiguringDeploymentProject = ({
    repoUrl,
    setStep,
}: {
    repoName: string;
    repoUrl: string;
    setStep: React.Dispatch<React.SetStateAction<Steps>>;
}) => {
    // global state and primary hooks
    const { githubToken, managerProcess: mgProcess } = useGlobalState();
    const { refresh, deployments } = useDeploymentManager();
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

    async function handleSelectRootDir(path: string) {
        setRootDirectory(path);
        const configPath = path.replace("./", "");
        const config = await getRepoConfig(
            extractOwnerName(repoUrl),
            extractRepoName(repoUrl),
            configPath,
        );
        console.log({
            config,
        });
        const { buildSettings, configFailed, framework } =
            handleConfigurationAndBuild({
                error: config.error,
                errorType: config.errorType,
                installCommand: config.installCommand,
                buildCommand: config.buildCommand,
                outputDir: config.outputDir,
            });
        handleBuildSettings({
            ...buildSettings,
        });
        setConfigFailed({
            ...configFailed,
        });
        setFrameWork(framework);
    }

    // domain states
    const [activeTab, setActiveTab] = useState<"arlink" | "existing">("arlink");
    const [customArnsName, setCustomArnsName] = useState<string>("");
    const [arnsProcess, setArnsProcess] = useState<string | null>(null);

    // for the arns domain from wallet
    const [arnsNames, setArnsNames] = useState<ArnsName[]>([]);
    const [arnsName, setArnsName] = useState<ArnsName | undefined>(undefined);

    // build and output setting states
    const [buildSettings, setBuildSettings] = useState<BuildSettings>({
        buildCommand: { enabled: false, value: "npm run build" },
        installCommand: { enabled: false, value: "pnpm install" },
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
    const [, setIsDeploying] = useState<boolean>(false);
    const [deploymentStarted, setDeploymentStarted] = useState<boolean>(false);
    const [, setDeploymentComplete] = useState<boolean>(false);
    const [, setDeploymentSucceded] = useState<boolean>(false);
    const [configFailed, setConfigFailed] = useState<{
        errorMessage: string;
        error: boolean;
    }>({
        error: false,
        errorMessage: "",
    });

    const [deploymentFailed, setDeploymentFailed] = useState<boolean>(false);

    const [logs, setLogs] = useState<string[]>([]);
    const [logError, setLogError] = useState<string>("");
    const [isWaitingForLogs, setIsWaitingForLogs] = useState<boolean>(false);
    const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(false);
    const [almostDone, setAlmostDone] = useState(false);

    type ErrorType = "static" | "server" | "not-found" | null;
    interface Config {
        error: boolean;
        errorType: ErrorType;
        installCommand: string;
        outputDir: string;
        buildCommand: string;
    }

    const handleConfigurationAndBuild = (config: Config, deno?: boolean) => {
        console.log({ bc: config.buildCommand, deno });
        let configState = {
            configFailed: {
                error: false,
                errorMessage: "",
            },
            buildSettings: {
                installCommand: config.installCommand || "pnpm install",
                outPutDir: "./dist",
                buildCommand: "npm run build",
                enabled: false,
            },
            framework: {
                name: "unknown",
                svg: "unknown.svg",
                dir: "unknown",
            },
        };

        if (config.error && config.errorType === "static") {
            configState.configFailed = {
                error: true,
                errorMessage:
                    "You are using static files please check the below commands before deploying.",
            };
            configState.buildSettings = {
                installCommand: config.installCommand,
                outPutDir: config.outputDir,
                buildCommand: config.buildCommand,
                enabled: true,
            };
        } else if (config.error && config.errorType === "server") {
            configState.configFailed = {
                error: true,
                errorMessage:
                    "Failed to fetch the configuration, please review the commands below before deploying.",
            };
            configState.buildSettings = {
                installCommand: config.installCommand,
                outPutDir: config.outputDir,
                buildCommand: config.buildCommand,
                enabled: true,
            };
        } else if (config.error && config.errorType === "not-found") {
            configState.configFailed = {
                error: true,
                errorMessage: "No index.html was found in the project",
            };
            configState.buildSettings = {
                installCommand: config.installCommand,
                outPutDir: config.outputDir,
                buildCommand: config.buildCommand,
                enabled: false,
            };
        } else {
            configState.buildSettings = {
                buildCommand: deno ? config.buildCommand : "npm run build",
                installCommand: "pnpm install",
                outPutDir: config.outputDir
                    ? config.outputDir === ".next"
                        ? "./out"
                        : config.outputDir
                    : "./dist",
                enabled: false,
            };
        }
        console.log(config.outputDir);
        configState.framework = deno
            ? {
                  name: "deno",
                  svg: "deno.svg",
                  dir: config.outputDir,
              }
            : detectFrameworkImage(config.outputDir);
        return configState;
    };

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
            repo: string,
        ) => {
            // Fetch repository configuration
            setProjectName(defaultProjectName);
            const config = await getRepoConfig(owner, repo);
            console.log(config);
            setCustomArnsName(defaultProjectName);

            const { buildSettings, configFailed, framework } =
                handleConfigurationAndBuild(
                    {
                        error: config.error,
                        errorType: config.errorType,
                        installCommand: config.installCommand,
                        buildCommand: config.buildCommand,
                        outputDir: config.outputDir,
                    },
                    config.framework === "deno",
                );
            handleBuildSettings({
                ...buildSettings,
            });
            setConfigFailed({
                ...configFailed,
            });
            setFrameWork(framework);
        };

        handleInit();
    }, [repoUrl]);

    const handleBuildSettings = ({
        installCommand,
        buildCommand,
        outPutDir,
        enabled,
    }: {
        installCommand: string;
        buildCommand: string;
        outPutDir: string;
        enabled: boolean;
    }) => {
        setBuildSettings((prev) => ({
            ...prev,
            installCommand: {
                value: installCommand,
                enabled: enabled,
            },
            buildCommand: {
                value: buildCommand,
                enabled: enabled,
            },
            outPutDir: {
                value: outPutDir,
                enabled: enabled,
            },
        }));
    };

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
                },
            );

            const branchesNames = response.data.map((branch) => branch.name);
            setBranches(branchesNames);
            setSelectedBranch(
                branchesNames.find((branch) => branch === "main") ||
                    branchesNames[0],
            );
        } catch (error) {
            console.error("Error fetching branches:", error);
            // If the error is 404, assume it's a single-branch repository
            if (isAxiosError(error) && error.response?.status === 404) {
                setBranches(["main"]); // Assume 'main' as the default branch
                setSelectedBranch("main");
            } else {
                setBranchError(
                    "Failed to fetch branches. Please check your repository access.",
                );
            }
        } finally {
            setLoadingBranches(false);
        }
    }

    async function handleArnsSelection(arnsName: ArnsName) {
        setArnsProcess(arnsName.processId);
        setArnsName(
            arnsNames.find((arns) => arns.processId === arnsName.processId),
        );
        setarnsDropdownModal(false);
    }

    // build and output settings handler commands
    const deployProject = async () => {
        if (!githubToken) return;
        // Validation checks
        const validationErrors = [
            { condition: !projectName, message: "Project name is required" },
            { condition: !repoUrl, message: "Repository is required" },
            { condition: !selectedBranch, message: "Branch is required" },
            {
                condition: !buildSettings.installCommand.value,
                message: "Install command is required",
            },
            {
                condition: !buildSettings.buildCommand.value,
                message: "Build command is required",
            },
            {
                condition: !buildSettings.outPutDir.value,
                message: "Output directory is required",
            },
            { condition: !mgProcess, message: "Manager process not found" },
            {
                condition: deployments.find((dep) => dep.Name === projectName),
                message: "Project name already exists",
            },
            { condition: !githubToken, message: "GitHub token not found" },
        ];

        const error = validationErrors.find(({ condition }) => condition);
        if (error) {
            return toast.error(error.message);
        }

        if (deploymentStarted) return;

        setIsDeploying(true);
        setDeploymentStarted(true);
        setDeploymentComplete(false);
        setDeploymentSucceded(false);

        let finalArnsProcess = arnsProcess;

        // Handle ARNS process
        if (activeTab === "existing" && arnsName?.name) {
            setCustomArnsName("");
            finalArnsProcess = arnsName.processId;
        } else if (activeTab === "arlink") {
            if (!customArnsName) {
                setCustomArnsName((prev) =>
                    prev.length === 0 ? projectName : prev,
                );
            }
            setArnsName(undefined);
            finalArnsProcess = null;
        }

        const tokenizedRepoUrl = createTokenizedRepoUrl(repoUrl, githubToken);
        const owner = extractOwnerName(repoUrl);
        const repo = extractRepoName(repoUrl);

        // Constants for polling
        const POLLING_INTERVAL = 2000;
        const MAX_POLLING_TIME = 600000;
        const INITIAL_LOG_DELAY = 10000;
        let isPollingActive = true;
        let pollingIntervalId: NodeJS.Timeout | null = null;

        const startLogPolling = async () => {
            setIsWaitingForLogs(true);
            await new Promise((resolve) =>
                setTimeout(resolve, INITIAL_LOG_DELAY),
            );
            setIsWaitingForLogs(false);
            setIsFetchingLogs(true);

            const startTime = Date.now();
            pollingIntervalId = setInterval(async () => {
                if (
                    !isPollingActive ||
                    Date.now() - startTime > MAX_POLLING_TIME
                ) {
                    if (pollingIntervalId) {
                        clearInterval(pollingIntervalId);
                        pollingIntervalId = null;
                    }
                    setIsFetchingLogs(false);
                    if (!isPollingActive) {
                        setDeploymentFailed(true);
                    }
                    return;
                }

                try {
                    const response = await axios.get(
                        `${TESTING_FETCH}/logs/${owner}/${repo}`,
                    );
                    if (response.status === 200) {
                        setLogs(response.data.split("\n"));
                    }
                } catch (error) {
                    // Continue polling even on 404
                    if (
                        axios.isAxiosError(error) &&
                        error.response?.status !== 404
                    ) {
                        console.warn("Log fetching error:", error);
                    }
                }
            }, POLLING_INTERVAL);
        };

        startLogPolling();

        try {
            // First, extract owner and repo from tokenizedRepoUrl
            const urlParts = tokenizedRepoUrl.split("/");
            const repoName = urlParts[urlParts.length - 1].replace(".git", "");
            const owner = urlParts[urlParts.length - 2];

            // 1. Create webhook first
            await createGitHubWebhook({
                owner,
                repo: repoName,
                accessToken: githubToken, // Using the same githubToken from your deployment data
                webhookSecret: "laudalasun", // Consider moving this to env variables
            });

            console.log("webhook created");

            // 2. If webhook creation succeeds, proceed with deployment
            const deploymentData = {
                repository: tokenizedRepoUrl,
                installCommand: buildSettings.installCommand.value,
                buildCommand: buildSettings.buildCommand.value,
                outputDir: buildSettings.outPutDir.value.startsWith("./")
                    ? buildSettings.outPutDir.value
                    : `./${buildSettings.outPutDir.value}`,
                subDirectory: rootDirectory,
                protocolLand: false,
                repoName: customArnsName,
                branch: selectedBranch,
                githubToken,
                walletAddress: activeAddress,
                customArnsName: customArnsName || "",
            };

            const response = await axios.post<{
                result: string;
                finalUnderName: string;
            }>(`${BUILDER_BACKEND}/deploy`, deploymentData, {
                timeout: 60 * 60 * 1000,
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 200 && response.data.result) {
                isPollingActive = false;
                setDeploymentSucceded(true);
                setDeploymentComplete(true);

                // Database operations
                const dbOperations = [
                    runLua(
                        `db:exec[[
                            INSERT INTO Deployments (
                                Name,
                                RepoUrl,
                                Branch,
                                InstallCMD,
                                BuildCMD,
                                OutputDIR,
                                ArnsProcess
                            ) 
                            VALUES (
                                '${projectName}',
                                '${repoUrl}',
                                '${selectedBranch}',
                                '${buildSettings.installCommand.value}',
                                '${buildSettings.buildCommand.value}',
                                '${buildSettings.outPutDir.value}',
                                ${
                                    finalArnsProcess
                                        ? `'${finalArnsProcess}'`
                                        : "NULL"
                                }
                            );

                            UPDATE Deployments SET DeploymentId='${
                                response.data.result
                            }' WHERE Name='${projectName}';

                            UPDATE Deployments SET UnderName='${
                                response.data.finalUnderName
                            }' WHERE Name='${projectName}';
                        ]]`,
                        mgProcess,
                    ),

                    indexInMalik({
                        projectName,
                        description: "An awesome decentralized project",
                        txid: response.data.result,
                        owner: activeAddress,
                        link: `https://arweave.net/${response.data.result}`,
                        arlink: finalArnsProcess || null,
                    }),
                ];

                if (activeTab === "existing" && arnsName) {
                    const userArns = await setArnsNameWithProcessId(
                        arnsName.processId,
                        response.data.result,
                    );
                    dbOperations.push(
                        runLua(
                            `db:exec[[
                            INSERT INTO NewDeploymentHistory (Name, DeploymentID, AssignedUndername, Date) 
                            VALUES ('${projectName}', '${
                                response.data.result
                            }', 
                            ${
                                userArns ? `'${userArns}'` : "NULL"
                            }, '${getTime()}')
                        ]]`,
                            mgProcess,
                        ),
                    );
                }

                setIsFetchingLogs(() => false);
                setAlmostDone(true);
                await Promise.all(dbOperations);
                await runLua(
                    `db:exec[[
                                INSERT INTO NewDeploymentHistory (Name, DeploymentID, AssignedUndername, Date) VALUES
                                ('${projectName}', '${
                        response.data.result
                    }', '${response.data.finalUnderName}', '${getTime()}')
                            ]]`,
                    mgProcess,
                );

                await refresh();
                toast.success("Deployment successful");
                navigate(`/deployment/card?repo=${projectName}`);
            } else {
                throw new Error("Deployment failed: Unexpected response");
            }
        } catch (error) {
            isPollingActive = false;
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 406) {
                    setLogError(
                        "Too many requests detected. Please try again later.",
                    );
                } else if (error.response?.status === 500) {
                    setLogError("Build failed, please check logs");
                } else if (error.response?.status === 429) {
                    setLogError("Daily deployment limit over");
                } else if (error.response?.status === 204) {
                    setLogError("Daily deployment limit over");
                } else if (error.response?.status === 404) {
                    setLogError("Server down please try again later");
                } else {
                    setLogError("Unknown error occured please try again later");
                }
            } else {
                console.error("Deployment error:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred";
                setLogError(`Deployment failed: ${errorMessage}`);
            }
            setDeploymentSucceded(false);
            setDeploymentComplete(false);
            setDeploymentFailed(true);
        } finally {
            if (pollingIntervalId) {
                clearInterval(pollingIntervalId);
            }
            setIsDeploying(false);
            setDeploymentComplete(true);
            setIsFetchingLogs(false);
            setIsWaitingForLogs(false);
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
        value: string | boolean,
    ) => {
        setBuildSettings((prev) => ({
            ...prev,
            [setting]: {
                ...prev[setting],
                [field]: value,
            },
        }));
    };

    const fetchRepoStructure = async () => {
        if (!repoUrl) return;
        if (githubToken === null) return;

        setFetchingSubDir(true);

        try {
            const data = await analyzeRepoStructure(
                extractOwnerName(repoUrl),
                extractRepoName(repoUrl),
                githubToken as string,
            );

            setSubDir(data);

            setIsRootDirectoryDrawerOpen(true);
        } catch (error) {
            console.log(error);
        } finally {
            setFetchingSubDir(false);
        }
    };

    return (
        <div className="text-white md:px-8 px-4 mb-20 max-w-3xl mx-auto">
            <button
                type="button"
                onClick={() => setStep("importing")}
                className="mb-6 flex items-center gap-2 text-neutral-600 hover:text-neutral-100 text-sm cursor-pointer"
            >
                <ChevronLeft size={18} /> Go back
            </button>
            <h1 className="md:text-2xl text-xl font-bold mb-6">
                Set up ur deployment process
            </h1>
            <div
                className={`rounded-lg ${
                    deploymentStarted ? "opacity-70" : "opacity-100"
                } mb-6`}
            >
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
                            disabled={deploymentStarted}
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
                                disabled={deploymentStarted}
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
                                disabled={fetchingSubDir || deploymentStarted}
                                className="bg-[#0D0D0D] p-4 placeholder:text-neutral-500 rounded-md border-[#383838] text-white"
                            />
                            <Button
                                className="absolute h-8 right-1 top-1/2 rounded-sm -translate-y-1/2 font-semibold"
                                onClick={fetchRepoStructure}
                                disabled={fetchingSubDir || deploymentStarted}
                            >
                                {fetchingSubDir ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    "Change"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`mb-6 ${
                    deploymentStarted
                        ? "opacity-80 pointer-events-none"
                        : "opacity-100"
                }`}
            >
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

            <div
                className={`bg-[#0C0C0C] p-6 rounded-lg mb-6 border border-[#383838] ${
                    deploymentStarted ? "opacity-80" : "opacity-100"
                }`}
            >
                <p className="text-md text-neutral-400 font-medium mb-3">
                    Build And Output Settings
                </p>

                <div className="space-y-4">
                    {configFailed.error && (
                        <div className="bg-neutral-900 p-4 rounded-lg shadow-md">
                            <p className="text-sm flex-center gap-2 font-medium text-neutral-200">
                                <AlertTriangle size={14} />
                                {configFailed.errorMessage}
                            </p>
                        </div>
                    )}

                    <BuildDeploymentSetting
                        buildSettings={buildSettings}
                        onSettingChange={handleSettingChange}
                        disabled={deploymentStarted}
                    />
                </div>
            </div>

            <Button
                className="w-full bg-white hover:bg-neutral-200 text-black"
                onClick={deployProject}
                disabled={deploymentStarted}
            >
                Deploy now
            </Button>

            {deploymentStarted && (
                <DeploymentLogs
                    logs={logs}
                    isFetchingLogs={isFetchingLogs}
                    isWaitingForLogs={isWaitingForLogs}
                    logError={logError}
                    almostDone={almostDone}
                />
            )}
            <RootDirectoryDrawer
                subDir={subDir}
                isOpen={isRootDirectoryDrawerOpen}
                onClose={() => setIsRootDirectoryDrawerOpen(false)}
                onSelect={handleSelectRootDir}
            />

            {deploymentFailed && (
                <button
                    type="button"
                    onClick={() => setStep("importing")}
                    className="transition-all mt-6 flex items-center gap-2 text-neutral-600 hover:text-neutral-100 text-sm cursor-pointer"
                >
                    <ChevronLeft size={18} /> Go back
                </button>
            )}
        </div>
    );
};

export default ConfiguringDeploymentProject;
