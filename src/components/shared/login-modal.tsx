import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Github, Wallet } from "lucide-react";
import { useState } from "react";
import { walletManager, isMetaMaskAvailable } from "@/lib/wallet-strategies";
import { toast } from "sonner";

interface LoginModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGithubLogin: () => Promise<void>;
    loading?: boolean;
}

export default function LoginModal({
    open,
    onOpenChange,
    onGithubLogin,
    loading = false
}: LoginModalProps) {
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleGithubLogin = async () => {
        setIsLoggingIn(true);
        try {
            // Switch to GitHub WAuth strategy before connecting
            const success = walletManager.setStrategy("wauth-github");
            if (!success) {
                throw new Error("GitHub wallet strategy not found");
            }
            
            await onGithubLogin();
            onOpenChange(false);
        } catch (error) {
            console.error("Login failed:", error);
            toast.error("GitHub login failed. Please try again.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleArweaveLogin = async () => {
        setIsLoggingIn(true);
        try {
            // Switch to Arweave strategy
            const success = walletManager.setStrategy("arweave-native");
            if (!success) {
                throw new Error("Arweave wallet strategy not found");
            }

            // Connect using the Arweave strategy
            await walletManager.connect();
            
            toast.success("Successfully connected to Arweave wallet!");
            onOpenChange(false);
        } catch (error: any) {
            console.error("Arweave login failed:", error);
            toast.error(error.message || "Failed to connect Arweave wallet. Please make sure ArConnect is installed.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleMetamaskLogin = async () => {
        console.log('🔘 MetaMask login button clicked');
        
        // Check if MetaMask is installed
        if (!isMetaMaskAvailable()) {
            console.log('❌ MetaMask not available');
            toast.error("MetaMask is not installed", {
                description: "Please install MetaMask extension to continue",
                action: {
                    label: "Install",
                    onClick: () => window.open("https://metamask.io", "_blank")
                }
            });
            return;
        }

        console.log('✅ MetaMask is available, starting connection...');
        setIsLoggingIn(true);
        
        try {
            // Switch to MetaMask strategy
            console.log('🔄 Setting MetaMask strategy...');
            const success = walletManager.setStrategy("metamask");
            if (!success) {
                throw new Error("MetaMask wallet strategy not found");
            }
            console.log('✅ MetaMask strategy set');

            // Give a small delay to ensure the UI is ready
            await new Promise(resolve => setTimeout(resolve, 100));

            // Connect using the MetaMask strategy
            console.log('🔌 Connecting to MetaMask...');
            await walletManager.connect();
            
            console.log('🎉 MetaMask connected successfully');
            toast.success("Successfully connected to MetaMask!");
            
            // Close modal after successful connection
            onOpenChange(false);
        } catch (error: any) {
            console.error("❌ MetaMask login failed:", error);
            
            // Handle specific MetaMask errors
            if (error.code === 4001) {
                toast.error("Connection rejected", {
                    description: "You rejected the connection request in MetaMask"
                });
            } else if (error.code === -32002) {
                toast.error("Connection pending", {
                    description: "Please check MetaMask - a connection request is already pending"
                });
            } else {
                toast.error(error.message || "Failed to connect MetaMask wallet");
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[420px] bg-[#09090b] border-neutral-800 border text-white">
                <div className="text-lg font-semibold mb-2">
                    Log in to Arlink
                </div>
                
                <p className="text-sm text-gray-400 mb-6">
                    Choose your preferred login method to get started
                </p>

                <div className="flex flex-col gap-3">
                    {/* GitHub Login - Large Rectangle (Recommended) */}
                    <button
                        onClick={handleGithubLogin}
                        disabled={isLoggingIn || loading}
                        className="relative flex items-center justify-between bg-gradient-to-br from-[#18171c] to-[#0f0e13] hover:from-[#1f1e24] hover:to-[#15141a] transition-all rounded-lg p-5 border border-[#302e36] group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-md flex items-center justify-center bg-[#302e36] group-hover:bg-[#3a3840] transition-colors">
                                <Github className="size-6" />
                            </div>
                            <div className="flex flex-col items-start">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-base">Continue with GitHub</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                        Recommended
                                    </span>
                                </div>
                                <span className="text-sm text-gray-400">
                                    Fast and secure authentication
                                </span>
                            </div>
                        </div>
                        <svg 
                            className="size-5 text-gray-400 group-hover:text-white transition-colors" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Divider with "OR" */}
                    <div className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-neutral-800"></div>
                        <span className="text-sm text-gray-500 font-medium">OR</span>
                        <div className="flex-1 h-px bg-neutral-800"></div>
                    </div>

                    {/* Web3 Wallets - Smaller Rectangles */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Arweave Wallet */}
                        <button
                            onClick={handleArweaveLogin}
                            disabled={isLoggingIn || loading}
                            className="flex flex-col items-center justify-center bg-[#18171c] hover:bg-[#1f1e24] transition-all rounded-lg p-4 border border-[#302e36] group disabled:opacity-50 disabled:cursor-not-allowed h-[100px]"
                        >
                            <div className="size-10 rounded-md flex items-center justify-center bg-[#302e36] group-hover:bg-[#3a3840] transition-colors mb-2">
                                {/* Arweave Logo */}
                                <svg className="size-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                                </svg>
                            </div>
                            <span className="font-medium text-sm">Arweave</span>
                            <span className="text-xs text-gray-500">ArConnect</span>
                        </button>

                        {/* MetaMask */}
                        <button
                            onClick={handleMetamaskLogin}
                            disabled={isLoggingIn || loading}
                            className="flex flex-col items-center justify-center bg-[#18171c] hover:bg-[#1f1e24] transition-all rounded-lg p-4 border border-[#302e36] group disabled:opacity-50 disabled:cursor-not-allowed h-[100px]"
                        >
                            <div className="size-10 rounded-md flex items-center justify-center bg-[#302e36] group-hover:bg-[#3a3840] transition-colors mb-2">
                                {/* MetaMask Logo */}
                                <Wallet className="size-5 text-[#f5841f]" />
                            </div>
                            <span className="font-medium text-sm">MetaMask</span>
                            <span className="text-xs text-gray-500">Ethereum</span>
                        </button>
                    </div>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                    By logging in, you agree to our Terms of Service and Privacy Policy
                </p>
            </DialogContent>
        </Dialog>
    );
}

