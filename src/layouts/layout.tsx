import type React from "react";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "ao-wallet-kit";

type LayoutProps = {
    children: React.ReactNode;
    className?: string;
};

export default function Layout({ children, className }: LayoutProps) {
    const { connected: isConnected } = useWallet();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isConnected) {
            setLoading(false);
        } else {
            const timer = setTimeout(() => {
                setLoading(false);
            }, 3000); // 3 seconds delay

            return () => clearTimeout(timer);
        }
    }, [isConnected]);

    return (
        <div className={className}>
            <div className="w-full">
                {isConnected ? (
                    children
                ) : loading ? (
                    <div />
                ) : (
                    <div>
                        <p className="text-center pt-10">
                            login using github or web3 wallet please 
                        </p>
                    </div>
                )}
            </div>
            <Toaster />
        </div>
    );
}
const SkeletonLoader = () => {
    return (
        <div className="container pt-[45px] mx-auto text-center">
            <div className="flex justify-between gap-2 flex-wrap">
                <div className="relative w-full md:max-w-[600px]">
                    <Skeleton className="h-[33px] w-full" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-[33px] w-[180px]" />
                    <Skeleton className="h-[33px] w-[110px]" />
                </div>
            </div>
        </div>
    );
};
