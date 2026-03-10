import { useEffect, useState } from "react";
import { useGlobalState } from "@/store/useGlobalState";
import { useWalletState } from "./use-wallet-state";
import {
    getProjects,
    mapConfigToDeployment,
    ensureSession,
    claimProjects,
} from "@/lib/api";
import type { TDeployment } from "@/types";
import type { DeploymentRecord } from "@/types";

export type GetDemploymentHistoryReturnType = {
    messageId: string | null;
    history: DeploymentRecord[];
    error: any;
};

// Module-level guard so only one refresh() runs at a time across all hook instances
// (the hook is used in dashboard + every ProjectCard, so without this each instance
// independently fires refresh() on mount → N duplicate API calls)
let _globalRefreshing = false;
let _globalRefreshPromise: Promise<void> | null = null;

export default function useDeploymentManager() {
    const setManagerProcess = useGlobalState(
        (state) => state.setManagerProcess,
    );
    const safeUpdateDeployments = useGlobalState(
        (state) => state.safeUpdateDeployments,
    );

    const globalWalletAddress = useGlobalState((state) => state.walletAddress);
    const managerProcess = useGlobalState((state) => state.managerProcess);
    const deployments = useGlobalState((state) => state.deployments);
    const githubToken = useGlobalState((state) => state.githubToken);

    const { isConnected: connected, address } = useWalletState();

    const walletAddress = address || globalWalletAddress;
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

    // When wallet connects, mark as ready (no AO process needed anymore)
    useEffect(() => {
        if (connected && address && !managerProcess) {
            // Use a placeholder value — managerProcess is no longer an AO process ID,
            // but other parts of the app check for its presence as a "ready" signal
            setManagerProcess("backend");
        }
    }, [connected, address, managerProcess, setManagerProcess]);

    // Fetch deployments from backend when ready
    useEffect(() => {
        if (managerProcess && connected && address) {
            const timer = setTimeout(() => refresh(), 500);
            return () => clearTimeout(timer);
        }
    }, [managerProcess, address, connected]);

    // Run claim when githubToken becomes available (may happen later than initial load,
    // e.g. WAuth-GitHub login gives a wallet but NOT a GitHub OAuth token — that token
    // only arrives when the user does the separate GitHub sign-in on the deploy page)
    useEffect(() => {
        if (!githubToken || !connected || !address) return;
        const hasClaimed = localStorage.getItem("arlink_claimed");
        if (hasClaimed) return;

        (async () => {
            try {
                const authenticated = await ensureSession();
                if (!authenticated) return;
                console.log("[claim] running /projects/claim");
                const result = await claimProjects(githubToken);
                console.log("[claim] done:", result);
                localStorage.setItem("arlink_claimed", "1");
                // Refresh deployments to pick up newly claimed projects
                refresh();
            } catch (claimErr) {
                console.log("[claim] failed:", claimErr);
            }
        })();
    }, [githubToken, connected, address]);

    async function refresh() {
        if (!address || !connected) return;

        // If a refresh is already in progress (from any hook instance), wait for it
        if (_globalRefreshing && _globalRefreshPromise) {
            await _globalRefreshPromise;
            setHasFetchedOnce(true);
            return;
        }

        _globalRefreshing = true;
        setIsRefreshing(true);

        _globalRefreshPromise = (async () => {
            try {
                const authenticated = await ensureSession();
                if (!authenticated) {
                    console.warn("Could not create session — authenticated endpoints will fail");
                    return;
                }

                try {
                    const { projects } = await getProjects();
                    const validDeployments = projects.map(mapConfigToDeployment);
                    safeUpdateDeployments(validDeployments, address);
                } catch (err) {
                    console.warn("Failed to fetch projects:", err);
                }
            } catch (error) {
                console.error("Failed to refresh deployments:", error);
            } finally {
                _globalRefreshing = false;
                _globalRefreshPromise = null;
            }
        })();

        await _globalRefreshPromise;
        setHasFetchedOnce(true);
        setIsRefreshing(false);
    }

    return {
        managerProcess,
        deployments,
        isRefreshing,
        hasFetchedOnce,
        refresh,
        walletAddress,
    };
}

// --- Deployment History (from backend) ---

export async function getDeploymentHistory(
    projectName: string,
    managerProcess: string,
    signer?: any,
): Promise<GetDemploymentHistoryReturnType> {
    // Not used with backend — history comes from GET /projects/:owner/:repo/history
    // Kept for API compat with components that import it
    return { messageId: null, history: [], error: null };
}

export async function getDeploymentHistoryFromGraphQL(
    undername: string,
    projectName: string,
): Promise<GetDemploymentHistoryReturnType> {
    // Not used with backend — history comes from GET /projects/:owner/:repo/history
    // Kept for API compat with components that import it
    return { messageId: null, history: [], error: null };
}
