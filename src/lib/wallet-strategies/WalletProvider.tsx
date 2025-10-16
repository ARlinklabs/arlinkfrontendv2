import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { walletManager } from './wallet-manager';
import { WalletConnectionState } from './types';

interface WalletContextType extends WalletConnectionState {
    connect: (permissions?: any[]) => Promise<void>;
    disconnect: () => Promise<void>;
    getActiveAddress: () => Promise<string | null>;
    getActivePublicKey: () => Promise<string | null>;
    sign: (transaction: any, options?: any) => Promise<any>;
    signDataItem: (dataItem: any) => Promise<ArrayBuffer>;
    signAns104: (dataItem: any) => Promise<{ id: string, raw: ArrayBuffer }>;
    isLoading: boolean;
    error: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
    children: ReactNode;
    theme?: {
        displayTheme?: 'light' | 'dark';
    };
    config?: {
        permissions?: string[];
        ensurePermissions?: boolean;
    };
}

export function WalletProvider({ children, theme, config }: WalletProviderProps) {
    const [state, setState] = React.useState<WalletConnectionState>(walletManager.getState());
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = walletManager.onStateChange(setState);
        return unsubscribe;
    }, []);

    const connect = async (permissions?: any[]) => {
        setIsLoading(true);
        setError(null);
        try {
            await walletManager.connect(permissions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect wallet');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const disconnect = async () => {
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
    };

    const getActiveAddress = async () => {
        return await walletManager.getActiveAddress();
    };

    const getActivePublicKey = async () => {
        return await walletManager.getActivePublicKey();
    };

    const sign = async (transaction: any, options?: any) => {
        return await walletManager.sign(transaction, options);
    };

    const signDataItem = async (dataItem: any) => {
        return await walletManager.signDataItem(dataItem);
    };

    const signAns104 = async (dataItem: any) => {
        return await walletManager.signAns104(dataItem);
    };

    const contextValue: WalletContextType = {
        ...state,
        connect,
        disconnect,
        getActiveAddress,
        getActivePublicKey,
        sign,
        signDataItem,
        signAns104,
        isLoading,
        error
    };

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWalletContext(): WalletContextType {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWalletContext must be used within a WalletProvider');
    }
    return context;
}
