import { useWallet, useAddress } from "ao-wallet-kit";
import { useGlobalState } from "@/store/useGlobalState";

/**
 * Custom hook that provides consistent wallet state across the application.
 * Combines ao-wallet-kit state with the global Zustand store.
 */
export function useWalletState() {
    const { connected, connect, disconnect } = useWallet();
    const kitAddress = useAddress();

    const walletAddress = useGlobalState(state => state.walletAddress);

    const address = kitAddress || walletAddress;
    const isConnected = !!address && connected;

    return {
        isConnected,
        connected: isConnected,
        address,
        walletAddress,
        kitConnected: connected,
        kitAddress,
        connect: () => connect(),
        disconnect,
    };
}
