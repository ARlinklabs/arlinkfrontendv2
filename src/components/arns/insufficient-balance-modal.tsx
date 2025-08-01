import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle } from "lucide-react";

interface InsufficientBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiredAmount: number;
    currentBalance: number;
}

export function InsufficientBalanceModal({
    isOpen,
    onClose,
    requiredAmount,
    currentBalance
}: InsufficientBalanceModalProps) {
    const handleBuyTokens = () => {
        window.open("https://botega.arweave.net/#/swap?from=xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10&to=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE", "_blank");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-neutral-950 border border-neutral-800">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                        <DialogTitle className="text-neutral-100 text-lg">
                            Insufficient Balance
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-neutral-400 mt-2">
                        You don't have enough ARIO tokens to complete this purchase.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="bg-neutral-900/50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                            <span className="text-neutral-400">Required:</span>
                            <span className="text-white font-medium">{requiredAmount.toFixed(2)} ARIO</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-400">Current Balance:</span>
                            <span className="text-white font-medium">{currentBalance.toFixed(2)} ARIO</span>
                        </div>
                        <div className="flex justify-between border-t border-neutral-800 pt-2">
                            <span className="text-neutral-400">Shortfall:</span>
                            <span className="text-red-400 font-medium">
                                {(requiredAmount - currentBalance).toFixed(2)} ARIO
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <Button 
                            onClick={handleBuyTokens}
                            className="w-full font-semibold glow-btn"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Buy ARIO Tokens
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            className="w-full"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 