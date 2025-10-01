import { useCallback, useEffect, useRef, useState } from "react";
import getWalletInstance from "../lib/wallet-singleton";
import {}

import { WAuth } from "@wauth/sdk";

// Global wallet state to ensure consistency across all hook instances
let globalWalletState = {
  address: undefined as string | undefined,
  connected: false,
  loading: false,
  initialized: false
};

let globalListeners: Set<() => void> = new Set();

function notifyListeners() {
  globalListeners.forEach(listener => listener());
}

function updateGlobalState(newState: Partial<typeof globalWalletState>) {
  const hasChanged = Object.keys(newState).some(key => 
    globalWalletState[key as keyof typeof globalWalletState] !== newState[key as keyof typeof globalWalletState]
  );
  
  if (hasChanged) {
    console.log('🌍 Updating global wallet state:', { ...globalWalletState, ...newState });
    globalWalletState = { ...globalWalletState, ...newState };
    notifyListeners();
  }
}

export function useWAuthWallet() {
  const [address, setAddress] = useState<string | undefined>(globalWalletState.address);
  const [connected, setConnected] = useState(globalWalletState.connected);
  const [loading, setLoading] = useState(globalWalletState.loading);
  
  const wallet = useRef<WAuth>(getWalletInstance());

  // Subscribe to global state changes
  useEffect(() => {
    const updateLocalState = () => {
      console.log('🔄 Syncing local state with global state:', globalWalletState);
      setAddress(globalWalletState.address);
      setConnected(globalWalletState.connected);
      setLoading(globalWalletState.loading);
    };
    
    globalListeners.add(updateLocalState);
    
    return () => {
      globalListeners.delete(updateLocalState);
    };
  }, []);

  // Initialize wallet connection check (only once globally)
  useEffect(() => {
    if (globalWalletState.initialized) {
      console.log('🔄 Wallet already initialized, using existing state');
      return;
    }
    
    let ignore = false;
    async function checkConnection() {
      console.log('🔍 Checking wallet connection on mount (global init)...');
      updateGlobalState({ loading: true });
      
      try {
        // First check if there's auth data
        const authData = wallet.current.getAuthData();
        console.log('📊 Auth data:', authData);
        
        // Check for address from multiple sources
        const addr = await wallet.current.getActiveAddress();
        console.log('📍 Active address:', addr);
        
        // Also check if authData contains address info
        const authDataAddress = authData?.address;
        console.log('📍 Auth data address:', authDataAddress);
        
        const finalAddress = addr || authDataAddress;
        
        if (!ignore) {
          if (finalAddress) {
            console.log('✅ Setting connected state with address:', finalAddress);
            updateGlobalState({ 
              address: finalAddress, 
              connected: true, 
              loading: false, 
              initialized: true 
            });
          } else {
            console.log('❌ No address found, setting disconnected state');
            updateGlobalState({ 
              address: undefined, 
              connected: false, 
              loading: false, 
              initialized: true 
            });
          }
        }
      } catch (error) {
        console.log('🚨 Error checking connection:', error);
        if (!ignore) {
          updateGlobalState({ 
            address: undefined, 
            connected: false, 
            loading: false, 
            initialized: true 
          });
        }
      }
    }
    
    // Add a small delay to ensure WAuth is fully initialized
    const timer = setTimeout(checkConnection, 100);
    
    return () => {
      clearTimeout(timer);
      ignore = true;
    };
  }, []);

  // Listen for auth data changes (if supported) - only set up once globally
  useEffect(() => {
    if (!globalWalletState.initialized) {
      const handler = (data: any) => {
        console.log('🔄 Auth data changed:', data);
        if (data?.address) {
          console.log('✅ Setting connected from auth data change:', data.address);
          updateGlobalState({ 
            address: data.address, 
            connected: true 
          });
        } else {
          console.log('❌ Clearing connection from auth data change');
          updateGlobalState({ 
            address: undefined, 
            connected: false 
          });
        }
      };
      wallet.current.onAuthDataChange?.(handler);
    }
  }, []);

  // Periodic check to ensure state stays in sync - only run once globally
  useEffect(() => {
    if (globalWalletState.initialized) return;
    
    const interval = setInterval(async () => {
      try {
        const authData = wallet.current.getAuthData();
        const addr = await wallet.current.getActiveAddress();
        const finalAddress = addr || authData?.address;
        
        // Only update if there's a mismatch
        if (finalAddress && !globalWalletState.connected) {
          console.log('🔄 Periodic check: Found address but not connected, fixing state:', finalAddress);
          updateGlobalState({ 
            address: finalAddress, 
            connected: true 
          });
        } else if (!finalAddress && globalWalletState.connected) {
          console.log('🔄 Periodic check: No address but connected, fixing state');
          updateGlobalState({ 
            address: undefined, 
            connected: false 
          });
        }
      } catch (error) {
        // Silent fail for periodic checks
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const connect = useCallback(async () => {
    updateGlobalState({ loading: true });
    try {
      await wallet.current.connect();
      const addr = await wallet.current.getActiveAddress();
      updateGlobalState({ 
        address: addr, 
        connected: true, 
        loading: false 
      });
    } catch (error) {
      updateGlobalState({ loading: false });
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    updateGlobalState({ loading: true });
    try {
      await wallet.current.disconnect();
      updateGlobalState({ 
        address: undefined, 
        connected: false, 
        loading: false 
      });
    } catch (error) {
      updateGlobalState({ loading: false });
      throw error;
    }
  }, []);

  return {
    address,
    connected,
    connect,
    disconnect,
    loading,
    wallet: wallet.current,
  };
}
