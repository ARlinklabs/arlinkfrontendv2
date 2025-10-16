import { useConnection, useActiveAddress, useProfileModal } from "@/lib/wallet-strategies";
import { useGlobalState } from "@/store/useGlobalState";
import { useEffect, useRef } from "react";
/**
 * Custom hook that provides consistent wallet state across the entire application.
 * This ensures that all components use the same logic to determine wallet connection status.
 * 
 * A wallet is considered "truly connected" when:
 * 1. The wallet kit reports connected=true
 * 2. There's a valid wallet address available (from kit or global state)
 * 
 * This hook also handles reconnection scenarios where we have an address but 
 * the wallet kit reports as disconnected.
 * 
 * Note: fixConnection is handled centrally in App.tsx to prevent conflicts.
 */
export function useWalletState() {
    const { connected, connect, disconnect } = useConnection();
    const kitAddress = useActiveAddress();
    const profileModal = useProfileModal();
    const reconnectAttemptedRef = useRef(false);

    // Store function references in refs to prevent infinite loops
    const connectRef = useRef(connect);
    const disconnectRef = useRef(disconnect);
    const profileModalRef = useRef(profileModal);
    
    // Keep refs updated
    useEffect(() => {
        connectRef.current = connect;
        disconnectRef.current = disconnect;
        profileModalRef.current = profileModal;
    }, [connect, disconnect, profileModal]);

    // Use global state as the source of truth for wallet address
    const walletAddress = useGlobalState(state => state.walletAddress);
    
    // Use the most reliable address source
    const address = kitAddress || walletAddress;
    
    // Handle inconsistent wallet state - only reconnect if we have no address at all
    useEffect(() => {
        // Reset reconnect flag when connection state changes
        if (connected) {
            reconnectAttemptedRef.current = false;
        }
        
        // If wallet is already connected with an active address, close the profile modal
        // This prevents the modal from opening repeatedly on page refresh
        if ((kitAddress || walletAddress) && connected) {
            profileModalRef.current.setOpen(false);
        }
        
        // Log current wallet state for debugging
        // console.log('useWalletState: Current state check -', {
        //     connected,
        //     kitAddress,
        //     walletAddress,
        //     hasAnyAddress: !!(kitAddress || walletAddress)
        // });
        
        // Only attempt reconnection if:
        // 1. We have NO address at all (neither kit nor global state)
        // 2. Wallet kit says not connected
        // 3. We haven't already tried reconnecting
        if (!kitAddress && !walletAddress && !connected && !reconnectAttemptedRef.current) {
            // console.log('useWalletState: No active wallet address found, attempting connection...');
            reconnectAttemptedRef.current = true;
            
            // Try to connect
            connectRef.current().then(() => {
                // console.log('useWalletState: Wallet connection successful');
            }).catch((_error) => {
                // console.warn('useWalletState: Wallet connection failed:', _error.message);
                reconnectAttemptedRef.current = false;
            });
        } else if (kitAddress || walletAddress) {
            // console.log('useWalletState: Active wallet address found:', kitAddress || walletAddress);
        }
        
        // If we're connected but have no address, something is wrong - disconnect
        if (connected && !address) {
            // console.warn('useWalletState: Connected but no address available, disconnecting...');
            disconnectRef.current().catch(console.error);
        }
    }, [kitAddress, walletAddress, connected, address]);
    
    // A wallet is truly connected when we have ANY valid address
    // This covers both traditional wallet connections and OAuth/WAUTH scenarios
    const isConnected = !!address;
    
    // Debug logging for isConnected state
    // useEffect(() => {
    //     console.log('useWalletState: State update -', { 
    //         connected, 
    //         kitAddress, 
    //         walletAddress, 
    //         address, 
    //         isConnected,
    //         addressExists: !!address
    //     });
    // }, [connected, kitAddress, walletAddress, address, isConnected]);
    
    return {
        isConnected,
        connected: isConnected, // Alias for backward compatibility
        address,
        walletAddress,
        kitConnected: connected, // Raw connection state from kit
        kitAddress,
        connect,
        disconnect,
        profileModal
    };
}
