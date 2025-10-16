import { WalletStrategy, WalletConnectionState } from './types';
import { WAuthStrategy, WAuthProviders } from './wauth';

export class WalletManager {
    private strategies: Map<string, WalletStrategy> = new Map();
    private currentStrategy: WalletStrategy | null = null;
    private state: WalletConnectionState = {
        connected: false,
        address: null,
        publicKey: null,
        permissions: [],
        strategy: null
    };
    private stateListeners: ((state: WalletConnectionState) => void)[] = [];

    constructor() {
        this.initializeStrategies();
    }

    private initializeStrategies() {
        // Initialize WAuth strategies for different providers
        const wauthStrategies = [
            { provider: WAuthProviders.Github },
            { provider: WAuthProviders.Google },
            { provider: WAuthProviders.Discord },
            { provider: WAuthProviders.X }
        ];

        wauthStrategies.forEach(({ provider }) => {
            const strategy = new WAuthStrategy({ provider });
            this.strategies.set(strategy.id, strategy);
        });

        // Set default strategy (GitHub WAuth)
        const defaultStrategyId = `wauth-${WAuthProviders.Github}`;
        const defaultStrategy = this.strategies.get(defaultStrategyId);
        if (defaultStrategy) {
            this.currentStrategy = defaultStrategy;
            this.updateState({ strategy: defaultStrategy });
        }
    }

    public getStrategies(): WalletStrategy[] {
        return Array.from(this.strategies.values());
    }

    public getCurrentStrategy(): WalletStrategy | null {
        return this.currentStrategy;
    }

    public setStrategy(strategyId: string): boolean {
        const strategy = this.strategies.get(strategyId);
        if (strategy) {
            this.currentStrategy = strategy;
            this.updateState({ strategy });
            return true;
        }
        return false;
    }

    public getState(): WalletConnectionState {
        return { ...this.state };
    }

    public onStateChange(listener: (state: WalletConnectionState) => void): () => void {
        this.stateListeners.push(listener);
        return () => {
            const index = this.stateListeners.indexOf(listener);
            if (index > -1) {
                this.stateListeners.splice(index, 1);
            }
        };
    }

    private updateState(updates: Partial<WalletConnectionState>) {
        this.state = { ...this.state, ...updates };
        this.stateListeners.forEach(listener => listener(this.state));
    }

    public async connect(permissions?: any[]): Promise<void> {
        if (!this.currentStrategy) {
            throw new Error('No wallet strategy selected');
        }

        try {
            await this.currentStrategy.connect(permissions);
            
            const address = await this.currentStrategy.getActiveAddress();
            const publicKey = await this.currentStrategy.getActivePublicKey();
            const walletPermissions = await this.currentStrategy.getPermissions();

            this.updateState({
                connected: true,
                address,
                publicKey,
                permissions: walletPermissions,
                strategy: this.currentStrategy
            });
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.currentStrategy) {
            return;
        }

        try {
            await this.currentStrategy.disconnect();
            this.updateState({
                connected: false,
                address: null,
                publicKey: null,
                permissions: [],
                strategy: null
            });
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
            throw error;
        }
    }

    public async getActiveAddress(): Promise<string | null> {
        if (!this.currentStrategy || !this.state.connected) {
            return null;
        }

        try {
            return await this.currentStrategy.getActiveAddress();
        } catch (error) {
            console.error('Failed to get active address:', error);
            return null;
        }
    }

    public async getActivePublicKey(): Promise<string | null> {
        if (!this.currentStrategy || !this.state.connected) {
            return null;
        }

        try {
            return await this.currentStrategy.getActivePublicKey();
        } catch (error) {
            console.error('Failed to get active public key:', error);
            return null;
        }
    }

    public async sign(transaction: any, options?: any): Promise<any> {
        if (!this.currentStrategy) {
            throw new Error('No wallet strategy selected');
        }

        return await this.currentStrategy.sign(transaction, options);
    }

    public async signDataItem(dataItem: any): Promise<ArrayBuffer> {
        if (!this.currentStrategy) {
            throw new Error('No wallet strategy selected');
        }

        if (!this.currentStrategy.signDataItem) {
            throw new Error('Sign data item not supported by current strategy');
        }

        return await this.currentStrategy.signDataItem(dataItem);
    }

    public async signAns104(dataItem: any): Promise<{ id: string, raw: ArrayBuffer }> {
        if (!this.currentStrategy) {
            throw new Error('No wallet strategy selected');
        }

        if (!this.currentStrategy.signAns104) {
            throw new Error('Sign ANS-104 not supported by current strategy');
        }

        return await this.currentStrategy.signAns104(dataItem);
    }

    // WAuth specific methods
    public getEmail(): { email: string, verified: boolean } | null {
        if (!this.currentStrategy || !this.currentStrategy.getEmail) {
            return null;
        }

        return this.currentStrategy.getEmail();
    }

    public getUsername(): string | null {
        if (!this.currentStrategy || !this.currentStrategy.getUsername) {
            return null;
        }

        return this.currentStrategy.getUsername();
    }

    public async addConnectedWallet(wallet: any): Promise<any> {
        if (!this.currentStrategy || !this.currentStrategy.addConnectedWallet) {
            throw new Error('Add connected wallet not supported by current strategy');
        }

        return await this.currentStrategy.addConnectedWallet(wallet);
    }

    public async removeConnectedWallet(walletId: string): Promise<any> {
        if (!this.currentStrategy || !this.currentStrategy.removeConnectedWallet) {
            throw new Error('Remove connected wallet not supported by current strategy');
        }

        return await this.currentStrategy.removeConnectedWallet(walletId);
    }

    public async getConnectedWallets(): Promise<any[]> {
        if (!this.currentStrategy || !this.currentStrategy.getConnectedWallets) {
            return [];
        }

        return await this.currentStrategy.getConnectedWallets();
    }

    public getAuthData(): any {
        if (!this.currentStrategy || !this.currentStrategy.getAuthData) {
            return null;
        }

        return this.currentStrategy.getAuthData();
    }

    public onAuthDataChange(callback: (data: any) => void): void {
        if (!this.currentStrategy || !this.currentStrategy.onAuthDataChange) {
            return;
        }

        this.currentStrategy.onAuthDataChange(callback);
    }

    public async reconnect(): Promise<any> {
        if (!this.currentStrategy || !this.currentStrategy.reconnect) {
            return null;
        }

        return await this.currentStrategy.reconnect();
    }

    public getAoSigner(): any {
        if (!this.currentStrategy || !this.currentStrategy.getAoSigner) {
            return null;
        }

        return this.currentStrategy.getAoSigner();
    }
}

// Global wallet manager instance
export const walletManager = new WalletManager();
