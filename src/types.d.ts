export type DeploymentRecord = {
    Name: string;
    DeploymentID: string;
    ID: number;
    Date: string;
    AssignedUndername?: string; // Optional, as it's not present in all records
};
export type PackageConfig = {
    framework:
        | "next"
        | "vite"
        | "create-react-app"
        | "gatsby"
        | "deno"
        | "unknown";
    repoName: string;
    installCommand: string;
    buildCommand: string;
    outputDir: string;
};
export interface Template {
    id: string;
    framework: string;
    description: string;
    creatorWallet: string;
    repoUrl: string;
    name: string;
    createdAt: string;
    creatorName: string;
    useCase: string;
    thumbnailUrl: string;
    demoUrl: string;
}

export interface TemplateDashboard {
    Framework: string;
    Description: string;
    CreatorWallet: string;
    RepoUrl?: string;
    Name: string;
    ID: string;
    CreatedAt: string;
    CreatorName: string;
    Stars: number;
    UseCase: string;
    ThumbnailUrl: string;
    DemoUrl: string;
}

export interface TemplatesResponse {
    total: number;
    templates: TemplateDashboard[];
}

interface TemplateSubmission {
    name: string;
    description: string;
    repoUrl: string;
    framework: string;
    useCase: string;
    thumbnailUrl: string;
    demoUrl: string;
    creatorName: string;
    submissionCode: string;
}

export type GetDemploymentHistoryReturnType = {
    messageId: null | string;
    history: [] | DeploymentRecord[];
    error: Error | null;
};

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
    UnderName: string;
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
    UnderName: string;
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
        updates: Partial<DeploymentConfig>,
    ) => { success: boolean; error?: string };
    getDeploymentByGithubPath: (
        githubPath: string,
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
        value: string | boolean,
    ) => void;
}

export interface TemplateDetails extends Template {
    stats?: {
        reviews: string;
        rating: string;
        stars: string;
    };
}
