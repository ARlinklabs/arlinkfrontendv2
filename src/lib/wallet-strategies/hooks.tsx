import { useState, useEffect, useCallback } from 'react';
import { walletManager } from './wallet-manager';
import { WalletConnectionState, WalletHookReturn } from './types';

/**
 * Hook that provides wallet connection state and methods
 * This replaces useConnection from @arweave-wallet-kit/react
 */
export function useConnection(): WalletHookReturn {
    const [state, setState] = useState<WalletConnectionState>(walletManager.getState());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = walletManager.onStateChange(setState);
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
 * Hook for WAuth specific functionality
 */
export function useWAuth() {
    const [email, setEmail] = useState<{ email: string, verified: boolean } | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [connectedWallets, setConnectedWallets] = useState<any[]>([]);

    useEffect(() => {
        const updateWAuthData = () => {
            const emailData = walletManager.getEmail();
            const usernameData = walletManager.getUsername();
            
            setEmail(emailData);
            setUsername(usernameData);

            // Update connected wallets
            walletManager.getConnectedWallets().then(setConnectedWallets);
        };

        // Initial load
        updateWAuthData();

        // Listen for auth data changes
        walletManager.onAuthDataChange(updateWAuthData);

        // Listen for wallet state changes
        const unsubscribe = walletManager.onStateChange(updateWAuthData);
        
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

    return {
        email,
        username,
        connectedWallets,
        addConnectedWallet,
        removeConnectedWallet,
        reconnect,
        getAuthData,
        getAoSigner
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
