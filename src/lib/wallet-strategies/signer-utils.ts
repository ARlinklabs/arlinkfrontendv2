/**
 * Utility functions for working with wallet signers
 * 
 * This file provides helper functions to get the correct signer based on the current wallet strategy.
 * Use these utilities throughout the app instead of directly accessing window.arweaveWallet or api?.getAoSigner()
 * 
 * IMPORTANT FOR AO OPERATIONS:
 * When using signers with AO message/spawn operations, always use prepareAoSigner() from ao-vars.ts
 * to ensure the signer is properly formatted:
 * - Native Arweave wallets return window.arweaveWallet (object) - needs wrapping with createDataItemSigner
 * - WAuth wallets return an AO signer function - use directly, no wrapping needed
 * - MetaMask wallets return an AO signer function - use directly, no wrapping needed
 */

import { walletManager } from './wallet-manager';
import { InjectedEthereumSigner } from "arbundles/web";
import { Web3Provider } from '@ethersproject/providers';

/**
 * Get the current signer based on active wallet strategy
 * 
 * Returns different types based on the wallet:
 * - Native Arweave wallet (Wander): window.arweaveWallet (object)
 * - WAuth (OAuth): AO signer function
 * - MetaMask: AO signer function
 * 
 * IMPORTANT: For AO operations, use prepareAoSigner() from ao-vars.ts to wrap this signer correctly.
 * 
 * @example
 * ```typescript
 * import { getCurrentSigner } from '@/lib/wallet-strategies/signer-utils';
 * import { spawnProcess, prepareAoSigner } from '@/lib/ao-vars';
 * 
 * const rawSigner = await getCurrentSigner();
 * 
 * // For AO operations - use prepareAoSigner
 * const processId = await spawnProcess("MyProcess", undefined, undefined, rawSigner);
 * // prepareAoSigner is called internally in ao-vars functions
 * 
 * // For other uses (ARIO, etc.)
 * if (rawSigner) {
 *   const ario = ARIO.init({
 *     process: new AOProcess({ processId: ARIO_PROCESS_ID }),
 *     signer: new ArconnectSigner(rawSigner, Arweave.init({}))
 *   });
 * }
 * ```
 */
export function getCurrentSigner(): any {
    return walletManager.getSigner();
}

/**
 * Check if the current wallet is WAuth-based (OAuth)
 * 
 * @example
 * ```typescript
 * import { isWAuthWallet } from '@/lib/wallet-strategies/signer-utils';
 * 
 * if (isWAuthWallet()) {
 *   // This is a GitHub/Google/Discord/X wallet
 *   console.log('Using OAuth wallet');
 * }
 * ```
 */
export function isWAuthWallet(): boolean {
    return walletManager.isWAuthStrategy();
}

/**
 * Check if the current wallet is a native Arweave wallet
 * 
 * @example
 * ```typescript
 * import { isArweaveWallet } from '@/lib/wallet-strategies/signer-utils';
 * 
 * if (isArweaveWallet()) {
 *   // This is Wander or another native Arweave wallet
 *   console.log('Using native Arweave wallet');
 * }
 * ```
 */
export function isArweaveWallet(): boolean {
    return walletManager.isArweaveNativeStrategy();
}

/**
 * Check if the current wallet is MetaMask
 * 
 * @example
 * ```typescript
 * import { isMetaMaskWallet } from '@/lib/wallet-strategies/signer-utils';
 * 
 * if (isMetaMaskWallet()) {
 *   // This is MetaMask wallet
 *   console.log('Using MetaMask wallet');
 * }
 * ```
 */
export function isMetaMaskWallet(): boolean {
    return walletManager.isMetaMaskStrategy();
}

/**
 * Get signer for ARIO operations
 * This is a convenience wrapper that ensures you always get the right signer
 * 
 * @example
 * ```typescript
 * import { getArioSigner } from '@/lib/wallet-strategies/signer-utils';
 * import { ARIO } from '@ar.io/sdk';
 * import { ArconnectSigner } from 'arbundles';
 * 
 * const signer = getArioSigner();
 * const ario = ARIO.init({
 *   process: new AOProcess({ processId: ARIO_PROCESS_ID }),
 *   signer
 * });
 * ```
 */
export function getArioSigner(): any {
    const signer = getCurrentSigner();
    
    if (!signer) {
        throw new Error('No wallet connected');
    }
    
    return signer;
}

/**
 * Get the current wallet strategy type
 * Returns the strategy ID (e.g., "arweave-native", "wauth-github")
 */
export function getWalletStrategyId(): string | null {
    const strategy = walletManager.getCurrentStrategy();
    return strategy?.id || null;
}

/**
 * Create a browser Ethereum data item signer for MetaMask using Web3Provider
 * This creates an AO-compatible signer that follows the correct pattern for @permaweb/aoconnect
 * 
 * @param ethersProvider - A Web3Provider instance from @ethersproject/providers
 * @returns A signer function compatible with AO operations
 * 
 * Pattern: async (create, signatureType) => { signature, owner }
 * 
 * @example
 * ```typescript
 * import { createBrowserEthereumDataItemSigner } from '@/lib/wallet-strategies/signer-utils';
 * import { Web3Provider } from '@ethersproject/providers';
 * 
 * const provider = new Web3Provider(window.ethereum);
 * const signer = createBrowserEthereumDataItemSigner(provider);
 * 
 * // Use with AO operations
 * await spawnProcess("MyProcess", undefined, undefined, signer);
 * ```
 */
export function createBrowserEthereumDataItemSigner(
  ethersProvider: Web3Provider
) {
  return async (create: any, _signatureType?: any) => {
    console.log('[Ethereum Data Item Signer] Creating data item with Ethereum signature');
    
    // Initialize Ethereum signer - pass provider directly
    const ethSigner = new InjectedEthereumSigner(ethersProvider);
    await ethSigner.setPublicKey();

    console.log('[Ethereum Data Item Signer] Ethereum signer initialized, public key set');

    // Call create() with Ethereum signature parameters
    // type: 3 is SignatureConfig.ETHEREUM
    const dataToSign = await create({
      publicKey: ethSigner.publicKey, // 65-byte secp256k1 public key
      type: 3, // SignatureConfig.ETHEREUM
      alg: "secp256k1"
    });

    console.log('[Ethereum Data Item Signer] Data to sign prepared, signing...');

    // Sign the data with Ethereum signer
    const signature = await ethSigner.sign(dataToSign);

    console.log('[Ethereum Data Item Signer] Signature created successfully');

    return {
      signature: signature,
      owner: ethSigner.publicKey
    };
  };
}

/**
 * Example usage throughout the app:
 * 
 * BEFORE:
 * ```typescript
 * const signer = api?.getAoSigner(); // Only works for WAuth
 * // or
 * const signer = window.arweaveWallet; // Only works for native wallets
 * ```
 * 
 * AFTER:
 * ```typescript
 * import { getCurrentSigner } from '@/lib/wallet-strategies/signer-utils';
 * const signer = getCurrentSigner(); // Works for both!
 * ```
 * 
 * IN REACT COMPONENTS:
 * ```typescript
 * import { useSigner } from '@/lib/wallet-strategies';
 * 
 * function MyComponent() {
 *   const { signer } = useSigner(); // Automatically updates when wallet changes
 *   
 *   // Use signer in your operations
 * }
 * ```
 */

