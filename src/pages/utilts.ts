import type {
    ArnsName,
    DomainTupleData,
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

interface DirectoryStructure {
    name: string;
    path: string;
    type: "dir" | "file";
    children?: DirectoryStructure[];
}

export async function analyzeRepoStructure(
    owner: string,
    repo: string,
    githubToken: string,
): Promise<DirectoryStructure[]> {
    // because we are caling this recursively I guess it is draining the api request for me
    // so kindly look into this
    async function getContents(path = ""): Promise<DirectoryStructure[]> {
        try {
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
                {
                    headers: {
                        Authorization: `Bearer ${githubToken}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                },
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

                        // Recursively get contents of directories
                        if (
                            item.type === "dir" &&
                            !["node_modules", ".git", "dist"].includes(
                                item.name,
                            )
                        ) {
                            structure.children = await getContents(item.path);
                        }

                        return structure;
                    }),
                );

                return contents.filter(
                    (item) =>
                        ![
                            "node_modules",
                            ".git",
                            ".github",
                            "dist",
                            "build",
                        ].includes(item.name),
                );
            }
        } catch (error) {
            console.error(`Error fetching contents for ${path}:`, error);
            return [];
        }

        return [];
    }

    const structure = await getContents();
    return findFrontendDirs(structure);
}

function findFrontendDirs(
    structure: DirectoryStructure[],
): DirectoryStructure[] {
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

    return structure.filter((item) => {
        if (item.type === "dir") {
            return item.children?.some((child) =>
                frontendIndicators.includes(child.name.toLowerCase()),
            );
        }
        return false;
    });
}

export function extractRepoName(url: string): string {
    return url
        .replace(/\.git|\/$/, "")
        .split("/")
        .pop() as string;
}

export const extractGithubPath = (url: string): string => {
    // Handle null, undefined, or empty strings
    if (!url || typeof url !== 'string') {
        throw new Error("Invalid GitHub URL: URL is required");
    }

    // Normalize the URL by trimming whitespace
    const normalizedUrl = url.trim();
    
    // Handle different GitHub URL formats (including tokenized URLs like https://token@github.com/...)
    const githubPatterns = [
        /^https?:\/\/[^@]*@github\.com\/([^\/]+)\/([^\/]+)/,  // https://token@github.com/owner/repo
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)/,        // https://github.com/owner/repo
        /^git@github\.com:([^\/]+)\/([^\/]+)/,                // git@github.com:owner/repo
        /^github\.com\/([^\/]+)\/([^\/]+)/                    // github.com/owner/repo
    ];

    for (const pattern of githubPatterns) {
        const match = normalizedUrl.match(pattern);
        if (match) {
            const owner = match[1];
            const repo = match[2].replace(/\.git$/, ''); // Remove .git suffix if present
            
            if (owner && repo) {
                return `${owner}/${repo}`;
            }
        }
    }

    // If no pattern matches, try the original logic as fallback
    const githubPrefix = "https://github.com/";
    if (normalizedUrl.startsWith(githubPrefix)) {
        const path = normalizedUrl.slice(githubPrefix.length);
        const parts = path.split("/").filter(Boolean); // Filter out empty parts
        
        if (parts.length >= 2) {
            const owner = parts[0];
            const repo = parts[1].replace(/\.git$/, '');
            return `${owner}/${repo}`;
        }
    }

    throw new Error(`Invalid GitHub URL format: ${url}`);
};

export function extractOwnerName(url: string): string {
    return url.split("/").reverse()[1];
}

export function createTokenizedRepoUrl(repoUrl: string, token: string): string {
    const [, , , username, repo] = repoUrl.split("/");
    return `https://${token}@github.com/${username}/${repo}.git`;
}

/** Strip embedded tokens from GitHub URLs for display.
 *  e.g. https://ghp_xxx@github.com/owner/repo.git → https://github.com/owner/repo */
export function sanitizeRepoUrl(url: string): string {
    if (!url) return url;
    try {
        const path = extractGithubPath(url);
        return `https://github.com/${path}`;
    } catch {
        return url;
    }
}

/** Map a known framework identifier string to display name + logo SVG */
const FRAMEWORK_MAP: Record<string, { name: string; svg: string }> = {
    react: { name: "React", svg: "react.svg" },
    next: { name: "Next.js", svg: "nextjs.svg" },
    vite: { name: "Vite", svg: "vite.svg" },
    gatsby: { name: "Gatsby", svg: "gatsby.svg" },
    "create-react-app": { name: "Create React App", svg: "react.svg" },
    deno: { name: "Deno", svg: "deno.svg" },
    svelte: { name: "Svelte", svg: "unknown.svg" },
    sveltekit: { name: "SvelteKit", svg: "unknown.svg" },
    astro: { name: "Astro", svg: "unknown.svg" },
    solid: { name: "Solid", svg: "unknown.svg" },
    angular: { name: "Angular", svg: "unknown.svg" },
    vue: { name: "Vue", svg: "unknown.svg" },
    nuxt: { name: "Nuxt", svg: "unknown.svg" },
};

/** Get framework display info from a known framework string. Returns null if unknown. */
export const getFrameworkImage = (
    framework: string,
): { name: string; svg: string; dir: string } | null => {
    if (!framework) return null;
    const entry = FRAMEWORK_MAP[framework.toLowerCase()];
    if (entry) return { ...entry, dir: "" };
    return null;
};

export const detectFrameworkImage = (
    outputDir: string,
    buildCommand?: string,
    framework?: string,
): {
    name: string;
    svg: string;
    dir: string;
} => {
    // 0. If backend provides a framework string, use it directly
    if (framework) {
        const known = getFrameworkImage(framework);
        if (known) return { ...known, dir: outputDir };
    }

    // 1. Try output dir
    const normalized = (outputDir || "").toLowerCase().replace(/^\.\//, "").trim();
    switch (normalized) {
        case ".next":
        case "out":
            return { dir: outputDir, name: "Next.js", svg: "nextjs.svg" };
        case "build":
            return { dir: outputDir, name: "Create React App", svg: "react.svg" };
        case "public":
            return { dir: outputDir, name: "Gatsby", svg: "gatsby.svg" };
        case "dist":
            return { dir: outputDir, name: "Vite", svg: "vite.svg" };
    }

    // 2. Fall back to build command heuristics
    const cmd = (buildCommand || "").toLowerCase();
    if (cmd) {
        if (cmd.includes("next")) return { dir: outputDir, name: "Next.js", svg: "nextjs.svg" };
        if (cmd.includes("gatsby")) return { dir: outputDir, name: "Gatsby", svg: "gatsby.svg" };
        if (cmd.includes("vite") || cmd.includes("tsc")) return { dir: outputDir, name: "Vite", svg: "vite.svg" };
        if (cmd.includes("react-scripts")) return { dir: outputDir, name: "Create React App", svg: "react.svg" };
        if (cmd.includes("build")) return { dir: outputDir, name: "Vite", svg: "vite.svg" };
    }

    return { dir: outputDir, name: "Unknown", svg: "unknown.svg" };
};

export const handleFetchLogs = async ({
    projectName,
    repoUrl,
    setLogs,
    setLogError,
    setIsWaitingForLogs,
    setIsFetchingLogs,
    protocolLand,
    walletAddress,
}: {
    projectName: string;
    repoUrl: string;
    setLogs: React.Dispatch<React.SetStateAction<string[]>>;
    setLogError: React.Dispatch<React.SetStateAction<string>>;
    setIsWaitingForLogs: React.Dispatch<React.SetStateAction<boolean>>;
    setIsFetchingLogs: React.Dispatch<React.SetStateAction<boolean>>;
    isWaitingForLogs: boolean;
    protocolLand?: boolean;
    walletAddress?: string;
}) => {
    if (!projectName || !repoUrl) return;

    const owner = protocolLand ? walletAddress : extractOwnerName(repoUrl);
    const repo = protocolLand ? repoUrl : projectName;
    const startTime = Date.now();
    const waitTime = 6000000;
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
                `${BUILDER_BACKEND}/backend/logs/${owner}/${repo}`,
            );
            setLogs(logs.data.split("\n"));
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 500) {
                setLogError("Deployment failed, please try again");
                setIsFetchingLogs(false);
                stopPolling();
            }
            if (isAxiosError(error) && error.response?.status === 406) {
                setLogError(
                    "Too many requests detected. Please try again later.",
                );
                stopPolling();
            }
            if (isAxiosError(error) && error.response?.status === 404) {
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime < waitTime) {
                    setLogError("Waiting for logs...");
                } else {
                    setLogError(
                        "Deployment failed, please check logs to find the issue.",
                    );
                    setIsFetchingLogs(false);
                    stopPolling();
                }
            } else {
                setLogError("Deployment failed, please try again");
                setIsFetchingLogs(false);
                stopPolling();
            }
        }
    };

    setIsWaitingForLogs(true);
    await delay(10000);
    setIsWaitingForLogs(false);
    setIsFetchingLogs(true);
    logPoll();

    intervalId = setInterval(logPoll, 2000);

    // Ensure polling stops after 5 seconds regardless of errors
    setTimeout(() => {
        setIsFetchingLogs(false);
        stopPolling();
    }, waitTime);
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
    } catch (error) {
        console.error("Error fetching ArNS names:", error);
        toast.error("Failed to fetch ArNS names");
    } finally {
        setExistingArnsLoading(false);
    }
}

export function getCountryCode(countryName: string): string {
    const countryMap: Record<string, string> = {
        Afghanistan: "af",
        Albania: "al",
        Algeria: "dz",
        Andorra: "ad",
        Angola: "ao",
        "Antigua and Barbuda": "ag",
        Argentina: "ar",
        Armenia: "am",
        Australia: "au",
        Austria: "at",
        Azerbaijan: "az",
        Bahamas: "bs",
        Bahrain: "bh",
        Bangladesh: "bd",
        Barbados: "bb",
        Belarus: "by",
        Belgium: "be",
        Belize: "bz",
        Benin: "bj",
        Bhutan: "bt",
        Bolivia: "bo",
        "Bosnia and Herzegovina": "ba",
        Botswana: "bw",
        Brazil: "br",
        Brunei: "bn",
        Bulgaria: "bg",
        "Burkina Faso": "bf",
        Burundi: "bi",
        "Cabo Verde": "cv",
        Cambodia: "kh",
        Cameroon: "cm",
        Canada: "ca",
        "Central African Republic": "cf",
        Chad: "td",
        Chile: "cl",
        China: "cn",
        Colombia: "co",
        Comoros: "km",
        "Congo (Congo-Brazzaville)": "cg",
        "Congo (Congo-Kinshasa)": "cd",
        "Costa Rica": "cr",
        Croatia: "hr",
        Cuba: "cu",
        Cyprus: "cy",
        Czechia: "cz",
        Denmark: "dk",
        Djibouti: "dj",
        Dominica: "dm",
        "Dominican Republic": "do",
        Ecuador: "ec",
        Egypt: "eg",
        "El Salvador": "sv",
        "Equatorial Guinea": "gq",
        Eritrea: "er",
        Estonia: "ee",
        Eswatini: "sz",
        Ethiopia: "et",
        Fiji: "fj",
        Finland: "fi",
        France: "fr",
        Gabon: "ga",
        Gambia: "gm",
        Georgia: "ge",
        Germany: "de",
        Ghana: "gh",
        Greece: "gr",
        Grenada: "gd",
        Guatemala: "gt",
        Guinea: "gn",
        "Guinea-Bissau": "gw",
        Guyana: "gy",
        Haiti: "ht",
        Honduras: "hn",
        Hungary: "hu",
        Iceland: "is",
        India: "in",
        Indonesia: "id",
        Iran: "ir",
        Iraq: "iq",
        Ireland: "ie",
        Israel: "il",
        Italy: "it",
        Jamaica: "jm",
        Japan: "jp",
        Jordan: "jo",
        Kazakhstan: "kz",
        Kenya: "ke",
        Kiribati: "ki",
        Kuwait: "kw",
        Kyrgyzstan: "kg",
        Laos: "la",
        Latvia: "lv",
        Lebanon: "lb",
        Lesotho: "ls",
        Liberia: "lr",
        Libya: "ly",
        Liechtenstein: "li",
        Lithuania: "lt",
        Luxembourg: "lu",
        Madagascar: "mg",
        Malawi: "mw",
        Malaysia: "my",
        Maldives: "mv",
        Mali: "ml",
        Malta: "mt",
        "Marshall Islands": "mh",
        Mauritania: "mr",
        Mauritius: "mu",
        Mexico: "mx",
        Moldova: "md",
        Monaco: "mc",
        Mongolia: "mn",
        Montenegro: "me",
        Morocco: "ma",
        Mozambique: "mz",
        Myanmar: "mm",
        Namibia: "na",
        Nauru: "nr",
        Nepal: "np",
        Netherlands: "nl",
        "New Zealand": "nz",
        Nicaragua: "ni",
        Niger: "ne",
        Nigeria: "ng",
        "North Korea": "kp",
        "North Macedonia": "mk",
        Norway: "no",
        Oman: "om",
        Pakistan: "pk",
        Palau: "pw",
        Panama: "pa",
        "Papua New Guinea": "pg",
        Paraguay: "py",
        Peru: "pe",
        Philippines: "ph",
        Poland: "pl",
        Portugal: "pt",
        Qatar: "qa",
        Romania: "ro",
        Russia: "ru",
        Rwanda: "rw",
        "Saint Kitts and Nevis": "kn",
        "Saint Lucia": "lc",
        "Saint Vincent and the Grenadines": "vc",
        Samoa: "ws",
        "San Marino": "sm",
        "Sao Tome and Principe": "st",
        "Saudi Arabia": "sa",
        Senegal: "sn",
        Serbia: "rs",
        Seychelles: "sc",
        "Sierra Leone": "sl",
        Singapore: "sg",
        Slovakia: "sk",
        Slovenia: "si",
        "Solomon Islands": "sb",
        Somalia: "so",
        "South Africa": "za",
        "South Korea": "kr",
        "South Sudan": "ss",
        Spain: "es",
        "Sri Lanka": "lk",
        Sudan: "sd",
        Suriname: "sr",
        Sweden: "se",
        Switzerland: "ch",
        Syria: "sy",
        Taiwan: "tw",
        Tajikistan: "tj",
        Tanzania: "tz",
        Thailand: "th",
        "Timor-Leste": "tl",
        Togo: "tg",
        Tonga: "to",
        "Trinidad and Tobago": "tt",
        Tunisia: "tn",
        Turkey: "tr",
        Turkmenistan: "tm",
        Tuvalu: "tv",
        Uganda: "ug",
        Ukraine: "ua",
        "United Arab Emirates": "ae",
        "United Kingdom": "gb",
        "United States": "us",
        Uruguay: "uy",
        Uzbekistan: "uz",
        Vanuatu: "vu",
        "Vatican City": "va",
        Venezuela: "ve",
        Vietnam: "vn",
        Yemen: "ye",
        Zambia: "zm",
        Zimbabwe: "zw",
    };

    const normalizedCountry = countryName.trim();

    return countryMap[normalizedCountry] || "";
}
export const arnsDummyData: DomainTupleData[] = [
    {
        name: "Arlink",
        permaBuy: 18240,
        lease: 5000,
        available: false,
    },
    {
        name: "zynthix",
        permaBuy: 17500,
        lease: 4800,
        available: false,
    },
    {
        name: "velorium",
        permaBuy: 20000,
        lease: 5500,
        available: false,
    },
    {
        name: "quantara",
        permaBuy: 19000,
        lease: 5200,
        available: false,
    },
    {
        name: "solvify",
        permaBuy: 18500,
        lease: 5100,
        available: false,
    },
    {
        name: "aetheris",
        permaBuy: 19500,
        lease: 5300,
        available: false,
    },
    {
        name: "novastra",
        permaBuy: 18000,
        lease: 4900,
        available: false,
    },
    {
        name: "fluxora",
        permaBuy: 21000,
        lease: 6000,
        available: false,
    },
    {
        name: "luminara",
        permaBuy: 22000,
        lease: 6200,
        available: false,
    },
    {
        name: "cryostar",
        permaBuy: 23000,
        lease: 6500,
        available: false,
    },
    {
        name: "orbique",
        permaBuy: 24000,
        lease: 6700,
        available: false,
    },
    {
        name: "vireon",
        permaBuy: 25000,
        lease: 7000,
        available: false,
    },
    {
        name: "xenithra",
        permaBuy: 26000,
        lease: 7200,
        available: false,
    },
    {
        name: "astrava",
        permaBuy: 27000,
        lease: 7500,
        available: false,
    },
];
