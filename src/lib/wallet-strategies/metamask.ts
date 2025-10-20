import { WalletStrategy } from './types';
import { createData, InjectedEthereumSigner } from "arbundles/web";
import { createWalletClient, custom, type WalletClient } from 'viem';
import { mainnet } from 'viem/chains';
import { BrowserProvider } from 'ethers';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export class MetaMaskWalletStrategy implements WalletStrategy {
    public id: string = "metamask";
    public name: string = "MetaMask";
    public description: string = "MetaMask Ethereum Wallet";
    public theme: string = "245,130,32"; // MetaMask orange
    public logo: string = "/logos/metamask.svg";
    public url: string = "https://metamask.io";
    
    private addressListeners: ((address: string) => void)[] = [];
    private currentAddress: string | null = null;
    private walletClient: WalletClient | null = null;

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners() {
        if (typeof window !== 'undefined' && window.ethereum) {
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    this.currentAddress = accounts[0];
                    this.addressListeners.forEach(listener => listener(accounts[0]));
                } else {
                    // User disconnected all accounts
                    this.currentAddress = null;
                }
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                // Reload the page on chain change as recommended by MetaMask
                window.location.reload();
            });

            // Listen for disconnect
            window.ethereum.on('disconnect', () => {
                this.currentAddress = null;
            });
        }
    }

    public async isAvailable(): Promise<boolean> {
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

    public async connect(): Promise<void> {
        console.log('🦊 Starting MetaMask connection...');
        
        if (!window.ethereum) {
            console.error('❌ window.ethereum not found');
            throw new Error('MetaMask is not installed. Please install it to use this feature.');
        }

        // Get the MetaMask provider (handle multiple wallet scenario)
        let provider = window.ethereum;
        
        // If multiple wallets are installed, find MetaMask specifically
        if (window.ethereum.providers) {
            console.log('🔍 Multiple wallet providers detected, finding MetaMask...');
            const metamaskProvider = window.ethereum.providers.find((p: any) => p.isMetaMask);
            if (metamaskProvider) {
                provider = metamaskProvider;
                console.log('✅ Found MetaMask provider');
            } else {
                throw new Error('MetaMask not found among installed wallet providers');
            }
        }

        console.log('✅ Using provider:', {
            isMetaMask: provider.isMetaMask,
            selectedAddress: provider.selectedAddress,
            chainId: provider.chainId
        });

        if (!provider.isMetaMask) {
            throw new Error('Please install MetaMask wallet extension.');
        }

        try {
            console.log('📞 Requesting eth_requestAccounts...');
            console.log('💡 Tip: Check your browser extensions bar for the MetaMask popup');
            
            // Request account access - this should trigger the MetaMask popup
            const accounts = await provider.request({ 
                method: 'eth_requestAccounts' 
            });

            console.log('✅ Received accounts:', accounts);

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found. Please unlock MetaMask.');
            }

            this.currentAddress = accounts[0];

            // Create wallet client using the correct provider
            this.walletClient = createWalletClient({
                chain: mainnet,
                transport: custom(provider)
            });

            console.log('🎉 Successfully connected to MetaMask:', this.currentAddress);
        } catch (error: any) {
            console.error('❌ MetaMask connection error:', {
                code: error.code,
                message: error.message,
                error
            });
            
            // User rejected the request
            if (error.code === 4001) {
                throw new Error('User rejected the connection request');
            }
            
            // Request already pending
            if (error.code === -32002) {
                throw new Error('Please check MetaMask - a connection request is already pending');
            }
            
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            // MetaMask doesn't have a programmatic disconnect method
            // We just clear our local state
            this.currentAddress = null;
            this.walletClient = null;
            console.log('Disconnected from MetaMask');
        } catch (error) {
            console.error('Error disconnecting MetaMask:', error);
            throw error;
        }
    }

    public async getActiveAddress(): Promise<string> {
        if (!window.ethereum) {
            throw new Error('MetaMask not available');
        }

        try {
            if (this.currentAddress) {
                return this.currentAddress;
            }

            const accounts = await window.ethereum.request({ 
                method: 'eth_accounts' 
            });
            
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts connected');
            }

            this.currentAddress = accounts[0];
            return accounts[0];
        } catch (error) {
            console.error('Failed to get active address:', error);
            throw error;
        }
    }

    public async getAllAddresses(): Promise<string[]> {
        if (!window.ethereum) {
            throw new Error('MetaMask not available');
        }

        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_accounts' 
            });
            return accounts || [];
        } catch (error) {
            console.error('Failed to get all addresses:', error);
            return [];
        }
    }

    public async getActivePublicKey(): Promise<string> {
        // For Ethereum wallets, the address itself serves as the public identifier
        // If you need the actual public key, you would need to sign a message
        // and recover it from the signature
        const address = await this.getActiveAddress();
        return address;
    }

    public async sign(transaction: any): Promise<any> {
        if (!window.ethereum) {
            throw new Error('MetaMask not available');
        }

        if (!this.walletClient) {
            throw new Error('Wallet not connected');
        }

        try {
            // Sign a message using MetaMask
            const address = await this.getActiveAddress();
            const signature = await this.walletClient.signMessage({
                account: address as `0x${string}`,
                message: typeof transaction === 'string' ? transaction : JSON.stringify(transaction)
            });

            return signature;
        } catch (error) {
            console.error('Failed to sign transaction:', error);
            throw error;
        }
    }

    public async getPermissions(): Promise<any[]> {
        if (!window.ethereum) {
            return [];
        }

        try {
            const permissions = await window.ethereum.request({
                method: 'wallet_getPermissions'
            });
            return permissions || [];
        } catch (error) {
            console.error('Failed to get permissions:', error);
            return [];
        }
    }

    public async getWalletNames(): Promise<Record<string, string>> {
        // MetaMask doesn't support wallet names like Arweave
        return {};
    }

    /**
     * Sign a data item for Arweave using MetaMask
     * This creates an Arweave-compatible signature using Ethereum signing
     */
    public async signDataItem(dataItem: any): Promise<ArrayBuffer> {
        if (!window.ethereum || !this.walletClient) {
            throw new Error('MetaMask not available or not connected');
        }

        try {
            const signer = this.createEthereumDataItemSigner();
            const result = await signer({ 
                data: dataItem.data,
                tags: dataItem.tags,
                target: dataItem.target,
                anchor: dataItem.anchor
            });

            if (!result) {
                throw new Error('Failed to sign data item');
            }

            return result.raw.buffer.slice(
                result.raw.byteOffset,
                result.raw.byteOffset + result.raw.byteLength
            ) as ArrayBuffer;
        } catch (error) {
            console.error('Failed to sign data item:', error);
            throw error;
        }
    }

    public async signAns104(dataItem: any): Promise<{ id: string, raw: ArrayBuffer }> {
        if (!window.ethereum || !this.walletClient) {
            throw new Error('MetaMask not available or not connected');
        }

        try {
            const signer = this.createEthereumDataItemSigner();
            const result = await signer({ 
                data: dataItem.data,
                tags: dataItem.tags,
                target: dataItem.target,
                anchor: dataItem.anchor
            });

            if (!result) {
                throw new Error('Failed to sign ANS-104 data item');
            }

            return {
                id: result.id,
                raw: result.raw.buffer.slice(
                    result.raw.byteOffset,
                    result.raw.byteOffset + result.raw.byteLength
                ) as ArrayBuffer
            };
        } catch (error) {
            console.error('Failed to sign ANS-104:', error);
            throw error;
        }
    }

    /**
     * Create a browser Ethereum data item signer for MetaMask using ethers
     * This creates an AO-compatible signer that can be used with arbundles
     * 
     * @param ethersProvider - An ethers BrowserProvider instance
     * @returns A signer function compatible with AO operations
     */
    private createEthersDataItemSigner(ethersProvider: BrowserProvider) {
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
     * Creates a data item signer compatible with arbundles
     * Uses InjectedEthereumSigner to sign data items with MetaMask
     */
    private createEthereumDataItemSigner() {
        const signer = async ({ data, tags, target, anchor }: any) => {
            if (!window.ethereum) {
                throw new Error('MetaMask not available');
            }

            // Create a provider wrapper compatible with InjectedEthereumSigner
            const provider = {
                getSigner: () => ({
                    signMessage: async (message: string | Uint8Array) => {
                        const address = await this.getActiveAddress();
                        
                        // Convert message to hex if it's a Uint8Array
                        let messageToSign: string;
                        if (message instanceof Uint8Array) {
                            messageToSign = Array.from(message)
                                .map(b => b.toString(16).padStart(2, '0'))
                                .join('');
                        } else {
                            messageToSign = message;
                        }

                        const signature = await window.ethereum.request({
                            method: 'personal_sign',
                            params: [messageToSign, address]
                        });

                        return signature;
                    }
                })
            };

            const ethSigner = new InjectedEthereumSigner(provider as any);
            await ethSigner.setPublicKey();

            const dataItem = createData(data, ethSigner, { tags, target, anchor });

            const res = await dataItem
                .sign(ethSigner)
                .then(async () => ({
                    id: await dataItem.id,
                    raw: await dataItem.getRaw(),
                }))
                .catch((e) => {
                    console.error('Error signing data item:', e);
                    return null;
                });

            // Log verification info for debugging
            if (res) {
                const isValid = await InjectedEthereumSigner.verify(
                    ethSigner.publicKey,
                    await dataItem.getSignatureData(),
                    dataItem.rawSignature
                );

                console.log('Data item signed:', {
                    valid: isValid,
                    id: dataItem.id,
                    owner: dataItem.owner,
                    tags: dataItem.tags
                });
            }

            return res;
        };

        return signer;
    }

    // Event handling
    public addAddressEvent(listener: (address: string) => void): any {
        this.addressListeners.push(listener);
        return listener;
    }

    public removeAddressEvent(listener: any): void {
        const index = this.addressListeners.indexOf(listener);
        if (index > -1) {
            this.addressListeners.splice(index, 1);
        }
    }

    /**
     * Get the MetaMask signer for use in other parts of the application
     * Returns the AO-compatible signer for use with ao-connect functions
     */
    public getSigner(): any {
        return this.getAoSigner();
    }

    /**
     * Get wallet client for direct viem usage
     */
    public getWalletClient(): WalletClient | null {
        return this.walletClient;
    }

    /**
     * Create a browser Ethereum data item signer
     * Uses ethers BrowserProvider with the createBrowserEthereumDataItemSigner utility
     * This returns a signer compatible with arbundles and AO operations
     * 
     * Note: For AO operations, prefer using getAoSigner() which is an alias to this method
     * 
     * @example
     * ```typescript
     * const strategy = getMetaMaskStrategy();
     * const signer = strategy.createBrowserEthereumDataItemSigner();
     * 
     * // Use with AO message/spawn functions
     * await spawnProcess("MyProcess", undefined, undefined, signer);
     * ```
     */
    public createBrowserEthereumDataItemSigner(): any {
        if (!window.ethereum) {
            throw new Error('MetaMask not available');
        }

        // Create ethers provider and return AO-compatible signer
        const provider = new BrowserProvider(window.ethereum);
        const signerFunction = this.createEthersDataItemSigner(provider);
        
        // Return both the signer function and a compatibility wrapper for backward compatibility
        return Object.assign(signerFunction, {
            getSigner: () => provider.getSigner()
        });
    }

    /**
     * Get AO-compatible signer for use with AO operations
     * This is the recommended way to get a signer for AO functions
     * Uses ethers BrowserProvider with createBrowserEthereumDataItemSigner
     * Compatible with @permaweb/aoconnect message/spawn functions
     */
    public getAoSigner(): any {
        if (!window.ethereum) {
            throw new Error('MetaMask not available');
        }

        // Create ethers provider from window.ethereum
        const provider = new BrowserProvider(window.ethereum);
        const signerFunction = this.createEthersDataItemSigner(provider);
        
        // Return both the signer function and a compatibility wrapper for backward compatibility
        return Object.assign(signerFunction, {
            getSigner: () => provider.getSigner()
        });
    }
}

