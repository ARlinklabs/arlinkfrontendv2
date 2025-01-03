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
import { Switch } from "@/components/ui/switch";
import { useGlobalState } from "@/store/useGlobalState";
import type { ArnsName, Steps } from "@/types";
import { getRepoConfig } from "@/lib/getRepoconfig";
import { SelectGroup } from "@radix-ui/react-select";
import axios, { isAxiosError } from "axios";
import {
    AlertTriangle,
    ChevronDown,
    ChevronLeft,
    ExternalLink,
    GitBranch,
    Globe,
    Loader2,
    MoreVertical,
} from "lucide-react";
import { useEffect, useState } from "react";
import RootDirectoryDrawer from "./rootdir-drawer";
import { useActiveAddress } from "arweave-wallet-kit";
import { toast } from "sonner";
import DomainSelection from "./domain-selection";
import { getWalletOwnedNames } from "@/lib/get-arns";
import useDeploymentManager from "@/hooks/useDeploymentManager";
import { BUILDER_BACKEND } from "@/lib/utils";
import { runLua, setArnsName as setUpArnsName } from "@/lib/ao-vars";
import { useNavigate } from "react-router-dom";
import DeploymentLogs from "./deploying-logs";
import {
    createTokenizedRepoUrl,
    detectFrameworkImage,
    handleFetchLogs,
    indexInMalik,
} from "./utilts";

const ConfiguringDeploymentProject = ({
    repoUrl,
    setStep,
}: {
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
    const [arnsNames, setArnsNames] = useState<ArnsName[]>([
        {
            name: "arnsOne",
            processId: "1",
        },
    ]);

    const [arnsName, setArnsName] = useState<ArnsName | undefined>(undefined);

    // build and output setting states
    const [buildSettings, setBuildSettings] = useState({
        buildCommand: { enabled: false, value: "npm run build" },
        installCommand: { enabled: false, value: "npm install" },
        outPutDir: { enabled: false, value: "./dist" },
    });

    // loading states
    const [loadingBranches, setLoadingBranches] = useState<boolean>(true);
    const [existingArnsLoading, setExistingArnsLoading] =
        useState<boolean>(true);

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

    // log states
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
            // setting the config values
            // default project names
            setProjectName(defaultProjectName);
            setCustomArnsName(defaultProjectName);
            // build and output settinsg configuration
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

    // when arns existing arns is selected this will will called
    async function handleFetchExistingArnsName() {
        setExistingArnsLoading(true);
        if (!activeAddress) {
            toast.error("wallet address not found");
            return;
        }
        try {
            // our logic of fetching the arns name
            const names = await getWalletOwnedNames(activeAddress);
            setArnsNames(names);
            console.log("hello world");
        } catch (error) {
            console.error("Error fetching ArNS names:", error);
            toast.error("Failed to fetch ArNS names");
        } finally {
            setExistingArnsLoading(false);
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
    const handleSettingChange = (
        setting: keyof typeof buildSettings,
        field: "enabled" | "value",
        value: boolean | string
    ) => {
        setBuildSettings((prev) => ({
            ...prev,
            [setting]: { ...prev[setting], [field]: value },
        }));
    };

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
                    branch: selectedBranch,
                    installCommand: "bun install",
                    buildCommand: "bun run build",
                    subDirectory: rootDirectory,
                    outputDir: buildSettings.outPutDir.value,
                    repoName: customArnsName,
                    githubToken,
                },
                {
                    timeout: 60 * 60 * 1000,
                    headers: { "Content-Type": "application/json" },
                }
            );
            console.log("----------------RESPONSE-------------------------");
            console.log({
                response,
            });
            console.log("-----------------------------------------");

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
						('${projectName}', '${repoUrl}', '${selectedBranch}', '${buildSettings.installCommand}', '${buildSettings.buildCommand}', '${buildSettings.outPutDir}', '${finalArnsProcess}')
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
                toast.error("deployment failed");
                throw new Error("Deployment failed: Unexpected response");
            }
        } catch (error) {
            console.error("Deployment error:", error);
            toast.error("deployment failed. Please check logs on dashboard");
            setDeploymentSucceded(false);
            setDeploymentComplete(false);
            setDeploymentFailed(true);
        } finally {
            setIsDeploying(false);
            setDeploymentComplete(true);
        }
    };

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
                <Card className="mb-6 bg-arlink-bg-secondary-color border border-neutral-800 w-full text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-neutral-500 font-semibold">
                            New Deployment card
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="relative w-16 h-16 overflow-hidden rounded-lg bg-neutral-700">
                                <img
                                    src={`/logos/${frameWork.svg}`}
                                    alt={`/logos/${frameWork.name}`}
                                    className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">
                                    {projectName.length === 0
                                        ? "Project Name"
                                        : projectName}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-neutral-400">
                                    <Globe className="w-4 h-4" />
                                    <div className="hover:underline">
                                        {activeTab === "arlink"
                                            ? `${
                                                  customArnsName.length === 0
                                                      ? projectName.toLowerCase()
                                                      : customArnsName.toLocaleLowerCase()
                                              }.arlink.arweave.net`
                                            : `${projectName}.${arnsName?.name}`}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2 text-sm text-neutral-400">
                                    <GitBranch className="w-4 h-4" />
                                    <span>{selectedBranch}</span>
                                </div>
                                <button
                                    type="button"
                                    className="text-neutral-400 hover:text-white transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {frameWork.dir.toLocaleLowerCase().includes("next") && (
                    <Card className="w-full mb-4 mx-auto bg-yellow-950/30 border-yellow-500/50 shadow-lg shadow-yellow-500/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center text-yellow-300">
                                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                                Warning
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <p className="mb-3 text-yellow-200">
                                You are deploying a Next.js project. Make sure
                                you are using a static export.
                            </p>
                            <p className="font-medium text-yellow-100 mb-2">
                                Learn how to deploy a Next.js project:
                            </p>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="https://arlink.gitbook.io/arlink-docs/getting-started/making-your-website-arweave-compatible#next.js"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center text-yellow-300 hover:text-yellow-100 transition-colors"
                                    >
                                        Arlink Next.js docs
                                        <ExternalLink className="w-4 h-4 ml-1" />
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://nextjs.org/docs/pages/building-your-application/deploying/static-exports"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center text-yellow-300 hover:text-yellow-100 transition-colors"
                                    >
                                        Next.js docs
                                        <ExternalLink className="w-4 h-4 ml-1" />
                                    </a>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
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
                                className="bg-[#0D0D0D] p-4 placeholder:text-neutral-500 rounded-md border-[#383838] text-white"
                            />
                            <Button
                                className="absolute h-8 right-1 top-1/2 rounded-sm -translate-y-1/2 font-semibold"
                                onClick={() =>
                                    setIsRootDirectoryDrawerOpen(true)
                                }
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
                    handleFetchExistingArnsName={handleFetchExistingArnsName}
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
                    <div>
                        <p className="mb-3 font-medium text-sm">
                            Build command
                        </p>
                        <div className="relative">
                            {/* <div className="flex items-center absolute right-2 z-10 top-1/2 -translate-y-1/2 justify-between">
								<Switch
									checked={buildSettings.buildCommand.enabled}
									onCheckedChange={(checked) =>
										handleSettingChange("buildCommand", "enabled", checked)
									}
								/>
							</div> */}
                            <Input
                                placeholder="npm run build"
                                value={buildSettings.buildCommand.value}
                                onChange={(e) =>
                                    handleSettingChange(
                                        "buildCommand",
                                        "value",
                                        e.target.value
                                    )
                                }
                                disabled={!buildSettings.buildCommand.enabled}
                                className="bg-[#0C0C0C] border-[#383838] text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <p className="mb-3 font-medium text-sm">
                            Install command
                        </p>
                        <div className="relative">
                            <div className="flex items-center absolute right-2 z-10 top-1/2 -translate-y-1/2 justify-between">
                                <Switch
                                    checked={
                                        buildSettings.installCommand.enabled
                                    }
                                    onCheckedChange={(checked) =>
                                        handleSettingChange(
                                            "installCommand",
                                            "enabled",
                                            checked
                                        )
                                    }
                                />
                            </div>
                            <Input
                                placeholder="Enter your install command"
                                value={buildSettings.installCommand.value}
                                onChange={(e) =>
                                    handleSettingChange(
                                        "installCommand",
                                        "value",
                                        e.target.value
                                    )
                                }
                                disabled={!buildSettings.installCommand.enabled}
                                className="bg-[#0C0C0C] border-[#383838] text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <p className="mb-3 font-medium text-sm">Output dir</p>
                        <div className="relative">
                            <div className="flex items-center absolute right-2 z-10 top-1/2 -translate-y-1/2 justify-between">
                                <Switch
                                    checked={buildSettings.outPutDir.enabled}
                                    onCheckedChange={(checked) =>
                                        handleSettingChange(
                                            "outPutDir",
                                            "enabled",
                                            checked
                                        )
                                    }
                                />
                            </div>
                            <Input
                                placeholder="Enter your output dir"
                                value={buildSettings.outPutDir.value}
                                onChange={(e) =>
                                    handleSettingChange(
                                        "outPutDir",
                                        "value",
                                        e.target.value
                                    )
                                }
                                disabled={!buildSettings.outPutDir.enabled}
                                className="bg-[#0C0C0C] border-[#383838] text-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Button
                className="w-full bg-white hover:bg-neutral-200 text-black"
                onClick={deployProject}
            >
                Deploy now {frameWork.name}
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
                isOpen={isRootDirectoryDrawerOpen}
                onClose={() => setIsRootDirectoryDrawerOpen(false)}
                onSelect={setRootDirectory}
            />
        </div>
    );
};

export default ConfiguringDeploymentProject;
