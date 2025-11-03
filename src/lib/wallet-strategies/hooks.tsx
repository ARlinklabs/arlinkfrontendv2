import { useState, useEffect, useCallback } from 'react';
import { walletManager } from './wallet-manager';
import { WalletConnectionState, WalletHookReturn } from './types';

/**
 * Debug logging - enable by setting localStorage.WALLET_DEBUG = 'true'
 * To enable: localStorage.setItem('WALLET_DEBUG', 'true')
 * To disable: localStorage.removeItem('WALLET_DEBUG')
 */
const DEBUG = import.meta.env.DEV && localStorage.getItem('WALLET_DEBUG') === 'true';
const log = (...args: any[]) => DEBUG && console.log('[useConnection]', ...args);

/**
 * Hook that provides wallet connection state and methods
 * This replaces useConnection from @arweave-wallet-kit/react
 */
export function useConnection(): WalletHookReturn {
    const [state, setState] = useState<WalletConnectionState>(walletManager.getState());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        log('Initial state from walletManager:', walletManager.getState());
        
        const unsubscribe = walletManager.onStateChange((newState) => {
            log('State changed to:', newState);
            setState(newState);
        });
        return unsubscribe;
    }, []);

    const connect = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await walletManager.connect();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect wallet');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const disconnect = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await walletManager.disconnect();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        connected: state.connected,
        address: state.address,
        connect,
        disconnect,
        strategy: state.strategy,
        isLoading,
        error
    };
}

/**
 * Hook that provides the active wallet address
 * This replaces useActiveAddress from @arweave-wallet-kit/react
 */
export function useActiveAddress(): string | null {
    const [address, setAddress] = useState<string | null>(walletManager.getState().address);

    useEffect(() => {
        const unsubscribe = walletManager.onStateChange((state) => {
            setAddress(state.address);
        });
        return unsubscribe;
    }, []);

    return address;
}

/**
 * Hook that provides wallet API methods for signing transactions
 * This replaces useApi from @arweave-wallet-kit/react
 */
export function useApi() {
    const sign = useCallback(async (transaction: any, options?: any) => {
        return await walletManager.sign(transaction, options);
    }, []);

    const signDataItem = useCallback(async (dataItem: any) => {
        return await walletManager.signDataItem(dataItem);
    }, []);

    const signAns104 = useCallback(async (dataItem: any) => {
        return await walletManager.signAns104(dataItem);
    }, []);

    const getActiveAddress = useCallback(async () => {
        return await walletManager.getActiveAddress();
    }, []);

    const getActivePublicKey = useCallback(async () => {
        return await walletManager.getActivePublicKey();
    }, []);

    return {
        sign,
        signDataItem,
        signAns104,
        getActiveAddress,
        getActivePublicKey
    };
}

/**
 * Mock profile modal hook for compatibility
 * This replaces useProfileModal from @arweave-wallet-kit/react
 */
export function useProfileModal() {
    const [isOpen, setIsOpen] = useState(false);

    return {
        isOpen,
        setOpen: setIsOpen
    };
}

/**
 * Hook for WAuth specific functionality with localStorage caching
 */
export function useWAuth() {
    const WAUTH_EMAIL_KEY = 'wauth_cached_email';
    const WAUTH_USERNAME_KEY = 'wauth_cached_username';
    const WAUTH_ADDRESS_KEY = 'wauth_cached_address';
    
    // Initialize from localStorage cache
    const [email, setEmail] = useState<{ email: string, verified: boolean } | null>(() => {
        try {
            const cached = localStorage.getItem(WAUTH_EMAIL_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    const [username, setUsername] = useState<string | null>(() => {
        try {
            return localStorage.getItem(WAUTH_USERNAME_KEY);
        } catch {
            return null;
        }
    });
    const [connectedWallets, setConnectedWallets] = useState<any[]>([]);

    useEffect(() => {
        const updateWAuthData = async () => {
            try {
                // Get current wallet address
                const currentAddress = await walletManager.getActiveAddress().catch(() => null);
                const cachedAddress = localStorage.getItem(WAUTH_ADDRESS_KEY);
                
                // If address changed and we have a new address, clear old wauth cache
                if (cachedAddress && currentAddress && cachedAddress !== currentAddress) {
                    console.log('🔄 Address changed, clearing old wauth cache');
                    localStorage.removeItem(WAUTH_EMAIL_KEY);
                    localStorage.removeItem(WAUTH_USERNAME_KEY);
                    setEmail(null);
                    setUsername(null);
                }
                
                // Update cached address
                if (currentAddress) {
                    localStorage.setItem(WAUTH_ADDRESS_KEY, currentAddress);
                }
                
                const emailData = walletManager.getEmail();
                const usernameData = walletManager.getUsername();
                
                console.log('📧 useWAuth - Email data:', emailData);
                console.log('👤 useWAuth - Username data:', usernameData);
                
                // Update state - but preserve cached values if new data is null
                // This prevents overwriting cached data before WAuth is fully initialized
                if (emailData !== null) {
                    setEmail(emailData);
                    localStorage.setItem(WAUTH_EMAIL_KEY, JSON.stringify(emailData));
                    console.log('💾 Cached email:', emailData);
                } else {
                    console.log('⚠️ Email data is null, keeping cached value');
                }
                
                if (usernameData !== null) {
                    setUsername(usernameData);
                    localStorage.setItem(WAUTH_USERNAME_KEY, usernameData);
                    console.log('💾 Cached username:', usernameData);
                } else {
                    console.log('⚠️ Username data is null, keeping cached value');
                }

                // Update connected wallets
                walletManager.getConnectedWallets().then(setConnectedWallets).catch(() => {
                    setConnectedWallets([]);
                });
            } catch (error) {
                // User not logged in yet or not using wauth
                // Don't clear cache here - we might be reconnecting
                // Only clear if address changes or explicit disconnect
                console.log('⚠️ useWAuth - Error updating data (user may not be logged in yet)');
            }
        };

        // Initial load
        updateWAuthData();

        // Listen for auth data changes
        walletManager.onAuthDataChange(updateWAuthData);

        // Listen for wallet state changes
        const unsubscribe = walletManager.onStateChange((state) => {
            // Only update wauth data when connected
            // Don't clear cache when disconnected - keep it for faster reconnection
            // Cache will only be cleared by disconnect() call in wallet manager or manual logout
            if (state.connected) {
                updateWAuthData();
            }
        });
        
        return unsubscribe;
    }, []);

    const addConnectedWallet = useCallback(async (wallet: any) => {
        const result = await walletManager.addConnectedWallet(wallet);
        const wallets = await walletManager.getConnectedWallets();
        setConnectedWallets(wallets);
        return result;
    }, []);

    const removeConnectedWallet = useCallback(async (walletId: string) => {
        const result = await walletManager.removeConnectedWallet(walletId);
        const wallets = await walletManager.getConnectedWallets();
        setConnectedWallets(wallets);
        return result;
    }, []);

    const reconnect = useCallback(async () => {
        return await walletManager.reconnect();
    }, []);

    const getAuthData = useCallback(() => {
        return walletManager.getAuthData();
    }, []);

    const getAoSigner = useCallback(() => {
        return walletManager.getAoSigner();
    }, []);

    const clearCache = useCallback(() => {
        console.log('🗑️ Clearing wauth cache');
        localStorage.removeItem(WAUTH_EMAIL_KEY);
        localStorage.removeItem(WAUTH_USERNAME_KEY);
        localStorage.removeItem(WAUTH_ADDRESS_KEY);
        setEmail(null);
        setUsername(null);
        setConnectedWallets([]);
    }, []); // Keys are constants, no need to include in dependencies

    return {
        email,
        username,
        connectedWallets,
        addConnectedWallet,
        removeConnectedWallet,
        reconnect,
        getAuthData,
        getAoSigner,
        clearCache
    };
}

/**
 * Hook to get all available wallet strategies
 */
export function useWalletStrategies() {
    const [strategies, setStrategies] = useState(walletManager.getStrategies());
    const [currentStrategy, setCurrentStrategy] = useState(walletManager.getCurrentStrategy());

    useEffect(() => {
        setStrategies(walletManager.getStrategies());
        setCurrentStrategy(walletManager.getCurrentStrategy());
    }, []);

    const setStrategy = useCallback((strategyId: string) => {
        const success = walletManager.setStrategy(strategyId);
        if (success) {
            setCurrentStrategy(walletManager.getCurrentStrategy());
        }
        return success;
    }, []);

    return {
        strategies,
        currentStrategy,
        setStrategy
    };
}

/**
 * Hook to get the appropriate signer based on current wallet strategy
 * Returns window.arweaveWallet for native Arweave wallets
 * Returns WAuth signer for OAuth-based connections
 */
export function useSigner() {
    const [signer, setSigner] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const updateSigner = useCallback(async () => {
        setIsLoading(true);
        try {
            const newSigner = await walletManager.getSigner();
            // IMPORTANT: When setting a function to state, wrap it in an arrow function
            // Otherwise React treats it as a lazy initializer and calls it immediately
            setSigner(() => newSigner);
        } catch (error) {
            console.error('Failed to get signer:', error);
            setSigner(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial signer load
        updateSigner();

        // Update signer when wallet state changes
        const unsubscribe = walletManager.onStateChange(() => {
            updateSigner();
        });

        return unsubscribe;
    }, [updateSigner]);

    return { signer, isLoading };
}

/**
 * Hook to get wallet type information
 */
export function useWalletType() {
    const [walletType, setWalletType] = useState({
        isWAuth: walletManager.isWAuthStrategy(),
        isArweaveNative: walletManager.isArweaveNativeStrategy(),
        isEthereum: walletManager.isEthereumWallet(),
        strategyId: walletManager.getCurrentStrategy()?.id || null
    });

    useEffect(() => {
        const unsubscribe = walletManager.onStateChange(() => {
            setWalletType({
                isWAuth: walletManager.isWAuthStrategy(),
                isArweaveNative: walletManager.isArweaveNativeStrategy(),
                isEthereum: walletManager.isEthereumWallet(),
                strategyId: walletManager.getCurrentStrategy()?.id || null
            });
        });

        return unsubscribe;
    }, []);

    return walletType;
}
