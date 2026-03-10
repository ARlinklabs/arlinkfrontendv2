// src/hooks/useGlobalState.ts
import type { TDeployment } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Store = {
    walletAddress: string | null;
    managerProcess: string;
    deployments: TDeployment[];
    githubToken: string | null;
    lastDeploymentsFetch: number;
    cachedUsername: string | null;
    setWalletAddress: (address: string | null) => void;
    setManagerProcess: (managerProcess: string) => void;
    setDeployments: (deployments: TDeployment[]) => void;
    updateDeployment: (deployment: TDeployment) => void;
    mergeDeployments: (newDeployments: TDeployment[]) => void;
    safeUpdateDeployments: (newDeployments: TDeployment[], fallbackWalletAddress?: string) => void;
    getDeploymentByName: (name: string) => TDeployment | undefined;
    setGithubToken: (token: string | null) => void;
    setCachedUsername: (username: string | null) => void;
    clearCache: () => void;
    clearWalletData: () => void;
};

export const useGlobalState = create<Store>()(
    persist(
        (set, get) => ({
            walletAddress: null,
            managerProcess: "",
            deployments: [],
            githubToken: null,
            lastDeploymentsFetch: 0,
            cachedUsername: null,

            setWalletAddress: (address: string | null) => {
                const currentAddress = get().walletAddress;
                
                // Only update if address actually changed
                if (currentAddress === address) {
                    return; // No change, don't update
                }
                
                console.log('Wallet changed from', currentAddress, 'to', address);
                
                // Clear current wallet data when switching wallets
                set({ 
                    walletAddress: address,
                    managerProcess: "",
                    deployments: [],
                    lastDeploymentsFetch: 0
                });
            },
            
            setManagerProcess: (managerProcess: string) => set({ managerProcess }),
            
            setDeployments: (deployments: TDeployment[]) => {
                const currentWallet = get().walletAddress;
                if (!currentWallet) {
                    console.warn('Cannot set deployments without wallet address');
                    return;
                }
                
                console.log(`Setting deployments for wallet ${currentWallet}:`, deployments.length);
                set({ 
                    deployments,
                    lastDeploymentsFetch: Date.now()
                });
            },
            
            updateDeployment: (updatedDeployment: TDeployment) => {
                const currentWallet = get().walletAddress;
                if (!currentWallet) {
                    console.warn('Cannot update deployment without wallet address');
                    return;
                }
                
                const currentDeployments = get().deployments;
                const index = currentDeployments.findIndex(dep => dep.Name === updatedDeployment.Name);
                
                if (index !== -1) {
                    const newDeployments = [...currentDeployments];
                    newDeployments[index] = { ...newDeployments[index], ...updatedDeployment };
                    console.log(`Updated deployment for wallet ${currentWallet}:`, updatedDeployment.Name);
                    set({ 
                        deployments: newDeployments,
                        lastDeploymentsFetch: Date.now()
                    });
                } else {
                    console.log(`Added new deployment for wallet ${currentWallet}:`, updatedDeployment.Name);
                    set({ 
                        deployments: [...currentDeployments, updatedDeployment],
                        lastDeploymentsFetch: Date.now()
                    });
                }
            },
            
            mergeDeployments: (newDeployments: TDeployment[]) => {
                const currentWallet = get().walletAddress;
                if (!currentWallet) {
                    console.warn('Cannot merge deployments without wallet address');
                    return;
                }

                const currentDeployments = get().deployments;
                const merged = [...currentDeployments];
                let changed = false;

                newDeployments.forEach(newDep => {
                    const existingIndex = merged.findIndex(dep => dep.Name === newDep.Name);
                    if (existingIndex !== -1) {
                        // Only mark as changed if the data actually differs
                        const existing = merged[existingIndex];
                        const isDifferent = JSON.stringify(existing) !== JSON.stringify({ ...existing, ...newDep });
                        if (isDifferent) {
                            merged[existingIndex] = { ...existing, ...newDep };
                            changed = true;
                        }
                    } else {
                        merged.push(newDep);
                        changed = true;
                    }
                });

                // Skip state update if nothing actually changed
                if (!changed) return;

                set({
                    deployments: merged,
                    lastDeploymentsFetch: Date.now()
                });
            },
            
            safeUpdateDeployments: (newDeployments: TDeployment[], fallbackWalletAddress?: string) => {
                const currentWallet = get().walletAddress;
                
                // If we don't have wallet address in global state but have fallback, set it ONLY ONCE
                if (!currentWallet && fallbackWalletAddress) {
                    console.log('Setting wallet address from fallback:', fallbackWalletAddress);
                    // Directly set without triggering side effects
                    set({ walletAddress: fallbackWalletAddress });
                }
                
                const walletToUse = currentWallet || fallbackWalletAddress;
                if (!walletToUse) {
                    console.warn('Cannot update deployments without wallet address');
                    return;
                }
                
                const currentDeployments = get().deployments;
                
                // Don't update if new data is empty and we have existing data
                if (newDeployments.length === 0 && currentDeployments.length > 0) {
                    console.warn(`Ignoring empty deployments update for wallet ${walletToUse} to preserve cache`);
                    return;
                }
                
                // Don't update if new data seems invalid
                if (newDeployments.some(dep => !dep.Name || !dep.RepoUrl)) {
                    console.warn(`Ignoring invalid deployments update for wallet ${walletToUse}`);
                    return;
                }
                
                // If we have no existing data, just set the new data
                if (currentDeployments.length === 0) {
                    console.log(`Setting initial deployments for wallet ${walletToUse}:`, newDeployments.length);
                    set({ 
                        deployments: newDeployments,
                        lastDeploymentsFetch: Date.now()
                    });
                    return;
                }
                
                // Otherwise, merge safely
                get().mergeDeployments(newDeployments);
            },
            
            getDeploymentByName: (name: string) => {
                return get().deployments.find(dep => dep.Name === name);
            },
            
            setGithubToken: (token: string | null) => set({ githubToken: token }),
            setCachedUsername: (username: string | null) => set({ cachedUsername: username }),
            
            clearCache: () => {
                const currentWallet = get().walletAddress;
                console.log(`Clearing deployment cache for wallet ${currentWallet}`);
                set({ 
                    deployments: [],
                    lastDeploymentsFetch: 0
                });
            },
            
            clearWalletData: () => {
                console.log('Clearing all wallet data');
                set({
                    walletAddress: null,
                    managerProcess: "",
                    deployments: [],
                    lastDeploymentsFetch: 0,
                    // NOTE: cachedUsername is NOT cleared here because WalletStateSync
                    // calls this on every page reload (connected is briefly false).
                    // It's cleared explicitly in disconnect handlers instead.
                });
            }
        }),
        {
            name: 'arlink-deployments-store-v2',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                walletAddress: state.walletAddress,
                deployments: state.deployments,
                githubToken: state.githubToken,
                lastDeploymentsFetch: state.lastDeploymentsFetch,
                managerProcess: state.managerProcess,
                cachedUsername: state.cachedUsername,
            }),
            version: 2,
            migrate: (persistedState: any, version: number) => {
                if (version < 2) {
                    // Clear old cache when migrating
                    console.log('Migrating to wallet-aware storage, clearing old cache');
                    return {
                        walletAddress: null,
                        managerProcess: "",
                        deployments: [],
                        githubToken: persistedState?.githubToken || null,
                        lastDeploymentsFetch: 0
                    };
                }
                return persistedState;
            }
        }
    )
);

export const getGithubToken = () => {
    return useGlobalState.getState().githubToken;
};
