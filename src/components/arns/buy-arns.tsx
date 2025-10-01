import Layout from "@/layouts/layout";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from "../ui/card";
import { CardTitle } from "../ui/card-hover-effect";
import { ArnsData, DomainTupleData } from "@/types";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { ChevronLeft, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { checkArNSAvailability, getArNSPrice, buyArNS, checkBalance } from "@/actions/arns/arnslater";
import { Skeleton } from "../ui/skeleton";
import { BuyArnsSkeleton, PriceLoadingSkeleton } from "../skeletons";
import { useActiveAddress, useApi } from "@arweave-wallet-kit/react";
import { toast } from "sonner";
import { useLatestANTVersion, getTokenCost } from "@/actions/arns/arnsutils";
import { InsufficientBalanceModal } from "./insufficient-balance-modal";

interface BuyArnsProps {
    arnsName: string;
}

type AvailableArns = ArnsData & {
    permaBuy: number;
    lease: number;
};

const BuyArns = ({ arnsName }: BuyArnsProps) => {
    const address = useActiveAddress();
    const api = useApi();
    const { data: antVersion } = useLatestANTVersion();
    const [checking, setChecking] = useState<boolean>(true);
    const [error, setError] = useState<string | null>("");
    const [arns, setArns] = useState<AvailableArns | null>(null);
    const [isBuying, setIsBuying] = useState<boolean>(false);
    const [showInsufficientBalance, setShowInsufficientBalance] = useState<boolean>(false);
    const [balanceInfo, setBalanceInfo] = useState<{ required: number; current: number } | null>(null);
    const navigate = useNavigate();

    const checkingArNSAvailability = async () => {
        const { available, errorMessage, name } =
            await checkArNSAvailability(arnsName);
        if (errorMessage) {
            setError(errorMessage);
            return;
        }

        if (!available)
            return {
                available: false,
                name: null,
            };
        return {
            available,
            name,
        };
    };

    const fetchPrice = async () => {
        const value = await getArNSPrice(arnsName);
        if (value.error) {
            setChecking(false);
            return;
        }
        const { lease, permabuy } = value;
        if (!lease || !permabuy)
            return {
                lease: null,
                permabuy: null,
            };
        return {
            lease: lease.priceInArio.valueOf(),
            permabuy: permabuy.priceInArio.valueOf(),
        };
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setChecking(true);
        try {
            const arnsAvailablePromise = checkingArNSAvailability();
            const arnsAvailablePricePromise = fetchPrice();
            const [arnsAvailable, arnsAvailablePrice] = await Promise.all([
                arnsAvailablePromise,
                arnsAvailablePricePromise,
            ]);
            if (!arnsAvailable || !arnsAvailablePrice) return;
            if (!arnsAvailablePrice.permabuy && !arnsAvailablePrice.lease)
                return;
            let data: AvailableArns = {
                name: arnsAvailable.name ?? arnsName,
                available: arnsAvailable.available,
                permaBuy: arnsAvailablePrice.permabuy?.valueOf(),
                lease: arnsAvailablePrice.lease?.valueOf(),
            };
            setArns(data);
        } catch (error) {
            console.log(error);
        } finally {
            setChecking(false);
        }
    };

    const handleBuy = async (type: "lease" | "permabuy", years?: number) => {
        if (!address) {
            toast.error("Wallet not connected");
            return;
        }

        try {
            setIsBuying(true);
            
            // Calculate required amount
            let requiredAmount: number;
            if (type === "permabuy") {
                requiredAmount = arns?.permaBuy || 0;
            } else {
                // For lease, we need to get the actual token cost
                const tokenCost = await getTokenCost(arnsName, years || 1);
                requiredAmount = tokenCost.tokenCost6Decimals;
            }

            // Check user's balance
            const balanceResult = await checkBalance(address);
            const currentBalance = parseFloat(balanceResult.decimalBalance);

            // Check if user has sufficient balance
            if (currentBalance < requiredAmount) {
                setBalanceInfo({
                    required: requiredAmount,
                    current: currentBalance
                });
                setShowInsufficientBalance(true);
                return;
            }

            // Proceed with purchase if balance is sufficient
            const result = await buyArNS(
                arnsName, 
                type, 
                address, 
                years,
                api?.getAoSigner?.(),
            );
            
            if (result.success) {
                toast.success("Purchase Successful", {
                    description: `Transaction ID: ${result.transactionId}`,
                });
                setTimeout(() => {
                    navigate("/arns/dashboard");
                }, 1500);
            } else {
                toast.error("Purchase Failed", {
                    description: result.error || "Unknown error occurred",
                });
                console.log(result.error);
            }
        } catch (error) {
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Unknown error occurred",
            });
        } finally {
            setIsBuying(false);
        }
    };

    const PermanentBuyTabContent = ({ name, permaBuy, lease }: AvailableArns) => {
        const formattedPrice = permaBuy.toLocaleString('en-US', {
            maximumFractionDigits: 1,
            minimumFractionDigits: 1
        });
        return (
            <Card className="p-8 bg-[#0d0d0d]/50 hover:bg-[#0d0d0d]/50 space-y-12 hover:border-neutral-800">
                <CardHeader className="text-center tracking-tighter p-0">
                    <CardDescription className="text-lg">Registration method</CardDescription>
                    <CardTitle className="text-5xl leading-[0.8] tracking-tighter">
                        Permabuy  {name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-0">
                    <div className="text-8xl font-semibold flex flex-col items-center gap-3">
                        {formattedPrice}
                        <small className="text-lg text-neutral-700">ARIO</small>
                    </div>
                </CardContent>
                <CardFooter className="p-0">
                    <Button 
                        className="w-full font-semibold glow-btn"
                        onClick={() => handleBuy("permabuy")}
                        disabled={isBuying || !address}
                    >
                        {!address ? "Connect Wallet" : isBuying ? "Processing..." : "Buy Now"}
                    </Button>
                </CardFooter>
            </Card>
        );
    };

    const LeaseBuyTabContent = ({ name, lease }: DomainTupleData) => {
        const [selectedYear, setSelectedYear] = useState<number>(1);
        const [tokenCost, setTokenCost] = useState<{ rawTokenCost: number; tokenCost6Decimals: number } | null>(null);
        const [loadingCost, setLoadingCost] = useState<boolean>(false);
        const date = new Date().getFullYear();
        
        // Fetch token cost when selectedYear changes
        useEffect(() => {
            const fetchTokenCost = async () => {
                setLoadingCost(true);
                try {
                    const cost = await getTokenCost(name, selectedYear);
                    setTokenCost(cost);
                } catch (error) {
                    console.error("Error fetching token cost:", error);
                    toast.error("Failed to fetch pricing information");
                } finally {
                    setLoadingCost(false);
                }
            };
            
            fetchTokenCost();
        }, [name, selectedYear]);
        
        const formattedPrice = tokenCost ? tokenCost.tokenCost6Decimals.toLocaleString('en-US', {
            maximumFractionDigits: 6,
            minimumFractionDigits: 1
        }) : "0.0";
        return (
            <Card className="hover:border-neutral-800 bg-[#0d0d0d]/50 hover:bg-[#0d0d0d]/50 p-8 space-y-12">
                <CardHeader className="text-center tracking-tighter p-0">
                    <CardDescription className="text-lg">Registration method</CardDescription>
                    <CardTitle className="text-5xl leading-[0.8] tracking-tighter">
                        Lease {name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col p-0">
                    <div className="pb-3 text-sm text-neutral-400">
                        Select a year
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Slider
                            max={4}
                            onValueChange={(value) => {
                                const year = value[0];
                                setSelectedYear(year + 1);
                            }}
                        />
                        <div className="flex w-full px-2">
                            <div
                                className={`${selectedYear === 1 ? "text-white" : "text-neutral-600"}  transition-all text-left flex-1`}
                            >
                                1
                            </div>
                            <div
                                className={`${selectedYear === 2 ? "text-white" : "text-neutral-600"} flex-1 transition-all translate-x-4 -ml-1`}
                            >
                                2
                            </div>
                            <div
                                className={`${selectedYear === 3 ? "text-white" : "text-neutral-600"} transition-all text-center flex-1`}
                            >
                                3
                            </div>
                            <div
                                className={`${selectedYear === 4 ? "text-white" : "text-neutral-600"} transition-all -mr-1 text-right -translate-x-4 flex-1`}
                            >
                                4
                            </div>
                            <div
                                className={`${selectedYear === 5 ? "text-white" : "text-neutral-600"} transition-all text-right flex-1`}
                            >
                                5
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex p-0 justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-sm text-neutral-400">
                            until {date + selectedYear}
                        </span>
                        <div className="text-white text-3xl font-semibold flex items-end">
                            {loadingCost ? (
                                <PriceLoadingSkeleton />
                            ) : (
                                <>
                                    {formattedPrice}
                                    <span className="text-xs text-neutral-400 ml-2 mb-1">
                                        ARIO
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Info className="text-neutral-500 hover:text-white size-5" />
                        <Button 
                            size="sm" 
                            className="px-6 glow-btn"
                            onClick={() => handleBuy("lease", selectedYear)}
                            disabled={isBuying || !address || loadingCost}
                        >
                            {!address ? "Connect Wallet" : isBuying ? "Processing..." : loadingCost ? "Loading..." : "Buy"}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        );
    };

    if (checking) {
        return <BuyArnsSkeleton />;
    }

    if (!arns) return null;

    return (
        <Layout>
            <div className="container relative flex items-start mt-[20vh] justify-center h-[calc(100dvh-200px)]">
                <Tabs defaultValue="permanent" className="w-[800px] relative">
                    <Link
                        to={"/arns"}
                        className="flex items-center gap-1 group text-xs absolute -top-[30px] left-0"
                    >
                        <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-all" />{" "}
                        Go back
                    </Link>
                    <TabsList className="w-full grid grid-cols-2 bg-black border border-neutral-800 rounded-lg">
                        <TabsTrigger
                            className="data-[state=active]:bg-neutral-800/80 bg-black rounded-md"
                            value="permanent"
                        >
                            Permanent
                        </TabsTrigger>
                        <TabsTrigger
                            className="data-[state=active]:bg-neutral-800/80 bg-black rounded-md"
                            value="lease"
                        >
                            Lease
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value={"permanent"}>
                        <PermanentBuyTabContent {...arns} />
                    </TabsContent>
                    <TabsContent value={"lease"}>
                        <LeaseBuyTabContent {...arns} />
                    </TabsContent>
                </Tabs>
            </div>
            
            {balanceInfo && (
                <InsufficientBalanceModal
                    isOpen={showInsufficientBalance}
                    onClose={() => setShowInsufficientBalance(false)}
                    requiredAmount={balanceInfo.required}
                    currentBalance={balanceInfo.current}
                />
            )}
        </Layout>
    );
};

export default BuyArns;