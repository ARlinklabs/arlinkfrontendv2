export interface Repository {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    description: string;
    updated_at: string;
    default_branch: string;
    visibility: string;
    html_url: string;
}

export interface RepoConfig {
    Name: string;
    InstallCMD: string;
    BuildCMD: string;
    SubDirectory: string;
    OutputDIR: string;
    RepoUrl: string;
}

export type ArnsName = { name: string; processId: string };

export interface DomainSelectionType {
    activeTab: "arlink" | "existing";
    setActiveTab: (value: React.SetStateAction<"arlink" | "existing">) => void;
    setExistingArnsLoading: (value: React.SetStateAction<boolean>) => void;
    handleFetchExistingArnsName(): Promise<void>;
    setCustomArnsName: (value: React.SetStateAction<string>) => void;
    setArnsDropDownModal: React.Dispatch<React.SetStateAction<boolean>>;
    arnsDropDown: boolean;
    projectName: string;
    customArnsName: string;
    existingArnsLoading: boolean;
    arnsName: ArnsName | undefined;
    arnsNames: ArnsName[];
    handleArnsSelection(arnsName: ArnsName): Promise<void>;
}

export type TDeployment = {
    ID: number;
    Name: string;
    RepoUrl: string;
    InstallCMD: string;
    Branch: string;
    BuildCMD: string;
    OutputDIR: string;
    ArnsProcess: string;
    DeploymentId: string;
    DeploymentHash: string;
};

export type TDeployments = {
    [name: string]: TDeployment;
};

export interface Project {
    arnsProcess: string;
    id: number;
    name: string;
    url: string;
    repo: string;
    repoUrl: string;
    link: string;
    createdAt: number;
    branch: string;
    outputDir: string;
    deploymentId: string;
}

export interface DirectoryStructure {
    name: string;
    path: string;
    type: "dir" | "file";
    children?: DirectoryStructure[];
}

export interface DeploymentConfig {
    owner: string;
    repoName: string;
    repository: string;
    branch: string;
    installCommand: string;
    buildCommand: string;
    outputDir: string;
    subDirectory: string;
    lastBuiltCommit: string;
    maxDailyDeploys: number;
    deployCount: number;
    url: string;
    arnsUnderName: string;
    noSizeCheck: boolean;
}

export interface DeploymentStore {
    deployments: DeploymentConfig[];
    addDeployment: (config: DeploymentConfig) => {
        success: boolean;
        error?: string;
    };
    removeDeployment: (githubPath: string) => void;
    updateDeployment: (
        githubPath: string,
        updates: Partial<DeploymentConfig>
    ) => { success: boolean; error?: string };
    getDeploymentByGithubPath: (
        githubPath: string
    ) => DeploymentConfig | undefined;
}

export type ProtocolLandRepo = {
    name: string;
    cloneUrl: string;
};

export type Steps =
    | "importing"
    | "configuring"
    | "deployment"
    | "configuring-protocol"
    | "deployment-protocol";

export interface SettingInputProps {
    label: string;
    placeholder: string;
    value: string;
    enabled: boolean;
    onValueChange: (value: string) => void;
    onEnabledChange: (enabled: boolean) => void;
}

export interface BuildSetting {
    value: string;
    enabled: boolean;
}

export interface BuildSettings {
    buildCommand: BuildSetting;
    installCommand: BuildSetting;
    outPutDir: BuildSetting;
}

interface BuildSettingsProps {
    buildSettings: BuildSettings;
    onSettingChange: (
        setting: keyof BuildSettings,
        field: keyof BuildSetting,
        value: string | boolean
    ) => void;
}
