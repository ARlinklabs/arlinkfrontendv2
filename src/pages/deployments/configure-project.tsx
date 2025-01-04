import {
    GitBranch,
    Save,
    Folder,
    Hammer,
    Package,
    GithubIcon,
    Loader2,
    ChevronDown,
    Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useGlobalState } from "@/store/useGlobalState";
import { runLua } from "@/lib/ao-vars";
import { toast } from "sonner";
import useDeploymentManager from "@/hooks/useDeploymentManager";
import type { TDeployment } from "@/types";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectTrigger,
    SelectValue,
    SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import axios, { isAxiosError } from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { extractOwnerName } from "../depoly/utilts";

interface DeploymentComponentProps {
    deployment: TDeployment;
}

const ConfigureProject = ({ deployment }: DeploymentComponentProps) => {
    const globalState = useGlobalState();
    const { refresh } = useDeploymentManager();

    const [isEditing, setIsEditing] = useState(false);
    const [editedConfig, setEditedConfig] = useState({
        installCommand: deployment?.InstallCMD || "",
        buildCommand: deployment?.BuildCMD || "",
        outputDir: deployment?.OutputDIR || "",
    });
    const [branches, setBranches] = useState<string[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string | undefined>(
        undefined
    );
    const [loadingBranches, setLoadingBranches] = useState<boolean>(false);

    // handlers
    const handleSaveConfig = async () => {
        if (!globalState.managerProcess || !deployment) return;

        try {
            const query = `
        db:exec[[
          UPDATE Deployments 
          SET InstallCMD = '${editedConfig.installCommand}',
              BuildCMD = '${editedConfig.buildCommand}',
              OutputDIR = '${editedConfig.outputDir}'
          WHERE Name = '${deployment.Name}'
        ]]
      `;

            const res = await runLua(query, globalState.managerProcess);
            if (res.Error) {
                toast.error(res.Error);
                return;
            }

            await refresh();
            setIsEditing(false);
            toast.success("Configuration updated successfully");
        } catch (error) {
            console.error("Error updating configuration:", error);
            toast.error("Failed to update configuration");
        }
    };

    async function handleFetchBranches() {
        if (!deployment.RepoUrl) return;
        const [owner, repo] = deployment.RepoUrl.replace(
            "https://github.com/",
            ""
        ).split("/");

        try {
            const response = await axios.get<[{ name: string }]>(
                `https://api.github.com/repos/${owner}/${repo}/branches`,
                {
                    headers: {
                        Authorization: `token ${globalState.githubToken}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                }
            );

            console.log(response.data);
            const branchesNames = response.data.map((branch) => branch.name);
            setBranches(branchesNames);
        } catch (error) {
            console.error("Error fetching branches:", error);
            console.log(error);
            // If the error is 404, assume it's a single-branch repository
            if (isAxiosError(error) && error.response?.status === 404) {
                setBranches(["main"]); // Assume 'main' as the default branch
                setSelectedBranch("main");
            }
        } finally {
            setLoadingBranches(false);
        }
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        console.log("hello world");
        console.log(globalState.githubToken);
        if (globalState.githubToken) {
            handleFetchBranches();
        }
    }, [globalState.githubToken]);

    return (
        <div className="w-full mx-auto p-4 md:p-10 rounded-lg border border-neutral-800 bg-arlink-bg-secondary-color text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-2">
                <div className=" lg:w-2/5 w-full flex-grow flex-shrink-0">
                    <h2 className="text-2xl font-bold bg-clip-transparent text-white">
                        Configure Your Project
                    </h2>
                    <p className="text-neutral-400 text-sm mt-4">
                        Customize your deployment settings to ensure your
                        project is built and deployed exactly as you need it.
                    </p>
                    {!isEditing ? (
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            className="w-full sm:w-auto my-8 bg-neutral-900 hover:bg-neutral-800  text-white transition-colors"
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Configuration
                        </Button>
                    ) : (
                        <div className="flex items-center my-8 gap-2">
                            <Button
                                variant="default"
                                onClick={handleSaveConfig}
                                className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white transition-colors"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                            <Button
                                variant="default"
                                onClick={() => setIsEditing(false)}
                                className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white transition-colors"
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
                <div className="w-full space-y-6">
                    <ConfigItem
                        icon={
                            <GithubIcon className="w-5 h-5 text-neutral-600" />
                        }
                        label="GitHub Repository"
                        value={deployment.RepoUrl}
                        readOnly
                    />
                    <div className="space-y-2">
                        <label
                            htmlFor={"branch"}
                            className="flex items-center text-sm font-medium text-neutral-400"
                        >
                            <GitBranch className="w-5 h-5 text-neutral-600" />
                            <span className="ml-2">{"branch"}</span>
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
                                disabled={!isEditing}
                            >
                                <SelectTrigger className="bg-neutral-800/50 border-0 text-white placeholder-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-600 focus:outline-none">
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
                    <ConfigItem
                        icon={<Package className="w-5 h-5 text-neutral-600" />}
                        label="Install Command"
                        value={
                            isEditing
                                ? editedConfig.installCommand
                                : deployment.InstallCMD
                        }
                        onChange={(e) =>
                            setEditedConfig((prev) => ({
                                ...prev,
                                installCommand: e.target.value,
                            }))
                        }
                        readOnly={!isEditing}
                    />
                    <ConfigItem
                        icon={<Hammer className="w-5 h-5 text-neutral-600" />}
                        label="Build Command"
                        value={
                            isEditing
                                ? editedConfig.buildCommand
                                : deployment.BuildCMD
                        }
                        onChange={(e) =>
                            setEditedConfig((prev) => ({
                                ...prev,
                                buildCommand: e.target.value,
                            }))
                        }
                        readOnly={!isEditing}
                    />
                    <ConfigItem
                        icon={<Folder className="w-5 h-5 text-neutral-600" />}
                        label="Output Directory"
                        value={
                            isEditing
                                ? editedConfig.outputDir
                                : deployment.OutputDIR
                        }
                        onChange={(e) =>
                            setEditedConfig((prev) => ({
                                ...prev,
                                outputDir: e.target.value,
                            }))
                        }
                        readOnly={!isEditing}
                    />
                </div>
            </div>
        </div>
    );
};

export default ConfigureProject;

interface ConfigItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readOnly: boolean;
}

function ConfigItem({
    icon,
    label,
    value,
    onChange,
    readOnly,
}: ConfigItemProps) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={label}
                className="flex items-center text-sm font-medium text-neutral-400"
            >
                {icon}
                <span className="ml-2">{label}</span>
            </label>
            <Input
                value={value}
                id={label}
                disabled={readOnly}
                onChange={onChange}
                readOnly={readOnly}
                className="bg-neutral-900 border-0 text-white placeholder-neutral-500 focus:outline-none focus:ring-0"
            />
        </div>
    );
}
