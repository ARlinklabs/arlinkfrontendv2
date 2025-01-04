import type {
    ArnsName,
    DirectoryStructure,
    ProtocolLandRepo,
    Repository,
} from "@/types";
import { BUILDER_BACKEND } from "@/lib/utils";
import { Octokit } from "@octokit/rest";
import { index } from "arweave-indexer";
import axios, { isAxiosError } from "axios";
import type React from "react";
import { toast } from "sonner";
import { SetStateAction } from "react";
import fetchUserRepos from "@/lib/fetchprotolandrepo";
import { getWalletOwnedNames } from "@/lib/get-arns";
import { getRepoConfig } from "@/lib/getRepoconfig";

export async function fetchRepositories({
    githubToken,
    setRepositories,
}: {
    githubToken: string | null;
    setRepositories: React.Dispatch<React.SetStateAction<Repository[]>>;
}) {
    if (!githubToken) return;

    const octokit = new Octokit({ auth: githubToken });
    const { data: user } = await octokit.users.getAuthenticated();
    console.log("Authenticated as:", user.login);
    try {
        const response = await octokit.repos.listForAuthenticatedUser({
            per_page: 100,
            page: 1,
            sort: "updated",
            direction: "desc",
        });

        setRepositories(response.data as Repository[]);
    } catch (error) {
        console.error("Error fetching repositories:", error);
        toast.error("Failed to fetch repositories");
    }
}

export const indexInMalik = async ({
    projectName,
    description,
    txid,
    owner,
    link,
    arlink,
}: {
    projectName: string;
    description: string;
    txid: string;
    owner: string | undefined;
    link: string;
    arlink: string;
}) => {
    await index(
        // @ts-ignore
        JSON.stringify({
            title: projectName,
            description,
            txid,
            link,
            owner,
            arlink,
        }),
        window.arweaveWallet
    );
};

export async function fetchRepositoryByName({
    githubToken,
    repo,
}: {
    githubToken: string | null;
    repo: string;
}): Promise<Repository | null> {
    if (!githubToken) {
        toast.error("No GitHub token provided");
        return null;
    }

    const octokit = new Octokit({ auth: githubToken });

    try {
        const { data: user } = await octokit.users.getAuthenticated();

        const response = await octokit.repos.get({
            owner: user.login,
            repo,
        });

        return response.data as Repository;
    } catch (error) {
        console.error("Error fetching repository:", error);
        if ((error as { status?: number }).status === 404) {
            toast.error("Repository not found");
        } else if ((error as { status?: number }).status === 401) {
            toast.error("Invalid or expired GitHub token");
        } else if ((error as { status?: number }).status === 403) {
            toast.error("Token doesn't have required permissions");
        } else {
            toast.error("Failed to fetch repository");
        }
        return null;
    }
}

export async function analyzeRepoStructure(
    owner: string,
    repo: string,
    githubToken: string
): Promise<DirectoryStructure[]> {
    async function getContents(path = ""): Promise<DirectoryStructure[]> {
        try {
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${extractRepoName(
                    repo
                )}/contents/${path}`,
                {
                    headers: {
                        Authorization: `Bearer ${githubToken}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                }
            );
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                const contents = await Promise.all(
                    data.map(async (item) => {
                        const structure: DirectoryStructure = {
                            name: item.name,
                            path: item.path,
                            type: item.type as "dir" | "file",
                        };

                        if (
                            item.type === "dir" &&
                            !["node_modules", ".git", "dist"].includes(
                                item.name
                            )
                        ) {
                            structure.children = await getContents(item.path);
                        }

                        return structure;
                    })
                );

                const repoContent = contents.filter(
                    (item) =>
                        ![
                            "node_modules",
                            ".git",
                            ".github",
                            "dist",
                            "build",
                        ].includes(item.name)
                );

                return repoContent.filter((repo) =>
                    repo.path.includes("package.json")
                );
            }
        } catch (error) {
            console.error(`Error fetching contents for ${path}:`, error);
            return [];
        }

        return [];
    }

    const structure = await getContents();
    return findFrontendDirs(repo, owner, structure);
}

interface ProjectDeploymentConfig {
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

interface RepoProjectStructure {
    name: string;
    path: string;
    type: "dir" | "file";
    outputDir?: string;
    deploymentConfig?: ProjectDeploymentConfig;
    children?: RepoProjectStructure[];
}

export async function analyzeProjectDeploymentStructure(
    owner: string,
    repo: string,
    githubToken: string,
    configApiUrl?: string
): Promise<RepoProjectStructure[]> {
    // Fetch deployment config if available
    async function fetchProjectDeploymentConfig(): Promise<ProjectDeploymentConfig | null> {
        if (!configApiUrl) return null;

        try {
            const response = await fetch(
                `${configApiUrl}/config/${owner}/${repo}`
            );
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error("Error fetching deployment config:", error);
            return null;
        }
    }

    // Get the deployment config once at the start
    const deploymentConfig = await fetchProjectDeploymentConfig();

    async function getProjectContents(
        path = ""
    ): Promise<RepoProjectStructure[]> {
        try {
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
                {
                    headers: {
                        Authorization: `Bearer ${githubToken}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                const contents = await Promise.all(
                    data.map(async (item) => {
                        const structure: RepoProjectStructure = {
                            name: item.name,
                            path: item.path,
                            type: item.type as "dir" | "file",
                        };

                        if (item.type === "dir") {
                            // Check if this directory matches the deployment config's subDirectory
                            if (
                                deploymentConfig &&
                                item.path === deploymentConfig.subDirectory
                            ) {
                                structure.outputDir =
                                    deploymentConfig.outputDir;
                                structure.deploymentConfig = deploymentConfig;
                            }

                            // Skip processing certain directories
                            if (
                                !["node_modules", ".git", "dist"].includes(
                                    item.name
                                )
                            ) {
                                structure.children = await getProjectContents(
                                    item.path
                                );
                            }
                        }

                        return structure;
                    })
                );

                return contents.filter(
                    (item) =>
                        ![
                            "node_modules",
                            ".git",
                            ".github",
                            "dist",
                            "build",
                        ].includes(item.name)
                );
            }
        } catch (error) {
            console.error(`Error fetching contents for ${path}:`, error);
            return [];
        }
        return [];
    }

    const structure = await getProjectContents();
    return structure;
}

async function findFrontendDirs(
    repo: string,
    owner: string,
    structure: DirectoryStructure[]
): Promise<DirectoryStructure[]> {
    const frontendIndicators = [
        "package.json",
        "src",
        "public",
        "index.html",
        "vite.config.ts",
        "next.config.js",
        "angular.json",
        "webpack.config.js",
        "tsconfig.json",
    ];

    const output = structure.filter((item) => {
        if (item.type === "dir") {
            return item.children?.some((child) =>
                frontendIndicators.includes(child.name.toLowerCase())
            );
        }
        return false;
    });

    const repoConfigesPromises = output.map((project) => {
        return getRepoConfig(owner, extractRepoName(repo), project.path);
    });
    const repoConfigs = await Promise.all(repoConfigesPromises);
    console.log(repoConfigs);
    console.log({
        repo,
    });
    return output;
}

export function extractRepoName(url: string): string {
    return url
        .replace(/\.git|\/$/, "")
        .split("/")
        .pop() as string;
}

export const extractGithubPath = (url: string): string => {
    const githubPrefix = "https://github.com/";
    if (!url.startsWith(githubPrefix)) {
        throw new Error("Invalid GitHub URL");
    }

    const path = url.slice(githubPrefix.length);

    const parts = path.split("/");
    if (parts.length < 2) {
        throw new Error("Invalid GitHub repository URL format");
    }

    return `${parts[0]}/${parts[1]}`;
};

export function extractOwnerName(url: string): string {
    return url.split("/").reverse()[1];
}

export function createTokenizedRepoUrl(repoUrl: string, token: string): string {
    const [, , , username, repo] = repoUrl.split("/");
    return `https://${token}@github.com/${username}/${repo}.git`;
}

export const detectFrameworkImage = (
    outputDir: string
): {
    name: string;
    svg: string;
    dir: string;
} => {
    switch (outputDir.toLowerCase()) {
        case ".next":
            return {
                dir: ".next",
                name: "Next.js",
                svg: "nextjs.svg",
            };
        case "./out":
            return {
                dir: "./out",
                name: "Next.js",
                svg: "nextjs.svg",
            };
        case "./build":
            return {
                dir: "./build",
                name: "Create React App",
                svg: "react.svg",
            };
        case "./public":
            return {
                dir: "./public",
                name: "Gatsby",
                svg: "gatsby.svg",
            };
        case "./dist":
            return {
                dir: "./dist",
                name: "Vite",
                svg: "vite.svg",
            };
        default:
            return {
                dir: "unknown",
                name: "Unknown",
                svg: "unknown.svg",
            };
    }
};
export const handleFetchLogs = async ({
    projectName,
    repoUrl,
    setLogs,
    setLogError,
    setIsWaitingForLogs,
    setIsFetchingLogs,
    isWaitingForLogs,
}: {
    projectName: string;
    repoUrl: string;
    setLogs: React.Dispatch<React.SetStateAction<string[]>>;
    setLogError: React.Dispatch<React.SetStateAction<string>>;
    setIsWaitingForLogs: React.Dispatch<React.SetStateAction<boolean>>;
    setIsFetchingLogs: React.Dispatch<React.SetStateAction<boolean>>;
    isWaitingForLogs: boolean;
}) => {
    if (!projectName || !repoUrl) return;

    const owner = extractOwnerName(repoUrl);
    const repo = extractRepoName(repoUrl);
    const startTime = Date.now();
    const waitTime = 100000;
    let intervalId: NodeJS.Timeout | null = null;

    const delay = (ms: number) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("resolved");
            }, ms);
        });
    };

    const stopPolling = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };

    const logPoll = async () => {
        try {
            const logs = await axios.get(
                `${BUILDER_BACKEND}/logs/${owner}/${repo}`
            );
            setLogs(logs.data.split("\n"));
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime < waitTime) {
                    setLogError("Waiting for logs...");
                } else {
                    setLogError(
                        "Deployment failed, please check logs to find the issue."
                    );
                    setIsFetchingLogs(false);
                    stopPolling();
                }
            } else {
                setLogError(
                    "Deployment failed or an error occured while fetching logs."
                );
                console.error("Error fetching logs:", error);
                setIsFetchingLogs(false);
                stopPolling();
            }
        }
    };

    setIsWaitingForLogs(true);
    await delay(2000);
    setIsWaitingForLogs(false);
    setIsFetchingLogs(true);
    logPoll();

    intervalId = setInterval(logPoll, 2000);
};

export async function fetchProtocolLandRepos({
    address,
    setProtocolLandRepos,
}: {
    address: string | undefined;
    setProtocolLandRepos: React.Dispatch<SetStateAction<ProtocolLandRepo[]>>;
}) {
    if (!address) {
        toast.error("Please connect your wallet first");
        return;
    }
    try {
        const repos = await fetchUserRepos(address);
        console.log({
            protocolLandRepos: repos,
        });
        setProtocolLandRepos(repos);
    } catch (error) {
        console.error("Error fetching repositories:", error);
        toast.error("Failed to fetch repositories");
    }
}

export async function handleFetchExistingArnsName({
    setExistingArnsLoading,
    activeAddress,
    setArnsNames,
}: {
    setExistingArnsLoading: React.Dispatch<SetStateAction<boolean>>;
    activeAddress: string | undefined;
    setArnsNames: React.Dispatch<SetStateAction<ArnsName[]>>;
}) {
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

// export const handleFetchLogs = ({
// 	projectName,
// 	repoUrl,
// 	setLogs,
// 	setLogError,
// 	setIsWaitingForLogs,
// 	setIsFetchingLogs,
// 	isWaitingForLogs,
// }: {
// 	projectName: string;
// 	repoUrl: string;
// 	setLogs: React.Dispatch<React.SetStateAction<string[]>>;
// 	setLogError: React.Dispatch<React.SetStateAction<string>>;
// 	setIsWaitingForLogs: React.Dispatch<React.SetStateAction<boolean>>;
// 	setIsFetchingLogs: React.Dispatch<React.SetStateAction<boolean>>;
// 	isWaitingForLogs: boolean;
// }) => {
// 	if (!projectName || !repoUrl) return;

// 	const owner = extractOwnerName(repoUrl);
// 	const repo = extractRepoName(repoUrl);
// 	const startTime = Date.now();
// 	const waitTime = 10000;

// 	const logPoll = async () => {
// 		try {
// 			setIsFetchingLogs(true);
// 			const logs = await axios.get(`${BUILDER_BACKEND}/logs/${owner}/${repo}`);
// 			setLogs(logs.data.split("\n"));
// 			setLogError(""); // Clear any previous errors
// 			return true; // Successfully got logs
// 		} catch (error) {
// 			if (isAxiosError(error) && error.response?.status === 404) {
// 				const elapsedTime = Date.now() - startTime;
// 				if (elapsedTime < waitTime) {
// 					setLogError("Waiting for logs...");
// 					return false; // Continue polling
// 				}
// 				setLogError(
// 					"Failed to fetch logs after 1 minute. They may not be available yet.",
// 				);
// 				return true; // Stop polling
// 			}
// 			setLogError("An error occurred while fetching logs.");
// 			console.error("Error fetching logs:", error);
// 			return true; // Stop polling on other errors
// 		} finally {
// 			setIsFetchingLogs(false);
// 		}
// 	};

// 	// Start polling
// 	setIsWaitingForLogs(true);

// 	// Do initial poll
// 	logPoll();

// 	// Set up interval
// 	const intervalId = setInterval(async () => {
// 		const shouldStop = await logPoll();
// 		if (shouldStop) {
// 			clearInterval(intervalId);
// 			setIsWaitingForLogs(false);
// 		}
// 	}, 2000);

// 	// Return cleanup function
// 	return () => {
// 		clearInterval(intervalId);
// 		setIsWaitingForLogs(false);
// 	};
// };

// import type { Repository } from "@/index";
// import { Octokit } from "@octokit/rest";
// import { toast } from "sonner";

// export async function fetchRepositories({
// 	githubToken,
// 	setRepositories,
// }: {
// 	githubToken: string | null;
// 	setRepositories: React.Dispatch<React.SetStateAction<Repository[]>>

// }) {
// 	if (!githubToken) return;
// 	const octokit = new Octokit({ auth: githubToken });
// 	let allRepos: Repository[] = [];
// 	let page = 1;

// 	try {
// 		while (true) {
// 			const response = await octokit.repos.listForAuthenticatedUser({
// 				per_page: 100,
// 				page: page,
// 			});

// 			if (response.data.length === 0) {
// 				break;
// 			}

// 			allRepos = allRepos.concat(response.data as Repository[]);
// 			page++;
// 		}

// 		setRepositories(allRepos);
// 	} catch (error) {
// 		console.error("Error fetching repositories:", error);
// 		toast.error("Failed to fetch repositories");
// 	}
// }
