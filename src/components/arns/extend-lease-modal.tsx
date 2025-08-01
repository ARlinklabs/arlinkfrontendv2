import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getArNSRecordInfo, extendLease, checkBalance } from "@/actions/arns/arnslater";
import { getIncreaseLeaseCost } from "@/actions/arns/arnsutils";
import { useActiveAddress } from "@arweave-wallet-kit/react";
import { toast } from "@/components/ui/use-toast";
import { Minus, Plus, Calendar, AlertTriangle, ExternalLink } from "lucide-react";
import { InsufficientBalanceModal } from "./insufficient-balance-modal";

interface ExtendLeaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    arnsName: string;
    onSuccess: () => void;
}

interface LeaseInfo {
    processId: string;
    endTimestamp: number;
    startTimestamp: number;
    type: string;
    undernameLimit: number;
}

interface CostInfo {
    rawTokenCost: number;
    tokenCost6Decimals: string;
    fundingInfo: {
        shortfall: number;
        balance: number;
    };
}

export function ExtendLeaseModal({
    isOpen,
    onClose,
    arnsName,
    onSuccess
}: ExtendLeaseModalProps) {
    const activeAddress = useActiveAddress();
    const [years, setYears] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [leaseInfo, setLeaseInfo] = useState<LeaseInfo | null>(null);
    const [costInfo, setCostInfo] = useState<CostInfo | null>(null);
    const [userBalance, setUserBalance] = useState<number>(0);
    const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
    const [loadingLeaseInfo, setLoadingLeaseInfo] = useState(false);
    const [loadingCost, setLoadingCost] = useState(false);

    // Fetch current lease information when modal opens
    useEffect(() => {
        if (isOpen && arnsName) {
            fetchLeaseInfo();
        }
    }, [isOpen, arnsName]);

    // Fetch cost information when years change
    useEffect(() => {
        if (isOpen && arnsName && activeAddress && years > 0) {
            fetchCostInfo();
        }
    }, [isOpen, arnsName, activeAddress, years]);

    // Fetch user balance when modal opens
    useEffect(() => {
        if (isOpen && activeAddress) {
            fetchUserBalance();
        }
    }, [isOpen, activeAddress]);

    const fetchLeaseInfo = async () => {
        setLoadingLeaseInfo(true);
        try {
            const recordInfo = await getArNSRecordInfo(arnsName);
            if (recordInfo) {
                setLeaseInfo({
                    processId: recordInfo.processId,
                    endTimestamp: recordInfo.endTimestamp,
                    startTimestamp: recordInfo.startTimestamp,
                    type: recordInfo.type,
                    undernameLimit: recordInfo.undernameLimit,
                });
            } else {
                toast({
                    title: "Error",
                    description: "Could not fetch lease information",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error fetching lease info:", error);
            toast({
                title: "Error",
                description: "Failed to fetch lease information",
                variant: "destructive",
            });
        } finally {
            setLoadingLeaseInfo(false);
        }
    };

    const fetchCostInfo = async () => {
        if (!activeAddress) return;
        
        setLoadingCost(true);
        try {
            const cost = await getIncreaseLeaseCost(arnsName, years, activeAddress);
            setCostInfo(cost);
        } catch (error) {
            console.error("Error fetching cost info:", error);
            toast({
                title: "Error",
                description: "Failed to fetch cost information",
                variant: "destructive",
            });
        } finally {
            setLoadingCost(false);
        }
    };

    const fetchUserBalance = async () => {
        if (!activeAddress) return;
        
        try {
            const balance = await checkBalance(activeAddress);
            setUserBalance(parseFloat(balance.decimalBalance));
        } catch (error) {
            console.error("Error fetching user balance:", error);
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

    const handleBuyTokens = () => {
        window.open("https://botega.arweave.net/#/swap?from=xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10&to=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE", "_blank");
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

        if (!costInfo) {
            toast({
                title: "Error",
                description: "Cost information not available",
                variant: "destructive",
            });
            return;
        }

        // Check if user has sufficient balance
        if (userBalance < parseFloat(costInfo.tokenCost6Decimals)) {
            setShowInsufficientBalance(true);
            return;
        }

        try {
            setIsLoading(true);
            const transactionId = await extendLease(arnsName, years);
            
            toast({
                title: "Success",
                description: `Successfully extended lease for ${arnsName} by ${years} year${years > 1 ? 's' : ''}`,
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error extending lease:", error);
            toast({
                title: "Error",
                description: "Failed to extend lease. Please try again.",
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

    const calculateNewExpiry = () => {
        if (!leaseInfo) return null;
        const currentEnd = new Date(leaseInfo.endTimestamp);
        const newEnd = new Date(currentEnd);
        newEnd.setFullYear(newEnd.getFullYear() + years);
        return newEnd;
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[600px] bg-neutral-950 border border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-neutral-100">Extend Lease</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Extend the lease duration for your ArNS domain
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-6">
                        {/* Current Lease Information */}
                        {loadingLeaseInfo ? (
                            <div className="p-4 bg-neutral-900/50 rounded-lg">
                                <div className="animate-pulse space-y-2">
                                    <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
                                    <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        ) : leaseInfo ? (
                            <div className="p-4 bg-neutral-900/50 rounded-lg space-y-3">
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <Calendar className="w-4 h-4" />
                                    <span>Current Lease Information</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-neutral-400">Current Expiry:</span>
                                        <p className="text-white font-medium">{formatDate(leaseInfo.endTimestamp)}</p>
                                    </div>
                                    <div>
                                        <span className="text-neutral-400">Lease Duration:</span>
                                        <p className="text-white font-medium">
                                            {Math.round((leaseInfo.endTimestamp - leaseInfo.startTimestamp) / (1000 * 60 * 60 * 24 * 365))} years
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                                <div className="flex items-center gap-2 text-red-400">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Could not load lease information</span>
                                </div>
                            </div>
                        )}

                        {/* Extension Duration Selection */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-neutral-100">Select Extension Duration</h3>
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleDecrement}
                                    disabled={years <= 1}
                                    className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <div className="text-center">
                                    <span className="text-2xl font-bold text-white">{years}</span>
                                    <p className="text-sm text-neutral-400">year{years > 1 ? 's' : ''}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleIncrement}
                                    className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* New Expiry Preview */}
                        {leaseInfo && (
                            <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-400 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>New Expiry Date</span>
                                </div>
                                <p className="text-white font-medium">
                                    {formatDate(calculateNewExpiry()?.getTime() || 0)}
                                </p>
                            </div>
                        )}

                        {/* Cost Information */}
                        {loadingCost ? (
                            <div className="p-4 bg-neutral-900/50 rounded-lg">
                                <div className="animate-pulse space-y-2">
                                    <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
                                    <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
                                </div>
                            </div>
                        ) : costInfo ? (
                            <div className="p-4 bg-neutral-900/50 rounded-lg space-y-3">
                                <div className="text-center">
                                    <p className="text-sm text-neutral-400 mb-1">Estimated Cost</p>
                                    <p className="text-2xl font-bold text-white">
                                        {parseFloat(costInfo.tokenCost6Decimals).toFixed(2)} ARIO
                                    </p>
                                </div>
                                
                                {/* Balance Check */}
                                <div className="border-t border-neutral-800 pt-3 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">Your Balance:</span>
                                        <span className="text-white">{userBalance.toFixed(2)} ARIO</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">Required:</span>
                                        <span className="text-white">{parseFloat(costInfo.tokenCost6Decimals).toFixed(2)} ARIO</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t border-neutral-800 pt-2">
                                        <span className="text-neutral-400">Remaining:</span>
                                        <span className={`font-medium ${userBalance >= parseFloat(costInfo.tokenCost6Decimals) ? 'text-green-400' : 'text-red-400'}`}>
                                            {(userBalance - parseFloat(costInfo.tokenCost6Decimals)).toFixed(2)} ARIO
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-neutral-900/50 rounded-lg text-center text-neutral-400">
                                Cost information not available
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <Button
                                className="w-full font-semibold glow-btn"
                                onClick={handleSubmit}
                                disabled={isLoading || !costInfo || !leaseInfo || userBalance < (costInfo ? parseFloat(costInfo.tokenCost6Decimals) : 0)}
                            >
                                {isLoading ? "Processing..." : `Extend Lease by ${years} Year${years > 1 ? 's' : ''}`}
                            </Button>
                            
                            {costInfo && userBalance < parseFloat(costInfo.tokenCost6Decimals) && (
                                <Button
                                    variant="outline"
                                    onClick={handleBuyTokens}
                                    className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Buy ARIO Tokens
                                </Button>
                            )}
                            
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Insufficient Balance Modal */}
            {costInfo && (
                <InsufficientBalanceModal
                    isOpen={showInsufficientBalance}
                    onClose={() => setShowInsufficientBalance(false)}
                    requiredAmount={parseFloat(costInfo.tokenCost6Decimals)}
                    currentBalance={userBalance}
                />
            )}
        </>
    );
} 