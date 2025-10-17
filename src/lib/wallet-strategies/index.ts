// Export all wallet strategy functionality
export * from './types';
export * from './wauth';
export * from './arweave';
export * from './metamask';
export * from './metamask-utils';
export * from './wallet-manager';
export * from './hooks';
export * from './signer-utils';

// Re-export commonly used items for convenience
export { walletManager } from './wallet-manager';
export { WAuthStrategy, WAuthProviders, fixConnection } from './wauth';
export { ArweaveWalletStrategy } from './arweave';
export { MetaMaskWalletStrategy } from './metamask';
export { 
    useConnection, 
    useActiveAddress, 
    useApi, 
    useProfileModal, 
    useWAuth, 
    useWalletStrategies,
    useSigner,
    useWalletType
} from './hooks';
export {
    getCurrentSigner,
    isWAuthWallet,
    isArweaveWallet,
    isMetaMaskWallet,
    getArioSigner,
    getWalletStrategyId,
    createBrowserEthereumDataItemSigner
} from './signer-utils';
export {
    connectMetaMask,
    isMetaMaskAvailable,
    getMetaMaskStrategy,
    getMetaMaskWalletClient,
    switchMetaMaskNetwork,
    addMetaMaskNetwork,
    getMetaMaskChainId,
    signMessageWithMetaMask
} from './metamask-utils';
