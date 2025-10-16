// Common types for wallet strategies
export interface WalletStrategy {
    id: string;
    name: string;
    description: string;
    theme: string;
    logo: string;
    url: string;
    
    // Core wallet methods
    connect(permissions?: any[]): Promise<void>;
    disconnect(): Promise<void>;
    getActiveAddress(): Promise<string>;
    getAllAddresses(): Promise<string[]>;
    getActivePublicKey(): Promise<string>;
    sign(transaction: any, options?: any): Promise<any>;
    getPermissions(): Promise<any[]>;
    getWalletNames(): Promise<Record<string, string>>;
    isAvailable(): Promise<boolean>;
    
    // Optional methods
    encrypt?(data: BufferSource, options: any): Promise<Uint8Array>;
    decrypt?(data: BufferSource, options: any): Promise<Uint8Array>;
    getArweaveConfig?(): Promise<any>;
    dispatch?(transaction: any): Promise<any>;
    signDataItem?(dataItem: any): Promise<ArrayBuffer>;
    signature?(data: Uint8Array, algorithm: any): Promise<Uint8Array>;
    signAns104?(dataItem: any): Promise<{ id: string, raw: ArrayBuffer }>;
    
    // Event handling
    addAddressEvent?(listener: (address: string) => void): any;
    removeAddressEvent?(listener: any): void;
    
    // WAuth specific methods
    getEmail?(): { email: string, verified: boolean };
    getUsername?(): string | null;
    addConnectedWallet?(wallet: any): Promise<any>;
    removeConnectedWallet?(walletId: string): Promise<any>;
    getConnectedWallets?(): Promise<any[]>;
    getAuthData?(): any;
    onAuthDataChange?(callback: (data: any) => void): void;
    reconnect?(): Promise<any>;
    getAoSigner?(): any;
}

export interface WalletConnectionState {
    connected: boolean;
    address: string | null;
    publicKey: string | null;
    permissions: any[];
    strategy: WalletStrategy | null;
}

export interface WalletHookReturn {
    connected: boolean;
    address: string | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    strategy: WalletStrategy | null;
    isLoading: boolean;
    error: string | null;
}
