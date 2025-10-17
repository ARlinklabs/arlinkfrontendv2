# MetaMask Integration Guide

This guide explains how to use the MetaMask connector and signer in the Arlink application.

## Overview

The MetaMask integration allows users to connect their MetaMask wallet and sign Arweave data items using Ethereum signatures. It follows the same pattern as the Arweave native wallet integration, making it easy to switch between different wallet types.

## Features

- ✅ MetaMask wallet connection
- ✅ Account management
- ✅ Sign Arweave data items with Ethereum signatures
- ✅ Sign ANS-104 bundles
- ✅ Network switching
- ✅ Event listeners for account/network changes
- ✅ Full viem integration
- ✅ Compatible with existing wallet strategy system

## Installation

The required dependencies are already included:
- `viem` - Ethereum library for wallet operations
- `@dha-team/arbundles` - For creating Arweave-compatible data items

## Basic Usage

### 1. Simple Connection

```typescript
import { connectMetaMask } from '@/lib/wallet-strategies';

async function handleConnect() {
  try {
    const { address, strategy } = await connectMetaMask();
    console.log('Connected to MetaMask:', address);
  } catch (error) {
    console.error('Failed to connect:', error);
  }
}
```

### 2. Using React Hooks

```typescript
import { useConnection, useActiveAddress, isMetaMaskWallet } from '@/lib/wallet-strategies';

function MyComponent() {
  const { connected, connect, disconnect } = useConnection();
  const address = useActiveAddress();
  
  const handleConnect = async () => {
    // First, set the wallet manager to use MetaMask
    walletManager.setStrategy('metamask');
    // Then connect
    await connect();
  };
  
  return (
    <div>
      {connected ? (
        <>
          <p>Connected: {address}</p>
          {isMetaMaskWallet() && <p>Using MetaMask</p>}
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={handleConnect}>Connect MetaMask</button>
      )}
    </div>
  );
}
```

### 3. Signing Data Items

```typescript
import { walletManager } from '@/lib/wallet-strategies';

async function signDataItem() {
  // Make sure MetaMask is connected
  const signer = walletManager.getSigner();
  
  if (!signer) {
    throw new Error('No wallet connected');
  }
  
  // Create a data item
  const dataItem = {
    data: 'Hello Arweave from MetaMask!',
    tags: [
      { name: 'Content-Type', value: 'text/plain' },
      { name: 'App-Name', value: 'Arlink' }
    ]
  };
  
  // Sign it
  const result = await walletManager.signAns104(dataItem);
  
  console.log('Signed data item:', result.id);
  console.log('Raw data:', result.raw);
  
  return result;
}
```

### 4. Using with Viem Directly

```typescript
import { getMetaMaskWalletClient } from '@/lib/wallet-strategies';

async function sendEthTransaction() {
  const walletClient = getMetaMaskWalletClient();
  
  if (!walletClient) {
    throw new Error('MetaMask not connected');
  }
  
  // Use viem's walletClient directly
  const hash = await walletClient.sendTransaction({
    to: '0x...',
    value: parseEther('0.01')
  });
  
  return hash;
}
```

## Advanced Usage

### Network Switching

```typescript
import { switchMetaMaskNetwork, getMetaMaskChainId } from '@/lib/wallet-strategies';

// Get current network
const chainId = await getMetaMaskChainId();
console.log('Current chain:', chainId);

// Switch to Polygon
await switchMetaMaskNetwork('0x89');
```

### Adding Custom Networks

```typescript
import { addMetaMaskNetwork } from '@/lib/wallet-strategies';

await addMetaMaskNetwork({
  chainId: '0x89',
  chainName: 'Polygon',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  },
  rpcUrls: ['https://polygon-rpc.com'],
  blockExplorerUrls: ['https://polygonscan.com']
});
```

### Signing Messages

```typescript
import { signMessageWithMetaMask } from '@/lib/wallet-strategies';

const address = await walletManager.getActiveAddress();
const signature = await signMessageWithMetaMask('Hello Arweave!', address);
```

## Integration with Existing Code

The MetaMask strategy integrates seamlessly with the existing wallet system:

```typescript
import { 
  walletManager, 
  getCurrentSigner, 
  isMetaMaskWallet,
  isArweaveWallet,
  isWAuthWallet 
} from '@/lib/wallet-strategies';

// Check which wallet is active
if (isMetaMaskWallet()) {
  console.log('Using MetaMask');
} else if (isArweaveWallet()) {
  console.log('Using ArConnect');
} else if (isWAuthWallet()) {
  console.log('Using OAuth wallet');
}

// Get the correct signer regardless of wallet type
const signer = getCurrentSigner();

// Use it for operations
const result = await walletManager.signAns104(dataItem);
```

## Complete React Example

```typescript
import { useState } from 'react';
import { 
  connectMetaMask, 
  isMetaMaskAvailable,
  walletManager,
  useConnection,
  useActiveAddress
} from '@/lib/wallet-strategies';

function MetaMaskConnector() {
  const { connected, connect, disconnect } = useConnection();
  const address = useActiveAddress();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if MetaMask is installed
  const metamaskInstalled = isMetaMaskAvailable();
  
  const handleConnect = async () => {
    if (!metamaskInstalled) {
      setError('Please install MetaMask');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await connectMetaMask();
      console.log('Connected:', result.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };
  
  const handleSignMessage = async () => {
    if (!connected || !address) return;
    
    try {
      const dataItem = {
        data: 'Hello from MetaMask!',
        tags: [{ name: 'Content-Type', value: 'text/plain' }]
      };
      
      const result = await walletManager.signAns104(dataItem);
      console.log('Signed:', result.id);
      alert(`Successfully signed! ID: ${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign');
    }
  };
  
  if (!metamaskInstalled) {
    return (
      <div>
        <p>MetaMask is not installed</p>
        <a 
          href="https://metamask.io" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Install MetaMask
        </a>
      </div>
    );
  }
  
  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      {connected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={handleSignMessage}>Sign Message</button>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={handleConnect} disabled={isLoading}>
          {isLoading ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      )}
    </div>
  );
}
```

## How It Works

1. **Connection**: When you connect MetaMask, it requests account access through `eth_requestAccounts`
2. **Strategy Registration**: The MetaMask strategy is registered in the wallet manager alongside Arweave and OAuth strategies
3. **Signing**: Data items are signed using `InjectedEthereumSigner` from arbundles, which creates Arweave-compatible signatures using Ethereum private keys
4. **Events**: The strategy listens for MetaMask events (account changes, network changes) and updates the wallet manager accordingly

## Error Handling

Common error codes:
- `4001`: User rejected the request
- `4902`: Chain not added to MetaMask
- `-32002`: Request already pending

```typescript
try {
  await connectMetaMask();
} catch (error: any) {
  if (error.code === 4001) {
    console.log('User rejected the connection');
  } else if (error.code === -32002) {
    console.log('Please check MetaMask - request pending');
  } else {
    console.error('Connection failed:', error);
  }
}
```

## API Reference

### Functions

- `connectMetaMask()` - Connect to MetaMask and set it as active strategy
- `isMetaMaskAvailable()` - Check if MetaMask is installed
- `getMetaMaskStrategy()` - Get the MetaMask strategy instance
- `getMetaMaskWalletClient()` - Get the viem WalletClient
- `switchMetaMaskNetwork(chainId)` - Switch to a different network
- `addMetaMaskNetwork(config)` - Add a custom network
- `getMetaMaskChainId()` - Get current chain ID
- `signMessageWithMetaMask(message, address)` - Sign a message
- `isMetaMaskWallet()` - Check if current wallet is MetaMask

### Hooks

All standard wallet hooks work with MetaMask:
- `useConnection()` - Connection state and methods
- `useActiveAddress()` - Current wallet address
- `useApi()` - Signing methods
- `useSigner()` - Get current signer
- `useWalletType()` - Get current wallet type

## Migration from Legacy Code

If you were using the old ethers-based code:

**Before:**
```typescript
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const address = await signer.getAddress();
```

**After:**
```typescript
import { connectMetaMask, walletManager } from '@/lib/wallet-strategies';

const { address } = await connectMetaMask();
const signer = walletManager.getSigner();
```

## Compatibility

- ✅ Works with all MetaMask versions
- ✅ Compatible with existing Arweave and OAuth wallet strategies
- ✅ Supports all arbundles signing operations
- ✅ Viem-based for modern Ethereum development
- ✅ TypeScript support with full type safety

## Support

For issues or questions:
1. Check that MetaMask is installed and unlocked
2. Verify that you're on a supported network
3. Check browser console for detailed error messages
4. Ensure viem and arbundles are installed

