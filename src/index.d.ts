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

export type Steps = "importing" | "configuring" | "deployment";

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
