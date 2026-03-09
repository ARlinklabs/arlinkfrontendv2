import { useEffect, useRef, useState } from "react";
import { useGlobalState } from "@/store/useGlobalState";
import { useWalletState } from "./use-wallet-state";
import {
    getProjects,
    mapConfigToDeployment,
    ensureSession,
} from "@/lib/api";
import type { TDeployment } from "@/types";
import type { DeploymentRecord } from "@/types";

export type GetDemploymentHistoryReturnType = {
    messageId: string | null;
    history: DeploymentRecord[];
    error: any;
};

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

    const { isConnected: connected, address } = useWalletState();

    const walletAddress = address || globalWalletAddress;
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
    const isRefreshingRef = useRef(false);

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

    async function refresh(isRetry = false) {
        if (isRefreshingRef.current || !address || !connected || isRefreshing)
            return;

        isRefreshingRef.current = true;
        setIsRefreshing(true);

        try {
            // Ensure we have a valid session token before making authenticated calls
            const authenticated = await ensureSession();
            if (!authenticated) {
                console.warn("Could not create session — authenticated endpoints will fail");
            }

            // Use GET /projects to list all projects for the logged-in wallet
            if (authenticated) {
                try {
                    const { projects } = await getProjects();
                    const validDeployments = projects.map(mapConfigToDeployment);
                    safeUpdateDeployments(validDeployments, address);
                } catch (err) {
                    console.warn("Failed to fetch projects:", err);
                }
            }

            setHasFetchedOnce(true);
        } catch (error) {
            console.error("Failed to refresh deployments:", error);
        } finally {
            setIsRefreshing(false);
            isRefreshingRef.current = false;
        }
    }

    return {
        managerProcess,
        deployments,
        isRefreshing,
        hasFetchedOnce,
        refresh: () => refresh(false),
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
