/**
 * MetaMask Utility Functions
 * 
 * Helper functions specifically for MetaMask integration
 */

import { walletManager } from './wallet-manager';
import { MetaMaskWalletStrategy } from './metamask';

/**
 * Connect to MetaMask wallet
 * This is a convenience function that sets MetaMask as the strategy and connects
 * 
 * @example
 * ```typescript
 * import { connectMetaMask } from '@/lib/wallet-strategies/metamask-utils';
 * 
 * async function handleConnect() {
 *   try {
 *     const result = await connectMetaMask();
 *     console.log('Connected to MetaMask:', result.address);
 *   } catch (error) {
 *     console.error('Failed to connect:', error);
 *   }
 * }
 * ```
 */
export async function connectMetaMask(): Promise<{
    address: string;
    strategy: MetaMaskWalletStrategy;
}> {
    // Check if MetaMask is installed
    if (typeof window === 'undefined' || !window.ethereum || !window.ethereum.isMetaMask) {
        throw new Error('MetaMask is not installed. Please install it to use this feature.');
    }

    try {
        // Set MetaMask as the current strategy
        const success = walletManager.setStrategy('metamask');
        if (!success) {
            throw new Error('Failed to set MetaMask strategy');
        }

        // Connect to MetaMask
        await walletManager.connect();

        // Get the connected address
        const address = await walletManager.getActiveAddress();
        if (!address) {
            throw new Error('Failed to get address after connection');
        }

        const strategy = walletManager.getCurrentStrategy() as MetaMaskWalletStrategy;

        return { address, strategy };
    } catch (error: any) {
        // Handle specific MetaMask errors
        if (error.code === 4001) {
            throw new Error('User rejected the connection request');
        } else if (error.code === -32002) {
            throw new Error('Please check MetaMask - a connection request is already pending');
        }
        
        console.error('Error connecting to MetaMask:', error);
        throw error;
    }
}

/**
 * Check if MetaMask is installed and available
 * 
 * @example
 * ```typescript
 * import { isMetaMaskAvailable } from '@/lib/wallet-strategies/metamask-utils';
 * 
 * if (isMetaMaskAvailable()) {
 *   // Show MetaMask connect button
 * } else {
 *   // Show install MetaMask prompt
 * }
 * ```
 */
export function isMetaMaskAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for MetaMask directly
    if (window.ethereum?.isMetaMask) {
        return true;
    }
    
    // Check if MetaMask is available in providers array (for multi-wallet scenarios)
    if (window.ethereum?.providers) {
        return window.ethereum.providers.some((p: any) => p.isMetaMask);
    }
    
    return false;
}

/**
 * Get the current MetaMask strategy instance
 * Returns null if MetaMask is not the current strategy
 * 
 * @example
 * ```typescript
 * import { getMetaMaskStrategy } from '@/lib/wallet-strategies/metamask-utils';
 * 
 * const strategy = getMetaMaskStrategy();
 * if (strategy) {
 *   const walletClient = strategy.getWalletClient();
 *   // Use walletClient for viem operations
 * }
 * ```
 */
export function getMetaMaskStrategy(): MetaMaskWalletStrategy | null {
    const strategy = walletManager.getCurrentStrategy();
    if (strategy && strategy.id === 'metamask') {
        return strategy as MetaMaskWalletStrategy;
    }
    return null;
}

/**
 * Get the MetaMask wallet client (viem WalletClient)
 * Useful for direct viem operations
 * 
 * @example
 * ```typescript
 * import { getMetaMaskWalletClient } from '@/lib/wallet-strategies/metamask-utils';
 * 
 * const walletClient = getMetaMaskWalletClient();
 * if (walletClient) {
 *   // Use walletClient for viem operations
 *   const hash = await walletClient.sendTransaction({ ... });
 * }
 * ```
 */
export function getMetaMaskWalletClient() {
    const strategy = getMetaMaskStrategy();
    return strategy?.getWalletClient() || null;
}

/**
 * Request to switch to a specific network in MetaMask
 * 
 * @param chainId - The chain ID to switch to (e.g., '0x1' for mainnet)
 * 
 * @example
 * ```typescript
 * import { switchMetaMaskNetwork } from '@/lib/wallet-strategies/metamask-utils';
 * 
 * // Switch to Ethereum mainnet
 * await switchMetaMaskNetwork('0x1');
 * 
 * // Switch to Polygon
 * await switchMetaMaskNetwork('0x89');
 * ```
 */
export async function switchMetaMaskNetwork(chainId: string): Promise<void> {
    if (!window.ethereum) {
        throw new Error('MetaMask not available');
    }

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
        });
    } catch (error: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (error.code === 4902) {
            throw new Error('This network has not been added to MetaMask');
        }
        throw error;
    }
}

/**
 * Add a custom network to MetaMask
 * 
 * @param network - Network configuration
 * 
 * @example
 * ```typescript
 * import { addMetaMaskNetwork } from '@/lib/wallet-strategies/metamask-utils';
 * 
 * await addMetaMaskNetwork({
 *   chainId: '0x89',
 *   chainName: 'Polygon',
 *   nativeCurrency: {
 *     name: 'MATIC',
 *     symbol: 'MATIC',
 *     decimals: 18
 *   },
 *   rpcUrls: ['https://polygon-rpc.com'],
 *   blockExplorerUrls: ['https://polygonscan.com']
 * });
 * ```
 */
export async function addMetaMaskNetwork(network: {
    chainId: string;
    chainName: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls?: string[];
}): Promise<void> {
    if (!window.ethereum) {
        throw new Error('MetaMask not available');
    }

    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
        });
    } catch (error) {
        console.error('Failed to add network:', error);
        throw error;
    }
}

/**
 * Get the current network/chain ID from MetaMask
 * 
 * @example
 * ```typescript
 * import { getMetaMaskChainId } from '@/lib/wallet-strategies/metamask-utils';
 * 
 * const chainId = await getMetaMaskChainId();
 * console.log('Current chain ID:', chainId);
 * // Output: "0x1" for mainnet
 * ```
 */
export async function getMetaMaskChainId(): Promise<string> {
    if (!window.ethereum) {
        throw new Error('MetaMask not available');
    }

    try {
        const chainId = await window.ethereum.request({
            method: 'eth_chainId',
        });
        return chainId;
    } catch (error) {
        console.error('Failed to get chain ID:', error);
        throw error;
    }
}

/**
 * Sign a message with MetaMask (personal_sign)
 * 
 * @param message - The message to sign
 * @param address - The address to sign with
 * 
 * @example
 * ```typescript
 * import { signMessageWithMetaMask } from '@/lib/wallet-strategies/metamask-utils';
 * 
 * const address = await walletManager.getActiveAddress();
 * const signature = await signMessageWithMetaMask('Hello Arweave!', address);
 * ```
 */
export async function signMessageWithMetaMask(
    message: string,
    address: string
): Promise<string> {
    if (!window.ethereum) {
        throw new Error('MetaMask not available');
    }

    try {
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, address],
        });
        return signature;
    } catch (error) {
        console.error('Failed to sign message:', error);
        throw error;
    }
}

/**
 * Create a browser Ethereum data item signer for MetaMask
 * This is compatible with arbundles and can be used with AO operations
 * 
 * Similar to the ethers-based createBrowserEthereumDataItemSigner but uses viem
 * 
 * @example
 * ```typescript
 * import { createBrowserEthereumDataItemSigner } from '@/lib/wallet-strategies/metamask-utils';
 * import { spawnProcess, runLua } from '@/lib/ao-vars';
 * 
 * // Create the signer
 * const signer = createBrowserEthereumDataItemSigner();
 * 
 * // Use with AO operations
 * const processId = await spawnProcess("MyProcess", undefined, undefined, signer);
 * await runLua(setupCode, processId, undefined, signer);
 * 
 * // Or use with ao.message
 * await ao.message({
 *   process: processId,
 *   tags: [{ name: "Action", value: "MyAction" }],
 *   signer: signer
 * });
 * ```
 */
export function createBrowserEthereumDataItemSigner(): any {
    const strategy = getMetaMaskStrategy();
    
    if (!strategy) {
        throw new Error('MetaMask is not connected or not the active strategy');
    }
    
    return strategy.createBrowserEthereumDataItemSigner();
}

