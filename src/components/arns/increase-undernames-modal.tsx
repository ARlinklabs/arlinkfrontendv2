import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { getpriceinfo, IncreaseUndername } from "@/actions/arns/arnslater";
import { useAddress } from "ao-wallet-kit";
import { toast } from "@/components/ui/use-toast";
import { Minus, Plus } from "lucide-react";

interface IncreaseUndernamesModalProps {
    isOpen: boolean;
    onClose: () => void;
    arnsName: string;
    onSuccess: () => void;
}

export function IncreaseUndernamesModal({
    isOpen,
    onClose,
    arnsName,
    onSuccess
}: IncreaseUndernamesModalProps) {
    const activeAddress = useAddress();
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [priceInfo, setPriceInfo] = useState<{
        priceario: number;
    } | null>(null);

    useEffect(() => {
        if (isOpen && activeAddress) {
            fetchPrice();
        }
    }, [isOpen, quantity, activeAddress]);

    const fetchPrice = async () => {
        try {
            const price = await getpriceinfo(arnsName, quantity, activeAddress!);
            setPriceInfo(price);
        } catch (error) {
            console.error("Error fetching price:", error);
            toast({
                title: "Error",
                description: "Failed to fetch price information",
                variant: "destructive",
            });
        }
    };

    const handleQuantityChange = (value: number) => {
        if (value >= 1) {
            setQuantity(value);
        }
    };

    const handleIncrement = () => {
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!activeAddress) {
            toast({
                title: "Error",
                description: "Please connect your wallet first",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);
            const result = await IncreaseUndername(arnsName, quantity);
            
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Undername limit increased successfully",
                });
                onSuccess();
                onClose();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to increase undername limit",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error increasing undername limit:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Increase Undernames Limit</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleDecrement}
                            disabled={quantity <= 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                            className="w-24 text-center mx-4"
                            min={1}
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleIncrement}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {priceInfo && (
                        <div className="text-center mb-6">
                            <p className="text-sm text-neutral-400 mb-2">Estimated Cost</p>
                            <p className="text-lg font-medium">{priceInfo.priceario.toFixed(2)} ARIO</p>
                        </div>
                    )}

                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={isLoading || !priceInfo || !activeAddress}
                    >
                        {isLoading ? "Processing..." : "Increase Limit"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 