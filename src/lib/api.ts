import type { TDeployment } from "@/types";

const isTestEnv = import.meta.env.VITE_ENV === "test";

export const API_BASE = isTestEnv
    ? "http://localhost:3050"
    : "https://vmi2322729.contaboserver.net";

/** Extract a user-friendly error message from a failed backend response */
export async function extractApiError(res: Response): Promise<string> {
    try {
        const data = await res.json();
        const msg = data?.message || "";
        if (res.status === 400) {
            const details = data?.details?.map((d: any) => d.message).join(", ");
            return details ? `Validation error: ${details}` : (msg || "Invalid request data");
        }
        if (res.status === 402) return msg || "Insufficient balance. Top up with USDC to continue.";
        if (res.status === 403) return msg || "Free tier does not support this feature";
        if (res.status === 429) return msg || "Rate limit reached. Please try again later.";
        if (res.status === 404) return msg || "Resource not found";
        if (res.status === 500) return msg || "Internal server error";
        return msg || `Request failed (${res.status})`;
    } catch {
        return `Request failed (${res.status})`;
    }
}

function getToken(): string | null {
    return localStorage.getItem("arlink_token");
}

function setToken(token: string) {
    localStorage.setItem("arlink_token", token);
}

export function clearToken() {
    localStorage.removeItem("arlink_token");
}

export async function apiRequest(
    path: string,
    options: RequestInit = {},
): Promise<Response> {
    const token = getToken();

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    // Auto-refresh on 401
    if (res.status === 401 && token) {
        const refreshRes = await fetch(`${API_BASE}/session/refresh`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (refreshRes.ok) {
            const data = await refreshRes.json();
            setToken(data.sessionToken);
            return apiRequest(path, options);
        } else {
            clearToken();
            throw new Error("Session expired");
        }
    }

    return res;
}

// --- Auth ---

export async function createSession(
    publicKey: string,
    signature: string,
    message: string,
): Promise<{
    sessionToken: string;
    projects: { owner: string; repo: string; arnsUnderName: string }[];
}> {
    const res = await fetch(`${API_BASE}/session/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            walletAddress: publicKey,
            signature,
            message,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create session");
    }

    const data = await res.json();
    setToken(data.sessionToken);
    return data;
}

let _ensureSessionPromise: Promise<boolean> | null = null;

/**
 * Ensure a valid session exists. Uses ao-wallet-kit's walletManager (the one
 * actually connected via AoWalletProvider) to get the public key and sign the
 * challenge. Deduplicates concurrent calls.
 */
export async function ensureSession(): Promise<boolean> {
    // Already have a token — verify it
    const existing = getToken();
    if (existing) {
        try {
            const verifyRes = await fetch(`${API_BASE}/session/verify`, {
                headers: { Authorization: `Bearer ${existing}` },
            });
            if (verifyRes.ok) return true;
        } catch { /* token invalid, fall through to create new */ }
        clearToken();
    }

    // Deduplicate concurrent calls
    if (_ensureSessionPromise) return _ensureSessionPromise;

    _ensureSessionPromise = (async () => {
        try {
            // Use ao-wallet-kit's walletManager — the one connected via AoWalletProvider
            const { walletManager } = await import("ao-wallet-kit");
            const strategy = walletManager.getCurrentStrategy();

            if (!strategy) {
                console.warn("ensureSession: no wallet strategy active");
                return false;
            }

            const publicKey = await strategy.getActivePublicKey();
            if (!publicKey) {
                console.warn("ensureSession: could not get public key from wallet");
                return false;
            }

            const message = `Arlink Auth\nProject: cli/auth\nTimestamp: ${Date.now()}`;
            const encoder = new TextEncoder();
            const messageBytes = encoder.encode(message);

            // Use signature() with RSA-PSS — available on all ao-wallet-kit strategies
            // (ArConnect, WAuth, MetaMask all implement this)
            const signatureBytes = await strategy.signature(
                messageBytes,
                { name: "RSA-PSS", saltLength: 32 },
            );

            const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
            await createSession(publicKey, signature, message);
            return true;
        } catch (error) {
            console.error("ensureSession failed:", error);
            return false;
        } finally {
            _ensureSessionPromise = null;
        }
    })();

    return _ensureSessionPromise;
}

export async function verifySession(): Promise<{
    valid: boolean;
    walletAddress: string;
}> {
    const res = await apiRequest("/session/verify");
    if (!res.ok) return { valid: false, walletAddress: "" };
    return res.json();
}

// --- Projects / Deployments ---

export interface BackendProjectConfig {
    id: number;
    owner: string;
    repoName: string;
    repository: string;
    branch: string;
    installCommand: string;
    buildCommand: string;
    outputDir: string;
    subDirectory: string;
    protocolLand: boolean;
    walletAddress: string;
    usesEnv: boolean;
    envVarCount: number;
    deploymentStatus: string;
    url: string;
    arnsUnderName: string;
    maxDailyDeploys: number;
    deployCount: number;
    lastBuiltCommit: string;
    createdAt: string;
    updatedAt: string;
}

/** Map backend project config to the TDeployment shape the frontend expects */
export function mapConfigToDeployment(config: BackendProjectConfig): TDeployment {
    return {
        ID: config.id,
        Name: config.repoName || "",
        RepoUrl: config.repository || "",
        Branch: config.branch || "",
        InstallCMD: config.installCommand || "",
        BuildCMD: config.buildCommand || "",
        OutputDIR: config.outputDir || "",
        DeploymentId: config.url || "",
        ArnsProcess: "",
        DeploymentHash: "",
        UnderName: config.arnsUnderName || "",
    };
}

export async function getProjectConfig(
    owner: string,
    repo: string,
): Promise<BackendProjectConfig> {
    const res = await apiRequest(`/config/${owner}/${repo}`);
    if (!res.ok) {
        throw new Error(await extractApiError(res));
    }
    return res.json();
}

export async function getProjectConfigFull(
    owner: string,
    repo: string,
): Promise<BackendProjectConfig> {
    const res = await apiRequest(`/config/${owner}/${repo}/full`);
    if (!res.ok) {
        throw new Error(await extractApiError(res));
    }
    return res.json();
}

export async function updateProjectConfig(
    owner: string,
    repo: string,
    updates: {
        installCommand?: string;
        buildCommand?: string;
        outputDir?: string;
        branch?: string;
        subDirectory?: string;
    },
): Promise<BackendProjectConfig> {
    const res = await apiRequest(`/config/${owner}/${repo}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
    });
    if (!res.ok) {
        throw new Error(await extractApiError(res));
    }
    const data = await res.json();
    return data.data;
}

export async function deleteProject(
    owner: string,
    repo: string,
): Promise<boolean> {
    const res = await apiRequest(`/deleteproject/${owner}/${repo}`, {
        method: "DELETE",
    });
    return res.ok;
}

// --- Deployment History ---

export interface DeploymentHistoryEntry {
    id: string;
    status: string;
    environment: string;
    commitSha: string;
    branch: string;
    txId: string | null;
    arnsUnderName: string | null;
    errorMessage: string | null;
    durationMs: number | null;
    logUrl: string;
    startedAt: string;
    completedAt: string | null;
    createdAt: string;
}

export async function getDeploymentHistory(
    owner: string,
    repo: string,
    options?: { page?: number; limit?: number; branch?: string; status?: string },
): Promise<{
    project: any;
    deployments: DeploymentHistoryEntry[];
    pagination: any;
}> {
    const params = new URLSearchParams();
    if (options?.page) params.set("page", String(options.page));
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.branch) params.set("branch", options.branch);
    if (options?.status) params.set("status", options.status);

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiRequest(`/projects/${owner}/${repo}/history${qs}`);
    if (!res.ok) {
        throw new Error(await extractApiError(res));
    }
    const data = await res.json();
    return data.data;
}

// --- Deployment Status ---

export async function getDeploymentStatus(deploymentId: string) {
    const res = await apiRequest(`/deployments/${deploymentId}`);
    if (!res.ok) throw new Error(await extractApiError(res));
    const data = await res.json();
    return data.deployment;
}

export async function getDeploymentLog(deploymentId: string) {
    const res = await apiRequest(`/deployments/${deploymentId}/log`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.log;
}

// --- Deploy ---

export async function submitDeploy(params: {
    repository: string;
    branch: string;
    installCommand: string;
    buildCommand: string;
    outputDir: string;
    subDirectory?: string;
    walletAddress?: string;
    repoName?: string;
    protocolLand?: boolean;
    isPreviewDeployment?: boolean;
    previewBranch?: string;
    usesEnv?: boolean;
    envVars?: Record<string, string>;
    githubToken?: string | null;
}) {
    const res = await apiRequest("/deploy", {
        method: "POST",
        body: JSON.stringify(params),
    });
    if (!res.ok) {
        throw new Error(await extractApiError(res));
    }
    return res.json();
}

// --- ArNS ---

export async function checkArnsAvailability(name: string) {
    const res = await apiRequest(`/arns/check-availability?name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(await extractApiError(res));
    return res.json();
}

// --- Projects (Dashboard) ---

/** List all projects owned by the logged-in wallet. Session auth required. */
export async function getProjects(): Promise<{
    walletAddress: string;
    projects: BackendProjectConfig[];
    total: number;
}> {
    const res = await apiRequest("/projects");
    if (!res.ok) throw new Error(await extractApiError(res));
    const data = await res.json();
    return data.data;
}

/** Get project info + latest deployment in one call. Public. */
export async function getProjectOverview(owner: string, repo: string) {
    const res = await apiRequest(`/projects/${owner}/${repo}/overview`);
    if (!res.ok) throw new Error(await extractApiError(res));
    const data = await res.json();
    return data.data;
}

// --- Config ---

/** Create CI/CD config without deploying. Public. */
export async function createConfig(params: {
    repository: string;
    branch: string;
    installCommand: string;
    buildCommand: string;
    outputDir: string;
    subDirectory?: string;
    walletAddress?: string;
}) {
    const res = await apiRequest("/createconfig", {
        method: "POST",
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(await extractApiError(res));
    return res.json();
}

/** Save GitHub token to project config. Public. */
export async function updateGithubToken(owner: string, repo: string, githubToken: string) {
    const res = await apiRequest(`/update-github-token/${owner}/${repo}`, {
        method: "POST",
        body: JSON.stringify({ githubToken }),
    });
    if (!res.ok) throw new Error(await extractApiError(res));
    return res.json();
}

// --- Logs ---

/** Get latest build log for a project. Wallet auth required. */
export async function getProjectLogs(owner: string, repo: string) {
    const res = await apiRequest(`/logs/${owner}/${repo}`);
    if (!res.ok) return null;
    return res.text();
}

/** Create SSE stream for live build logs. Wallet auth via query param. */
export function createLogStream(owner: string, repo: string): EventSource {
    const token = getToken();
    const url = `${API_BASE}/logs/${owner}/${repo}/stream${token ? `?token=${token}` : ""}`;
    return new EventSource(url);
}

// --- Repo record update ---

export async function updateRepoRecord(
    owner: string,
    repo: string,
    txid: string,
) {
    const res = await apiRequest(`/updatereporecord/${owner}/${repo}`, {
        method: "POST",
        body: JSON.stringify({ txid }),
    });
    if (!res.ok) throw new Error(await extractApiError(res));
    return res.json();
}

// --- Billing ---

export async function getBillingBalance() {
    const res = await apiRequest("/billing/balance");
    if (!res.ok) throw new Error(await extractApiError(res));
    const data = await res.json();
    return data.data;
}

export async function getBillingChains() {
    const res = await apiRequest("/billing/chains");
    if (!res.ok) throw new Error(await extractApiError(res));
    const data = await res.json();
    return data.data;
}

export async function submitTopUp(txHash: string, chain?: string) {
    const res = await apiRequest("/billing/topup", {
        method: "POST",
        body: JSON.stringify({ txHash, ...(chain ? { chain } : {}) }),
    });
    if (!res.ok) throw new Error(await extractApiError(res));
    return res.json();
}

export async function getBillingHistory(options?: { page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (options?.page) params.set("page", String(options.page));
    if (options?.limit) params.set("limit", String(options.limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiRequest(`/billing/history${qs}`);
    if (!res.ok) throw new Error(await extractApiError(res));
    const data = await res.json();
    return data.data;
}

export async function getBillingUsage() {
    const res = await apiRequest("/billing/usage");
    if (!res.ok) throw new Error(await extractApiError(res));
    const data = await res.json();
    return data.data;
}
