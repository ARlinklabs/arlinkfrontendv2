/**
 * Utility functions for working with wallet signers
 * 
 * This file provides helper functions to get the correct signer based on the current wallet strategy.
 * Use these utilities throughout the app instead of directly accessing window.arweaveWallet or api?.getAoSigner()
 */

import { walletManager } from './wallet-manager';
import { createData, InjectedEthereumSigner } from "arbundles/web";
import { BrowserProvider } from 'ethers';

/**
 * Get the current signer based on active wallet strategy
 * 
 * Returns:
 * - window.arweaveWallet for native Arweave wallets (Wander)
 * - WAuth AO signer for OAuth-based wallets (GitHub, Google, etc.)
 * 
 * @example
 * ```typescript
 * import { getCurrentSigner } from '@/lib/wallet-strategies/signer-utils';
 * 
 * const signer = getCurrentSigner();
 * if (signer) {
 *   // Use the signer for transactions
 *   const ario = ARIO.init({
 *     process: new AOProcess({ processId: ARIO_PROCESS_ID }),
 *     signer: new ArconnectSigner(signer, Arweave.init({}))
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
 * Create a browser Ethereum data item signer for MetaMask using ethers
 * This creates an AO-compatible signer that can be used with arbundles
 * 
 * @param ethersProvider - An ethers BrowserProvider instance
 * @returns A signer function compatible with AO operations
 * 
 * @example
 * ```typescript
 * import { createBrowserEthereumDataItemSigner } from '@/lib/wallet-strategies/signer-utils';
 * import { BrowserProvider } from 'ethers';
 * 
 * const provider = new BrowserProvider(window.ethereum);
 * const signer = createBrowserEthereumDataItemSigner(provider);
 * 
 * // Use with AO operations
 * await spawnProcess("MyProcess", undefined, undefined, signer);
 * ```
 */
export function createBrowserEthereumDataItemSigner(
  ethersProvider: BrowserProvider
) {
  /**
   * createDataItem can be passed here for the purposes of unit testing
   * with a stub
   */
  const signer = async ({ data, tags, target, anchor }: any) => {
    // Get the ethers signer once at the beginning
    const ethersSigner = await ethersProvider.getSigner();

    // Create provider object that returns the already-resolved signer
    const provider = {
      getSigner: () => ({
        signMessage: async (message: string) => {
          return await ethersSigner.signMessage(message);
        },
      }),
    };

    const ethSigner = new InjectedEthereumSigner(provider as any);
    await ethSigner.setPublicKey();

    const dataItem = createData(data, ethSigner, { tags, target, anchor });

    console.log(dataItem);

    const res = await dataItem
      .sign(ethSigner)
      .then(async () => ({
        id: await dataItem.id,
        raw: await dataItem.getRaw(),
      }))
      .catch((e) => {
        console.error(e);
        return null; // Handle errors gracefully
      });

    console.dir(
      {
        valid: await InjectedEthereumSigner.verify(
          ethSigner.publicKey,
          await dataItem.getSignatureData(),
          dataItem.rawSignature
        ),
        signature: dataItem.signature,
        owner: dataItem.owner,
        tags: dataItem.tags,
        id: dataItem.id,
        res,
      },
      { depth: 2 }
    );

    return res;
  };

  return signer;
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
 *   const signer = useSigner(); // Automatically updates when wallet changes
 *   
 *   // Use signer in your operations
 * }
 * ```
 */

