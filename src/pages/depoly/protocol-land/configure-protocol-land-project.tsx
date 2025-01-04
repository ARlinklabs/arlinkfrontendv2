import useDeploymentManager from "@/hooks/useDeploymentManager";
import { useGlobalState } from "@/store/useGlobalState";
import { ArnsName, Steps } from "@/types";
import { useActiveAddress } from "arweave-wallet-kit";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import NewDeploymentCard from "@/components/shared/new-deployment-card";
import { handleFetchExistingArnsName } from "../utilts";

const ConfigureProtocolLandProject = ({
    setStep,
}: {
    setStep: React.Dispatch<React.SetStateAction<Steps>>;
}) => {
    // hooks and global state
    const globalState = useGlobalState();
    const { refresh } = useDeploymentManager();
    const activeAddress = useActiveAddress();

    // project states
    const [projectName, setProjectName] = useState<string>("");
    const [editedConfig, setEditedConfig] = useState({
        installCommand: "bun install",
        buildCommand: "npm run build",
        outputDir: "./dist",
    });

    // domain states
    const [activeTab, setActiveTab] = useState<"arlink" | "existing">("arlink");
    const [customArnsName, setCustomArnsName] = useState<string>("");
    const [arnsProcess, setArnsProcess] = useState<string>("");

    // for the arns domain from wallet
    const [arnsNames, setArnsNames] = useState<ArnsName[]>([]);
    const [arnsName, setArnsName] = useState<ArnsName | undefined>(undefined);

    // loading states
    const [isDeploying, setIsDeploying] = useState<boolean>(false);
    const [existingArnsLoading, setExistingArnsLoading] =
        useState<boolean>(true);

    // deployment status states
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

    // handlers
    const handleFetchArns = async () => {
        handleFetchExistingArnsName({
            setArnsNames,
            activeAddress,
            setExistingArnsLoading,
        });
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
                <NewDeploymentCard
                    projectName={projectName}
                    activeTab={activeTab}
                    customArnsName={customArnsName}
                    arnsName={arnsName}
                    selectedBranch={"master"}
                />
            </div>
        </div>
    );
};

export default ConfigureProtocolLandProject;
