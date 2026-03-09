import { WalletStrategy } from './types';
import { DataItem } from "@dha-team/arbundles";
import Transaction from "arweave/web/lib/transaction";

declare global {
    interface Window {
        arweaveWallet: any;
    }
}

export class ArweaveWalletStrategy implements WalletStrategy {
    public id: string = "arweave-native";
    public name: string = "Wander";
    public description: string = "Native Arweave Wallet (Wander, etc.)";
    public theme: string = "0,0,0";
    public logo: string = "/logos/wander.png";
    public url: string = "https://wander.app";
    
    private addressListeners: ((address: string) => void)[] = [];
    private isConnected: boolean = false;
    private currentAddress: string | null = null;
    private permissions: string[] = [
        "ACCESS_ADDRESS",
        "ACCESS_ALL_ADDRESSES",
        "ACCESS_ARWEAVE_CONFIG",
        "ACCESS_PUBLIC_KEY",
        "DECRYPT",
        "ENCRYPT",
        "DISPATCH",
        "SIGNATURE",
        "SIGN_TRANSACTION",
    ];

    constructor() {
        // Check if wallet is available
        this.setupEventListeners();
    }

    private setupEventListeners() {
        // Listen for wallet events if available
        if (typeof window !== 'undefined' && window.arweaveWallet) {
            // Some wallets emit events when the address changes
            try {
                window.addEventListener('arweaveWalletLoaded', () => {
                    console.log('Arweave wallet loaded');
                });
                
                window.addEventListener('walletSwitch', async (e: any) => {
                    console.log('Wallet switched:', e.detail.address);
                    this.currentAddress = e.detail.address;
                    this.addressListeners.forEach(listener => listener(e.detail.address));
                });
            } catch (error) {
                console.warn('Could not setup Arweave wallet event listeners:', error);
            }
        }
    }

    public async isAvailable(): Promise<boolean> {
        return typeof window !== 'undefined' && !!window.arweaveWallet;
    }

    public async connect(permissions?: any[]): Promise<void> {
        const perms = permissions || this.permissions;
        
        if (!window.arweaveWallet) {
            throw new Error('Arweave wallet not found. Please install Wander or another Arweave wallet extension.');
        }

        try {
            await window.arweaveWallet.connect(perms, {
                name: "Arlink",
            });
            
            // Get the active address after connection
            this.currentAddress = await window.arweaveWallet.getActiveAddress();
            this.isConnected = true;
            
            console.log('Connected to Arweave wallet:', this.currentAddress);
        } catch (error) {
            console.error('Failed to connect to Arweave wallet:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            if (window.arweaveWallet && window.arweaveWallet.disconnect) {
                await window.arweaveWallet.disconnect();
            }
            this.isConnected = false;
            this.currentAddress = null;
            console.log('Disconnected from Arweave wallet');
        } catch (error) {
            console.error('Error disconnecting Arweave wallet:', error);
            throw error;
        }
    }

    public async getActiveAddress(): Promise<string> {
        if (!window.arweaveWallet) {
            throw new Error('Arweave wallet not available');
        }

        try {
            const address = await window.arweaveWallet.getActiveAddress();
            this.currentAddress = address;
            return address;
        } catch (error) {
            console.error('Failed to get active address:', error);
            throw error;
        }
    }

    public async getAllAddresses(): Promise<string[]> {
        if (!window.arweaveWallet) {
            throw new Error('Arweave wallet not available');
        }

        try {
            if (window.arweaveWallet.getAllAddresses) {
                return await window.arweaveWallet.getAllAddresses();
            }
            // Fallback to active address if getAllAddresses is not available
            const activeAddress = await this.getActiveAddress();
            return [activeAddress];
        } catch (error) {
            console.error('Failed to get all addresses:', error);
            return [];
        }
    }

    public async getActivePublicKey(): Promise<string> {
        if (!window.arweaveWallet) {
            throw new Error('Arweave wallet not available');
        }

        try {
            return await window.arweaveWallet.getActivePublicKey();
        } catch (error) {
            console.error('Failed to get active public key:', error);
            throw error;
        }
    }

    public async sign(transaction: any, options?: any): Promise<any> {
        if (!window.arweaveWallet) {
            throw new Error('Arweave wallet not available');
        }

        try {
            return await window.arweaveWallet.sign(transaction as Transaction, options);
        } catch (error) {
            console.error('Failed to sign transaction:', error);
            throw error;
        }
    }

    public async getPermissions(): Promise<any[]> {
        if (!window.arweaveWallet) {
            return [];
        }

        try {
            if (window.arweaveWallet.getPermissions) {
                return await window.arweaveWallet.getPermissions();
            }
            return this.permissions;
        } catch (error) {
            console.error('Failed to get permissions:', error);
            return [];
        }
    }

    public async getWalletNames(): Promise<Record<string, string>> {
        if (!window.arweaveWallet && window.arweaveWallet.getWalletNames) {
            try {
                return await window.arweaveWallet.getWalletNames();
            } catch (error) {
                console.error('Failed to get wallet names:', error);
            }
        }
        return {};
    }

    // Optional methods
    public async signMessage(message: Uint8Array): Promise<Uint8Array> {
        if (!window.arweaveWallet?.signMessage) {
            throw new Error('signMessage not supported by current wallet');
        }
        return await window.arweaveWallet.signMessage(message);
    }

    public async encrypt(data: BufferSource, options: any): Promise<Uint8Array> {
        if (!window.arweaveWallet || !window.arweaveWallet.encrypt) {
            throw new Error('Encrypt not supported');
        }
        return await window.arweaveWallet.encrypt(data, options);
    }

    public async decrypt(data: BufferSource, options: any): Promise<Uint8Array> {
        if (!window.arweaveWallet || !window.arweaveWallet.decrypt) {
            throw new Error('Decrypt not supported');
        }
        return await window.arweaveWallet.decrypt(data, options);
    }

    public async getArweaveConfig(): Promise<any> {
        if (!window.arweaveWallet || !window.arweaveWallet.getArweaveConfig) {
            return null;
        }
        try {
            return await window.arweaveWallet.getArweaveConfig();
        } catch (error) {
            console.error('Failed to get Arweave config:', error);
            return null;
        }
    }

    public async dispatch(transaction: any): Promise<any> {
        if (!window.arweaveWallet || !window.arweaveWallet.dispatch) {
            throw new Error('Dispatch not supported');
        }
        return await window.arweaveWallet.dispatch(transaction);
    }

    public async signDataItem(dataItem: any): Promise<ArrayBuffer> {
        if (!window.arweaveWallet) {
            throw new Error('Arweave wallet not available');
        }

        try {
            return await window.arweaveWallet.signDataItem(dataItem as DataItem);
        } catch (error) {
            console.error('Failed to sign data item:', error);
            throw error;
        }
    }

    public async signature(data: Uint8Array, algorithm: any): Promise<Uint8Array> {
        if (!window.arweaveWallet || !window.arweaveWallet.signature) {
            throw new Error('Signature method not supported');
        }
        return await window.arweaveWallet.signature(data, algorithm);
    }

    public async signAns104(dataItem: any): Promise<{ id: string, raw: ArrayBuffer }> {
        if (!window.arweaveWallet) {
            throw new Error('Arweave wallet not available');
        }

        try {
            return await window.arweaveWallet.signAns104(dataItem as DataItem);
        } catch (error) {
            console.error('Failed to sign ANS-104:', error);
            throw error;
        }
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
}

