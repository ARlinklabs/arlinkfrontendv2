import { WalletStrategy } from './types';
import { WAuth, WAuthProviders } from "@wauth/sdk";
import { DataItem } from "@dha-team/arbundles";
import Transaction from "arweave/web/lib/transaction";

export class WAuthStrategy implements WalletStrategy {
    public id: string;
    public name: string;
    public description: string;
    public theme: string;
    public logo: string;
    public url: string;
    
    private walletRef: WAuth;
    private provider: WAuthProviders;
    private addressListeners: ((address: string) => void)[] = [];
    private scopes: string[];
    private authData: any;
    private authDataListeners: ((data: any) => void)[] = [];
    private windowArweaveWalletBackup: any;

    private logos: { [key in WAuthProviders]: string } = {
        [WAuthProviders.Google]: "mc-lqDefUJZdDSOOqepLICrfEoQCACnS51tB3kKqvlk",
        [WAuthProviders.Github]: "2bcLcWjuuRFDqFHlUvgvX2MzA2hOlZL1ED-T8OFBwCY",
        [WAuthProviders.Discord]: "i4Lw4kXr5t57p8E1oOVGMO4vR35TlYsaJ9XYbMMVd8I",
        [WAuthProviders.X]: "WEcpgXgwGO1PwuIAucwXHUiJ5HWHwkaYTUaAN4wlqQA"
    }

    constructor({ provider, scopes = [] }: { provider: WAuthProviders, scopes?: string[] }) {
        this.provider = provider;
        this.scopes = scopes;
        this.id = "wauth-" + this.provider;
        this.name = `${this.provider.charAt(0).toUpperCase() + this.provider.slice(1).toLowerCase()}`;
        this.description = "WAuth";
        this.theme = "25,25,25";
        this.url = "https://subspace.ar.io";
        
        // WAuth auto-reconnects based on localStorage - this is intentional
        // The "your connected wallet is undefined" console messages during initialization
        // are from WAuth SDK and are expected during the auto-reconnect process
        // never make dev false , it tries to log in using diffrent github urls , so best not touvh that
        this.walletRef = new WAuth({ dev: false });
        this.authData = this.walletRef.getAuthData();
        this.logo = this.logos[provider];
        this.windowArweaveWalletBackup = null;
        
        // Backup existing window.arweaveWallet if it exists
        if (window.arweaveWallet && window.arweaveWallet.walletName !== "WAuth") {
            this.windowArweaveWalletBackup = window.arweaveWallet;
        }
    }

    public async connect(permissions?: any[]): Promise<void> {
        if (permissions) {
            console.warn("WAuth does not support custom permissions");
        }
        
        const data = await this.walletRef.connect({ provider: this.provider, scopes: this.scopes });
        if (data) {
            this.authData = data?.meta;
            this.authDataListeners.forEach(listener => listener(data?.meta));
        }
    }

    public async reconnect(): Promise<any> {
        // WAuth auto-reconnects on initialization based on localStorage
        // First check if already connected from auto-reconnect
        try {
            const existingAuthData = this.walletRef.getAuthData();
            if (existingAuthData) {
                console.log('WAuth already auto-reconnected, using existing session');
                this.authData = existingAuthData;
                this.authDataListeners.forEach(listener => listener(existingAuthData));
                return existingAuthData;
            }
        } catch (e) {
            console.log('No existing WAuth session, connecting manually');
        }

        // If not already connected, try to connect
        const data = await this.walletRef.connect({ provider: this.provider, scopes: this.scopes });
        if (data) {
            this.authData = data?.meta;
            this.authDataListeners.forEach(listener => listener(this.authData));
        }
        return this.authData;
    }

    public onAuthDataChange(callback: (data: any) => void): void {
        this.authDataListeners.push(callback);
    }

    public getAuthData(): any {
        return this.walletRef.getAuthData();
    }

    public async addConnectedWallet(ArweaveWallet: any) {
        const address = await ArweaveWallet.getActiveAddress();
        const pkey = await ArweaveWallet.getActivePublicKey();
        if (!address) { throw new Error("No address found"); }
        if (!pkey) { throw new Error("No public key found") }

        // Connect with SIGNATURE permission if not already connected
        await ArweaveWallet.connect(["SIGNATURE"]);

        // Create message data and encode it - exactly as shown in docs
        const data = new TextEncoder().encode(JSON.stringify({ address, pkey }));

        // Sign the message - Wander will hash it internally with SHA-256
        const signature = await ArweaveWallet.signMessage(data);
        const signatureString = Buffer.from(signature).toString("base64");

        const resData = await this.walletRef.addConnectedWallet(address, pkey, signatureString);
        return resData;
    }

    public async removeConnectedWallet(walletId: string) {
        const resData = await this.walletRef.removeConnectedWallet(walletId);
        console.log(resData);
        return resData;
    }

    public async disconnect(): Promise<void> {
        this.walletRef.logout();
        this.authData = null;
    }

    public async getActiveAddress(): Promise<string> {
        return await this.walletRef.getActiveAddress();
    }

    public async getAllAddresses(): Promise<string[]> {
        return [await this.getActiveAddress()];
    }

    public async getActivePublicKey(): Promise<string> {
        return await this.walletRef.getActivePublicKey();
    }

    public async getConnectedWallets(): Promise<any[]> {
        return await this.walletRef.getConnectedWallets();
    }

    public async sign(transaction: Transaction, options?: any): Promise<Transaction> {
        return await this.walletRef.sign(transaction as any, options);
    }

    public async getPermissions(): Promise<any[]> {
        return await this.walletRef.getPermissions();
    }

    public async getWalletNames(): Promise<Record<string, string>> {
        return await this.walletRef.getWalletNames();
    }

    public encrypt(
        data: BufferSource,
        options: RsaOaepParams | AesCtrParams | AesCbcParams | AesGcmParams
    ): Promise<Uint8Array> {
        throw new Error("Encrypt is not implemented in WAuth yet");
    }

    public decrypt(
        data: BufferSource,
        options: RsaOaepParams | AesCtrParams | AesCbcParams | AesGcmParams
    ): Promise<Uint8Array> {
        throw new Error("Decrypt is not implemented in WAuth yet");
    }

    public async getArweaveConfig(): Promise<any> {
        return await this.walletRef.getArweaveConfig();
    }

    public async isAvailable(): Promise<boolean> {
        return true;
    }

    public async dispatch(transaction: Transaction): Promise<any> {
        throw new Error("Dispatch is not implemented in WAuth yet");
    }

    public async signDataItem(dataItem: any): Promise<ArrayBuffer> {
        return (await this.walletRef.signDataItem(dataItem));
    }

    public async signMessage(message: Uint8Array): Promise<Uint8Array> {
        // Match ArConnect's signMessage: RSA-PSS with SHA-256
        return await this.walletRef.signature(message, {
            name: "RSA-PSS",
            saltLength: 32,
        });
    }

    public async signature(data: Uint8Array, algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams): Promise<Uint8Array> {
        return (await this.walletRef.signature(data, algorithm));
    }

    public async signAns104(dataItem: any): Promise<{ id: string, raw: ArrayBuffer }> {
        return (await this.walletRef.signAns104(dataItem));
    }

    public addAddressEvent(listener: (address: string) => void): (e: CustomEvent<{ address: string }>) => void {
        this.addressListeners.push(listener);
        return listener as any;
    }

    public removeAddressEvent(listener: (e: CustomEvent<{ address: string }>) => void): void {
        this.addressListeners.splice(this.addressListeners.indexOf(listener as any), 1);
    }

    public getAoSigner() {
        return async (create: any, createDataItem: any) => {
            const { data, tags, target, anchor } = await create({ alg: 'rsa-v1_5-sha256', passthrough: true });
            const signedDataItem = await this.signAns104({ data, tags, target, anchor });
            const dataItem = new DataItem(Buffer.from(signedDataItem.raw));
            return { id: dataItem.id, raw: dataItem.getRaw() };
        }
    }

    public getEmail(): { email: string, verified: boolean } {
        return this.walletRef.getEmail();
    }

    public getUsername(): string | null {
        try {
            // First try to get username from wauth SDK
            const username = this.walletRef.getUsername();
            console.log('🔑 WAuthStrategy - SDK username:', username);
            if (username) return username;
            
            // If not available, try to extract from auth data
            const authData: any = this.walletRef.getAuthData();
            console.log('🔑 WAuthStrategy - Full auth data:', authData);
            
            // For GitHub provider, check various possible locations in auth data
            if (this.provider === WAuthProviders.Github && authData) {
                console.log('🔑 WAuthStrategy - Checking GitHub auth data for username...');
                
                // Check if username is in the auth data
                if (authData.username) {
                    console.log('✅ Found username in authData.username:', authData.username);
                    return authData.username;
                }
                if (authData.login) {
                    console.log('✅ Found username in authData.login:', authData.login);
                    return authData.login;
                }
                if (authData.user?.login) {
                    console.log('✅ Found username in authData.user.login:', authData.user.login);
                    return authData.user.login;
                }
                if (authData.user?.username) {
                    console.log('✅ Found username in authData.user.username:', authData.user.username);
                    return authData.user.username;
                }
                if (authData.profile?.login) {
                    console.log('✅ Found username in authData.profile.login:', authData.profile.login);
                    return authData.profile.login;
                }
                if (authData.profile?.username) {
                    console.log('✅ Found username in authData.profile.username:', authData.profile.username);
                    return authData.profile.username;
                }
                
                console.log('❌ No username found in any checked location');
            }
            
            return null;
        } catch (error) {
            console.error('❌ Error getting username:', error);
            return null;
        }
    }
}

// Helper functions from original strategy
export function shouldDisconnect(address: string | undefined, connected: boolean) {
    if (connected && !address && !localStorage.getItem("pocketbase_auth")) {
        return true;
    }
    return false;
}

export function fixConnection(address: string | undefined, connected: boolean, disconnect: () => void) {
    if (shouldDisconnect(address, connected)) {
        localStorage.removeItem("pocketbase_auth");
        localStorage.removeItem("wallet_kit_strategy_id");
        disconnect();
    }
}

export { WAuthProviders };
