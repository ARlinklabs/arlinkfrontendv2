import { WalletStrategy, WalletConnectionState } from './types';
import { WAuthStrategy, WAuthProviders } from './wauth';
import { ArweaveWalletStrategy } from './arweave';
import { MetaMaskWalletStrategy } from './metamask';

/**
 * Wallet Manager
 * 
 * Manages wallet strategies and connection state.
 * 
 * Debug Mode:
 * To enable verbose logging for debugging wallet connection issues, run this in the browser console:
 *   localStorage.setItem('WALLET_DEBUG', 'true')
 * 
 * To disable debug mode:
 *   localStorage.removeItem('WALLET_DEBUG')
 * 
 * Note: WAuth strategies are lazy-loaded to reduce initialization spam.
 * They are only created when needed (on selection or when listing all strategies).
 */
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
    private readonly DEBUG = import.meta.env.DEV && localStorage.getItem('WALLET_DEBUG') === 'true';

    constructor() {
        this.initializeStrategies();
        this.loadCachedStrategy();
    }

    private log(...args: any[]) {
        if (this.DEBUG) {
            console.log('[WalletManager]', ...args);
        }
    }

    private initializeStrategies() {
        // Initialize non-WAuth strategies immediately (they don't spam logs)
        const arweaveStrategy = new ArweaveWalletStrategy();
        this.strategies.set(arweaveStrategy.id, arweaveStrategy);

        const metamaskStrategy = new MetaMaskWalletStrategy();
        this.strategies.set(metamaskStrategy.id, metamaskStrategy);

        // WAuth strategies will be lazy-loaded when needed
        // This prevents creating 4 WAuth SDK instances that all log initialization
    }

    /**
     * Lazy-load a WAuth strategy when needed
     */
    private getOrCreateWAuthStrategy(provider: WAuthProviders): WalletStrategy {
        const strategyId = `wauth-${provider}`;
        
        if (!this.strategies.has(strategyId)) {
            this.log('Creating WAuth strategy:', provider);
            const strategy = new WAuthStrategy({ provider });
            this.strategies.set(strategyId, strategy);
        }
        
        return this.strategies.get(strategyId)!;
    }

    private loadCachedStrategy() {
        try {
            const cachedStrategyId = localStorage.getItem(this.STRATEGY_CACHE_KEY);
            if (cachedStrategyId) {
                // Lazy-load WAuth strategies if needed
                if (cachedStrategyId.startsWith('wauth-')) {
                    const provider = cachedStrategyId.replace('wauth-', '') as WAuthProviders;
                    const strategy = this.getOrCreateWAuthStrategy(provider);
                    this.currentStrategy = strategy;
                    this.updateState({ strategy });
                } else {
                    const strategy = this.strategies.get(cachedStrategyId);
                    if (strategy) {
                        this.currentStrategy = strategy;
                        this.updateState({ strategy });
                    }
                }
                this.log('Loaded cached wallet strategy:', cachedStrategyId);
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
        // Ensure all WAuth strategies are available (lazy-load them)
        const wauthProviders = [
            WAuthProviders.Github,
            WAuthProviders.Google,
            WAuthProviders.Discord,
            WAuthProviders.X
        ];
        
        wauthProviders.forEach(provider => {
            this.getOrCreateWAuthStrategy(provider);
        });
        
        return Array.from(this.strategies.values());
    }

    public getCurrentStrategy(): WalletStrategy | null {
        return this.currentStrategy;
    }

    public setStrategy(strategyId: string): boolean {
        let strategy: WalletStrategy | undefined;
        
        // Lazy-load WAuth strategies if needed
        if (strategyId.startsWith('wauth-')) {
            const provider = strategyId.replace('wauth-', '') as WAuthProviders;
            strategy = this.getOrCreateWAuthStrategy(provider);
        } else {
            strategy = this.strategies.get(strategyId);
        }
        
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

        this.log('🔌 Starting connection with strategy:', this.currentStrategy.id);

        try {
            await this.currentStrategy.connect(permissions);
            this.log('✅ Strategy connect() completed');
            
            const address = await this.currentStrategy.getActiveAddress();
            this.log('✅ Got address:', address);
            
            const publicKey = await this.currentStrategy.getActivePublicKey();
            this.log('✅ Got public key:', publicKey);
            
            const walletPermissions = await this.currentStrategy.getPermissions();
            this.log('✅ Got permissions:', walletPermissions);

            this.log('📝 Updating state with:', {
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

            this.log('💾 State updated, current state:', this.getState());

            // Cache the strategy and address on successful connection
            this.cacheStrategy(this.currentStrategy.id);
            this.cacheAddress(address);
            
            this.log('🎉 Connection complete!');
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
        if (!this.currentStrategy) {
            return null;
        }

        try {
            return await this.currentStrategy.getActivePublicKey();
        } catch (error) {
            console.error('Failed to get active public key:', error);
            return null;
        }
    }

    public async signMessage(message: Uint8Array): Promise<Uint8Array> {
        if (!this.currentStrategy?.signMessage) {
            throw new Error('signMessage not supported by current wallet strategy');
        }
        return await this.currentStrategy.signMessage(message);
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

        try {
            return this.currentStrategy.getEmail();
        } catch (error) {
            // User not logged in yet
            return null;
        }
    }

    public getUsername(): string | null {
        if (!this.currentStrategy || !this.currentStrategy.getUsername) {
            return null;
        }

        try {
            return this.currentStrategy.getUsername();
        } catch (error) {
            // User not logged in yet
            return null;
        }
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

        try {
            return await this.currentStrategy.getConnectedWallets();
        } catch (error) {
            // User not logged in yet
            return [];
        }
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
     * 
     * Returns different types of signers depending on the wallet:
     * - Native Arweave wallet: Returns window.arweaveWallet (object) - needs to be wrapped with createDataItemSigner
     * - MetaMask: Returns getAoSigner() (function) - already AO-compatible, use directly
     * - WAuth: Returns getAoSigner() (function) - already AO-compatible, use directly
     * 
     * IMPORTANT: When using this signer with AO operations, use prepareAoSigner() from ao-vars.ts
     * which automatically handles the wrapping logic based on signer type.
     */
    public async getSigner(): Promise<any> {
        if (!this.currentStrategy) {
            return null;
        }

        // Check if it's an Arweave native wallet
        if (this.currentStrategy.id === 'arweave-native') {
            return typeof window !== 'undefined' ? window.arweaveWallet : null;
        }

        // For all other strategies (MetaMask, WAuth), use their getAoSigner method
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
     * 
     * Note: WAuth strategies auto-reconnect on their own during initialization.
     * This method handles syncing our state with their auto-reconnection.
     */
    public async autoReconnect(): Promise<boolean> {
        const cachedStrategyId = localStorage.getItem(this.STRATEGY_CACHE_KEY);
        const cachedAddress = this.getCachedAddress();

        if (!cachedStrategyId || !cachedAddress) {
            this.log('No cached wallet found');
            return false;
        }

        try {
            this.log('Attempting to reconnect to:', cachedStrategyId);
            
            // Set the strategy first
            const success = this.setStrategy(cachedStrategyId);
            if (!success) {
                throw new Error('Failed to set cached strategy');
            }

            // For WAuth strategies, they auto-reconnect during initialization
            // We just need to wait a bit and sync our state
            if (cachedStrategyId.startsWith('wauth-')) {
                this.log('WAuth strategy detected - waiting for auto-reconnection...');
                
                // Give WAuth time to complete its auto-reconnect
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check if WAuth successfully reconnected by checking the address
                try {
                    const address = await this.currentStrategy?.getActiveAddress();
                    if (address) {
                        this.log('WAuth auto-reconnect detected, syncing state');
                        
                        // Update our internal state to match
                        const publicKey = await this.currentStrategy?.getActivePublicKey();
                        const permissions = await this.currentStrategy?.getPermissions();
                        
                        this.updateState({
                            connected: true,
                            address,
                            publicKey,
                            permissions: permissions || [],
                            strategy: this.currentStrategy
                        });
                        
                        this.log('WAuth auto-reconnect successful');
                        return true;
                    }
                } catch (e) {
                    this.log('WAuth auto-reconnect not completed, will try manual reconnect');
                }
            }

            // Try to reconnect for non-WAuth or if WAuth auto-reconnect didn't work
            if (this.currentStrategy?.reconnect) {
                await this.currentStrategy.reconnect();
            } else {
                // For strategies without reconnect, try regular connect
                await this.connect();
            }

            this.log('Auto-reconnect successful');
            return true;
        } catch (error) {
            console.warn('Auto-reconnect failed:', error);
            // Don't clear cache immediately - WAuth might still be connecting
            // The wallet will auto-disconnect if connection truly failed
            return false;
        }
    }
}

// Global wallet manager instance
export const walletManager = new WalletManager();
