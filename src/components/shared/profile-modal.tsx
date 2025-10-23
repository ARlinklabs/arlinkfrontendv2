import { Copy, LogOut, User, Wallet, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ProfileModalProps {
    address: string;
    avatarUrl?: string;
    userEmail?: string | null;
    isWAuth?: boolean;
    onDisconnect: () => Promise<void> | void;
    disconnecting?: boolean;
    triggerClassName?: string;
}

export default function ProfileModal({
    address,
    avatarUrl,
    userEmail,
    isWAuth = false,
    onDisconnect,
    disconnecting = false,
    triggerClassName = "bg-white text-black pr-2 flex items-center font-semibold px-1 gap-2 py-1 rounded-md"
}: ProfileModalProps) {
    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            toast("Address copied to clipboard");
        }
    };

    const truncatedAddress = `${address?.slice(0, 5)}...${address?.slice(address.length - 5, address.length - 1)}`;
    
    // For wauth, show email on button. For others, show truncated address
    const buttonDisplayText = isWAuth && userEmail ? userEmail : truncatedAddress;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className={triggerClassName}>
                    <div className="bg-[#151516] size-8 flex items-center justify-center text-white rounded-md overflow-hidden relative">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Profile"
                                className="absolute h-full w-full object-cover"
                            />
                        ) : (
                            <User className="size-4" />
                        )}
                    </div>
                    <span>{buttonDisplayText}</span>
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-[400px] bg-[#09090b] border-neutral-800 border text-white">
                <div className="text-lg font-semibold">
                    Profile
                </div>

                <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="size-32 overflow-hidden border-2 border-neutral-800 rounded-full bg-gradient-to-b from-[#18171c] relative to-black flex items-center justify-center">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Profile"
                                className="absolute h-full w-full object-cover"
                            />
                        ) : (
                            <User className="size-12" />
                        )}
                    </div>
                    {userEmail && (
                        <div className="flex items-center gap-2 text-gray-400">
                            <Mail className="size-4" />
                            <span className="text-sm">{userEmail}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    
                    <div className="flex items-center justify-between bg-[#18171c] rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-md flex items-center justify-center border border-[#302e36]">
                                <Wallet />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-400">
                                    Wallet Address
                                </span>
                                <span className="font-medium">{truncatedAddress}</span>
                            </div>
                        </div>
                        <button
                            onClick={copyAddress}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <Copy className="size-5" />
                        </button>
                    </div>

                    <button
                        onClick={onDisconnect}
                        className="flex items-center justify-center gap-2 w-full bg-transparent hover:bg-[#302e36] transition-colors rounded-lg py-2 border border-[#302e36]"
                    >
                        <LogOut className="size-5" />
                        <span className="font-medium">
                            {disconnecting ? "Disconnecting..." : "Disconnect"}
                        </span>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

