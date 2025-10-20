import { WalletStrategy, WalletConnectionState } from './types';
import { WAuthStrategy, WAuthProviders } from './wauth';
import { ArweaveWalletStrategy } from './arweave';
import { MetaMaskWalletStrategy } from './metamask';
import { createBrowserEthereumDataItemSigner } from './signer-utils';
import { BrowserProvider } from 'ethers';

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
    private readonly STRATEGY_CACHE_KEY = 'arlink_wallet_strategy';
    private readonly ADDRESS_CACHE_KEY = 'arlink_wallet_address';

    constructor() {
        this.initializeStrategies();
        this.loadCachedStrategy();
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

        // Initialize Arweave native wallet strategy
        const arweaveStrategy = new ArweaveWalletStrategy();
        this.strategies.set(arweaveStrategy.id, arweaveStrategy);

        // Initialize MetaMask wallet strategy
        const metamaskStrategy = new MetaMaskWalletStrategy();
        this.strategies.set(metamaskStrategy.id, metamaskStrategy);

        // Set default strategy (GitHub WAuth) - will be overridden by cached strategy if exists
        const defaultStrategyId = `wauth-${WAuthProviders.Github}`;
        const defaultStrategy = this.strategies.get(defaultStrategyId);
        if (defaultStrategy) {
            this.currentStrategy = defaultStrategy;
            this.updateState({ strategy: defaultStrategy });
        }
    }

    private loadCachedStrategy() {
        try {
            const cachedStrategyId = localStorage.getItem(this.STRATEGY_CACHE_KEY);
            if (cachedStrategyId) {
                const strategy = this.strategies.get(cachedStrategyId);
                if (strategy) {
                    this.currentStrategy = strategy;
                    this.updateState({ strategy });
                    console.log('Loaded cached wallet strategy:', cachedStrategyId);
                }
            }
        } catch (error) {
            console.warn('Failed to load cached strategy:', error);
        }
    }

    private cacheStrategy(strategyId: string | null) {
        try {
            if (strategyId) {
                localStorage.setItem(this.STRATEGY_CACHE_KEY, strategyId);
            } else {
                localStorage.removeItem(this.STRATEGY_CACHE_KEY);
            }
        } catch (error) {
            console.warn('Failed to cache strategy:', error);
        }
    }

    private cacheAddress(address: string | null) {
        try {
            if (address) {
                localStorage.setItem(this.ADDRESS_CACHE_KEY, address);
            } else {
                localStorage.removeItem(this.ADDRESS_CACHE_KEY);
            }
        } catch (error) {
            console.warn('Failed to cache address:', error);
        }
    }

    public getCachedAddress(): string | null {
        try {
            return localStorage.getItem(this.ADDRESS_CACHE_KEY);
        } catch (error) {
            return null;
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
            // Don't cache here - only cache on successful connection
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

        console.log('🔌 WalletManager: Starting connection with strategy:', this.currentStrategy.id);

        try {
            await this.currentStrategy.connect(permissions);
            console.log('✅ WalletManager: Strategy connect() completed');
            
            const address = await this.currentStrategy.getActiveAddress();
            console.log('✅ WalletManager: Got address:', address);
            
            const publicKey = await this.currentStrategy.getActivePublicKey();
            console.log('✅ WalletManager: Got public key:', publicKey);
            
            const walletPermissions = await this.currentStrategy.getPermissions();
            console.log('✅ WalletManager: Got permissions:', walletPermissions);

            console.log('📝 WalletManager: Updating state with:', {
                connected: true,
                address,
                publicKey,
                strategyId: this.currentStrategy.id
            });

            this.updateState({
                connected: true,
                address,
                publicKey,
                permissions: walletPermissions,
                strategy: this.currentStrategy
            });

            console.log('💾 WalletManager: State updated, current state:', this.getState());

            // Cache the strategy and address on successful connection
            this.cacheStrategy(this.currentStrategy.id);
            this.cacheAddress(address);
            
            console.log('🎉 WalletManager: Connection complete!');
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
            
            // Clear current strategy reference
            this.currentStrategy = null;
            
            this.updateState({
                connected: false,
                address: null,
                publicKey: null,
                permissions: [],
                strategy: null
            });

            // Clear cached data on disconnect
            this.cacheStrategy(null);
            this.cacheAddress(null);
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

    /**
     * Get the appropriate signer based on the current wallet strategy
     * Returns either window.arweaveWallet for native Arweave wallets,
     * MetaMask AO signer for MetaMask (compatible with arbundles),
     * or WAuth signer for OAuth-based connections
     */
    public async getSigner(): Promise<any> {
        if (!this.currentStrategy) {
            return null;
        }

        // Check if it's an Arweave native wallet
        if (this.currentStrategy.id === 'arweave-native') {
            return typeof window !== 'undefined' ? window.arweaveWallet : null;
        }

        // Check if it's an Ethereum wallet (MetaMask or other Ethereum wallets)
        if (this.currentStrategy.id === 'metamask' || this.isEthereumWallet()) {
            // For Ethereum wallets, use the specific signer pattern
            if (typeof window !== 'undefined' && window.ethereum) {
                const provider = new BrowserProvider(window.ethereum!);
                await provider.getSigner(); // Ensure signer is available
                return createBrowserEthereumDataItemSigner(provider);
            }
            return null;
        }

        // For WAuth strategies, return the AO signer
        return this.getAoSigner();
    }

    /**
     * Check if current strategy is WAuth-based
     */
    public isWAuthStrategy(): boolean {
        return this.currentStrategy?.id.startsWith('wauth-') || false;
    }

    /**
     * Check if current strategy is an Ethereum wallet
     */
    public isEthereumWallet(): boolean {
        return this.currentStrategy?.id === 'metamask' || 
               this.currentStrategy?.description?.toLowerCase().includes('ethereum') ||
               false;
    }

    /**
     * Check if current strategy is Arweave native wallet
     */
    public isArweaveNativeStrategy(): boolean {
        return this.currentStrategy?.id === 'arweave-native';
    }

    /**
     * Check if current strategy is MetaMask
     */
    public isMetaMaskStrategy(): boolean {
        return this.currentStrategy?.id === 'metamask';
    }

    /**
     * Auto-reconnect to the cached wallet strategy
     * Should be called on app initialization
     */
    public async autoReconnect(): Promise<boolean> {
        const cachedStrategyId = localStorage.getItem(this.STRATEGY_CACHE_KEY);
        const cachedAddress = this.getCachedAddress();

        if (!cachedStrategyId || !cachedAddress) {
            console.log('No cached wallet found');
            return false;
        }

        try {
            console.log('Attempting to reconnect to:', cachedStrategyId);
            
            // Set the strategy
            const success = this.setStrategy(cachedStrategyId);
            if (!success) {
                throw new Error('Failed to set cached strategy');
            }

            // Try to reconnect
            if (this.currentStrategy?.reconnect) {
                await this.currentStrategy.reconnect();
            } else {
                // For strategies without reconnect, try regular connect
                await this.connect();
            }

            console.log('Auto-reconnect successful');
            return true;
        } catch (error) {
            console.warn('Auto-reconnect failed:', error);
            // Clear cache if reconnect fails
            this.cacheStrategy(null);
            this.cacheAddress(null);
            return false;
        }
    }
}

// Global wallet manager instance
export const walletManager = new WalletManager();
