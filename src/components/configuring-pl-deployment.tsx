import useDeploymentManager, {
    historyTable,
} from "@/hooks/use-deployment-manager";
import { ArnsName, BuildSettings, Steps } from "@/types";
import { useActiveAddress, useApi } from "@arweave-wallet-kit/react";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import NewDeploymentCard from "@/components/shared/new-deployment-card";
import { handleFetchExistingArnsName} from "../pages/utilts";
import { Input } from "@/components/ui/input";
import DomainSelection from "@/components/shared/domain-selection";
import { BuildDeploymentSetting } from "@/components/shared/build-settings";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios, { isAxiosError } from "axios";
import { BUILDER_BACKEND, getTime } from "@/lib/utils";
import { runLua } from "@/lib/ao-vars";
import DeploymentLogs from "./shared/deploying-logs";
import { setArnsName as setArnsNameWithProcessId } from "@/lib/ao-vars";

const ConfigureProtocolLandProject = ({
    setStep,
    selectedRepo,
}: {
    setStep: React.Dispatch<React.SetStateAction<Steps>>;
    selectedRepo: { name: string; url: string };
}) => {
    const { managerProcess, refresh, deployments } = useDeploymentManager();
    const navigate = useNavigate();
    const api = useApi();
    const activeAddress = useActiveAddress();

    // project states
    const [projectName, setProjectName] = useState<string>(selectedRepo.name);
    const [branch, setBranch] = useState<string>("main");
    const [buildSettings, setBuildSettings] = useState<BuildSettings>({
        buildCommand: { enabled: true, value: "npm run build" },
        installCommand: { enabled: true, value: "pnpm install" },
        outPutDir: { enabled: true, value: "./dist" },
    });
    const [rootDir, setRootDir] = useState<string>("./");

    // domain states
    const [activeTab, setActiveTab] = useState<"arlink" | "existing">("arlink");
    const [customArnsName, setCustomArnsName] = useState<string>("");
    const [arnsProcess, setArnsProcess] = useState<string | null>(null);

    // for the arns domain from wallet
    const [arnsNames, setArnsNames] = useState<ArnsName[]>([]);
    const [arnsName, setArnsName] = useState<ArnsName | undefined>(undefined);
    const [arnsDropdownModal, setarnsDropdownModal] = useState(false);

    // loading states
    const [, setIsDeploying] = useState<boolean>(false);
    const [existingArnsLoading, setExistingArnsLoading] =
        useState<boolean>(true);
    const [, setAlmostDone] = useState<boolean>(false);

    // deployment status states
    const [deploymentStarted, setDeploymentStarted] = useState<boolean>(false);
    const [, setDeploymentComplete] = useState<boolean>(false);
    const [, setDeploymentSucceded] = useState<boolean>(false);
    const [deploymentFailed, setDeploymentFailed] = useState<boolean>(false);

    // log states
    const [logs, setLogs] = useState<string[]>([]);
    const [logError, setLogError] = useState<string>("");
    const [isWaitingForLogs, setIsWaitingForLogs] = useState<boolean>(false);
    const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(false);

    // handlers
    const handleFetchArns = async () => {
        handleFetchExistingArnsName({
            setArnsNames,
            activeAddress,
            setExistingArnsLoading,
        });
    };

    async function handleArnsSelection(arnsName: ArnsName) {
        setArnsProcess(arnsName.processId);
        setArnsName(
            arnsNames.find((arns) => arns.processId === arnsName.processId),
        );
        setarnsDropdownModal(false);
    }

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

    const handleDeployProject = async () => {
            // Check deployment limit first
            

        // Get signer and validate it's available
        if (!api) {
            return toast.error("Wallet API not available. Please ensure your wallet is connected properly.");
        }
        const signer = api.getAoSigner();
        if (!signer) {
            return toast.error("Wallet signer not available. Please ensure your wallet is connected properly.");
        }

        // Validation checks
        const validationErrors = [
            { condition: !projectName, message: "Project Name is required" },
            {
                condition: !selectedRepo.url,
                message: "Repository URL is required",
            },
            {
                condition: !buildSettings.installCommand,
                message: "Install Command is required",
            },
            {
                condition: !buildSettings.buildCommand,
                message: "Build Command is required",
            },
            {
                condition: !buildSettings.outPutDir,
                message: "Output Directory is required",
            },
            {
                condition: !activeAddress,
                message: "Wallet address is required",
            },
            {
                condition: !managerProcess,
                message: "Manager process not found",
            },
            {
                condition: deployments.find((dep) => dep.Name === projectName),
                message: "Project name already exists",
            },
        ];

        const error = validationErrors.find(({ condition }) => condition);
        if (error) return toast.error(error.message);
        if (deploymentStarted) return;

        // Initial state setup
        setIsDeploying(true);
        setDeploymentStarted(true);
        setDeploymentComplete(false);
        setDeploymentSucceded(false);

        let finalArnsProcess = arnsProcess;
        // @ts-ignore
        let customRepo = null;

        // Handle ARNS process
        switch (activeTab) {
            case "existing":
                if (arnsName?.name) {
                    setCustomArnsName("");
                    finalArnsProcess = arnsName.processId;
                }
                break;
            case "arlink":
                if (!customArnsName) {
                    setCustomArnsName(projectName);
                }
                setArnsName(undefined);
                finalArnsProcess = null;
                break;
        }

        // Log polling setup
        const owner = activeAddress;
        const repo = selectedRepo.name;
        const POLLING_INTERVAL = 2000;
        const MAX_POLLING_TIME = 600000;
        const startTime = Date.now();
        let intervalId: NodeJS.Timeout | null = null;
        let isPollingActive = true;

        const stopPolling = () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            setIsFetchingLogs(false);
            setIsWaitingForLogs(false);
        };

        const startLogPolling = async () => {
            setIsWaitingForLogs(true);
            await new Promise((resolve) => setTimeout(resolve, 10000));
            setIsWaitingForLogs(false);
            setIsFetchingLogs(true);

            intervalId = setInterval(async () => {
                if (
                    !isPollingActive ||
                    Date.now() - startTime > MAX_POLLING_TIME
                ) {
                    stopPolling();
                    if (!isPollingActive) {
                        setDeploymentFailed(true);
                    }
                    return;
                }

                try {
                    const logs = await axios.get(
                        `${BUILDER_BACKEND}/logs/${owner}/${repo}`,
                    );
                    if (logs.status === 200) {
                        setLogs(logs.data.split("\n"));
                    }
                } catch (error) {
                    // Continue polling even on errors
                }
            }, POLLING_INTERVAL);
        };

        try {
            startLogPolling();

            const { data: txid, status } = await axios.post<{
                result: string;
                finalUnderName: string;
            }>(
                `${BUILDER_BACKEND}/deploy`,
                {
                    repository: selectedRepo.url,
                    installCommand: buildSettings.installCommand.value,
                    buildCommand: buildSettings.buildCommand.value,
                    outputDir: buildSettings.outPutDir.value,
                    branch: branch,
                    subDirectory: rootDir,
                    protocolLand: true,
                    repoName: selectedRepo.name,
                    walletAddress: activeAddress,
                    customArnsName: customArnsName || "",
                },
                {
                    timeout: 60 * 60 * 1000,
                    headers: { "Content-Type": "application/json" },
                },
            );

            if (status === 200) {
                isPollingActive = false;
                toast.success("Deployment successful");
                const dbQueries = [
                    `ALTER TABLE Deployments ADD COLUMN UnderName TEXT`,
                    `INSERT INTO Deployments (
                        Name, 
                        Repository, 
                        Branch, 
                        InstallCommand, 
                        BuildCommand, 
                        OutputDir, 
                        ArnsName
                    ) VALUES (
                        '${projectName}', 
                        '${selectedRepo.url}', 
                        '${branch}', 
                        '${buildSettings.installCommand.value}', 
                        '${buildSettings.buildCommand.value}', 
                        '${buildSettings.outPutDir.value}', 
                        ${finalArnsProcess ? `'${finalArnsProcess}'` : "NULL"}
                    )`,
                    `UPDATE Deployments SET DeploymentId='${txid.result}' WHERE Name='${projectName}'`,
                    `UPDATE Deployments SET UnderName='${txid.finalUnderName}' WHERE Name='${projectName}'`,
                ];

                let userArns: null | string = null;
                if (activeTab === "existing" && arnsName) {
                    userArns = await setArnsNameWithProcessId(
                        arnsName.processId,
                        txid.result,
                    );
                }

                const dbOperations = [
                    ...dbQueries.map((query) =>
                        runLua(`db:exec[[${query}]]`, managerProcess, undefined, signer),
                    ),
                    runLua(historyTable, managerProcess, undefined, signer),
                    runLua(
                        `db:exec[[INSERT INTO NewDeploymentHistory (Name, DeploymentID, AssignedUndername, Date) 
                         VALUES ('${projectName}', '${txid.result}', 
                         ${
                             userArns ? `'${userArns}'` : "NULL"
                         }, '${getTime()}')]]`,
                        managerProcess,
                        undefined,
                        signer,
                    ),
                
                ];

                setIsFetchingLogs(false);
                setAlmostDone(true);
                await Promise.all(dbOperations);
                await runLua(
                    `db:exec[[
                                INSERT INTO NewDeploymentHistory (Name, DeploymentID, AssignedUndername, Date) VALUES
                                ('${
                                    projectName
                                }', '${txid.result}', '${txid.finalUnderName}', '${getTime()}')
                            ]]`,
                    managerProcess,
                    undefined,
                    signer,
                );

                // Add small delay to allow database operations to fully propagate
                await new Promise(resolve => setTimeout(resolve, 2000));
                await refresh();
                navigate(`/deployment/card?repo=${projectName}`);
            } else {
                throw new Error("Deployment failed: Unexpected response");
            }
        } catch (error) {
            isPollingActive = false;
            stopPolling();
            if (isAxiosError(error)) {
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
            }
            setDeploymentSucceded(false);
            setDeploymentComplete(false);
            setDeploymentFailed(true);
        } finally {
            stopPolling();
            setIsDeploying(false);
            setDeploymentComplete(true);
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
            <h1 className="text-2xl font-bold mb-6">
                Set up ur deployment process
            </h1>
            <div
                className={`rounded-lg ${
                    deploymentStarted
                        ? "opacity-70 pointer-events-none"
                        : "opacity-100"
                } mb-6 my-4`}
            >
                <NewDeploymentCard
                    projectName={projectName}
                    activeTab={activeTab}
                    customArnsName={customArnsName}
                    arnsName={arnsName}
                    selectedBranch={"main"}
                />
            </div>
            <div className="mt-10">
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
                            disabled={deploymentStarted}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="branch"
                            className="block text-neutral-400 text-sm font-medium mb-1"
                        >
                            Branch
                        </label>
                        <Input
                            id="Branch"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            placeholder="Enter your project name here"
                            className="bg-[#0D0D0D]  p-4 placeholder:text-neutral-500 rounded-md mt-3 border-[#383838] text-white"
                            disabled={deploymentStarted}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="rootdir"
                            className="block text-neutral-400 text-sm font-medium mb-1"
                        >
                            Root dir
                        </label>
                        <Input
                            id="rootdir"
                            value={rootDir}
                            onChange={(e) => setRootDir(e.target.value)}
                            placeholder="Enter your project root directory"
                            className="bg-[#0D0D0D]  p-4 placeholder:text-neutral-500 rounded-md mt-3 border-[#383838] text-white"
                            disabled={deploymentStarted}
                        />
                    </div>
                    <div>
                        <p className="text-sm pt-4 text-neutral-400 font-medium mb-3">
                            Build And Output Settings
                        </p>
                        <div
                            className={`bg-[#0C0C0C] p-6 rounded-lg mb-6 border border-[#383838] ${
                                deploymentStarted
                                    ? "opacity-70 pointer-events-none"
                                    : "opacity-100"
                            }`}
                        >
                            <div className="space-y-4">
                                <BuildDeploymentSetting
                                    buildSettings={buildSettings}
                                    onSettingChange={handleSettingChange}
                                    disabled={deploymentStarted}
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        className={`${
                            deploymentStarted
                                ? "opacity-70 pointer-events-none"
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
                </div>
            </div>
            <Button
                className="w-full mt-10 bg-white hover:bg-neutral-200 text-black"
                disabled={deploymentStarted}
                onClick={handleDeployProject}
            >
                Deploy now
            </Button>

            {deploymentStarted && (
                <DeploymentLogs
                    logs={logs}
                    isFetchingLogs={isFetchingLogs}
                    isWaitingForLogs={isWaitingForLogs}
                    logError={logError}
                    almostDone={true}
                />
            )}
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

export default ConfigureProtocolLandProject;
