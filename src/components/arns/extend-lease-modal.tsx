import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { getArNSPrice, buyArNS } from "@/actions/arns/arnslater";
import { useActiveAddress } from "arweave-wallet-kit";
import { toast } from "@/components/ui/use-toast";
import { Minus, Plus, Calendar } from "lucide-react";

interface ExtendLeaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    arnsName: string;
    currentExpiry: number;
    onSuccess: () => void;
}

export function ExtendLeaseModal({
    isOpen,
    onClose,
    arnsName,
    currentExpiry,
    onSuccess
}: ExtendLeaseModalProps) {
    const activeAddress = useActiveAddress();
    const [years, setYears] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [priceInfo, setPriceInfo] = useState<{
        lease: { priceInArio: number };
        permabuy: { priceInArio: number };
    } | null>(null);
    const [purchaseType, setPurchaseType] = useState<"lease" | "permabuy">("lease");

    useEffect(() => {
        if (isOpen && activeAddress) {
            fetchPrice();
        }
    }, [isOpen, years, purchaseType, activeAddress]);

    const fetchPrice = async () => {
        try {
            const price = await getArNSPrice(arnsName);
            if (price.success) {
                setPriceInfo(price);
            } else {
                throw new Error(price.error);
            }
        } catch (error) {
            console.error("Error fetching price:", error);
            toast({
                title: "Error",
                description: "Failed to fetch price information",
                variant: "destructive",
            });
        }
    };

    const handleYearsChange = (value: number) => {
        if (value >= 1) {
            setYears(value);
        }
    };

    const handleIncrement = () => {
        setYears(prev => prev + 1);
    };

    const handleDecrement = () => {
        if (years > 1) {
            setYears(prev => prev - 1);
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
            const result = await buyArNS(arnsName, purchaseType, years);
            
            if (result.success) {
                toast({
                    title: "Success",
                    description: `Successfully ${purchaseType === "lease" ? "extended lease" : "purchased"} ${arnsName}`,
                });
                onSuccess();
                onClose();
            } else {
                toast({
                    title: "Error",
                    description: result.error || `Failed to ${purchaseType === "lease" ? "extend lease" : "purchase"}`,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error processing transaction:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Extend Lease</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {/* Current Expiry Date */}
                    <div className="mb-6 p-4 bg-neutral-900 rounded-lg">
                        <div className="flex items-center gap-2 text-neutral-400 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span>Current Expiry Date</span>
                        </div>
                        <p className="text-lg font-medium">{formatDate(currentExpiry)}</p>
                    </div>

                    {/* Purchase Type Selection */}
                    <div className="mb-6">
                        <select
                            value={purchaseType}
                            onChange={(e) => setPurchaseType(e.target.value as "lease" | "permabuy")}
                            className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded-md"
                        >
                            <option value="lease">Extend Lease</option>
                            <option value="permabuy">Permabuy</option>
                        </select>
                    </div>

                    {/* Years Selection */}
                    {purchaseType === "lease" && (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-4">Select Years</h3>
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleDecrement}
                                    disabled={years <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                    type="number"
                                    value={years}
                                    onChange={(e) => handleYearsChange(parseInt(e.target.value) || 1)}
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
                        </div>
                    )}

                    {/* Price Display */}
                    {priceInfo && (
                        <div className="text-center mb-6 p-4 bg-neutral-900 rounded-lg">
                            <p className="text-sm text-neutral-400 mb-2">Estimated Cost</p>
                            <p className="text-2xl font-medium">
                                {purchaseType === "lease" 
                                    ? Number(priceInfo.lease.priceInArio).toFixed(2)
                                    : Number(priceInfo.permabuy.priceInArio).toFixed(2)} ARIO
                            </p>
                        </div>
                    )}

                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={isLoading || !priceInfo || !activeAddress}
                    >
                        {isLoading ? "Processing..." : purchaseType === "lease" ? "Extend Lease" : "Permabuy"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 