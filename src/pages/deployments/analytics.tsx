import { checkProcessId } from "@/actions/analytics";
import AnalyticsOverview from "@/components/analytics/analytics-overview";
import EnableAnalytics from "@/components/analytics/enable-analytics";
import { AnalyticsDashboardSkeleton } from "@/components/skeletons";
import { useGlobalState } from "@/store/useGlobalState";
import { useActiveAddress, useSigner } from "@/lib/wallet-strategies";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { TDeployment } from "@/types";

const Analytics = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const projectName = searchParams.get("repo");
    const { deployments } = useGlobalState();
    const { signer, isLoading: signerLoading } = useSigner();
    const [deployment, setDeployment] = useState<TDeployment | null>(null);
    const walletAddress = useActiveAddress();

    // process Id states
    const [isCheckingProcessId, setIsCheckingProcessId] =
        useState<boolean>(false);
    const [processId, setProcessId] = useState<string | null>(null);

    const handleProcessId = (value: string) => {
        setProcessId(value);
    };

    // Deployment existence check
    useEffect(() => {
        if (!projectName) {
            toast.error("No repository specified");
            navigate("/dashboard");
            return;
        }

        const foundDeployment = deployments.find((d) => d.Name === projectName);
        if (!foundDeployment) {
            toast.error("Deployment not found");
            navigate("/dashboard");
            return;
        }

        setDeployment(foundDeployment);
    }, [projectName, deployments, navigate]);

    // useEffects
    useEffect(() => {
        if (!deployment || !walletAddress) return;
        
        // Don't check process ID if signer is still loading or not available
        if (signerLoading || !signer) {
            console.log('Waiting for signer to be ready before checking process ID...', { signerLoading, hasSigner: !!signer });
            return;
        }

        const init = async () => {
            setIsCheckingProcessId(true);
            try {
                const processId = await checkProcessId(
                    deployment.Name,
                    walletAddress,
                    signer,
                );
                setProcessId(processId);
                console.log(processId);
            } catch (error) {
                if (error instanceof Error) {
                    console.error(error);
                }
            } finally {
                setIsCheckingProcessId(false);
            }
        };

        init();
    }, [deployment, walletAddress, signer, signerLoading]);

    // Loading state while searching for deployment
    if (!deployment) {
        return (
            <div className="py-10 container space-y-4">
                <div className="text-xl">Searching for deployment...</div>
            </div>
        );
    }

    // conditions
    if (!walletAddress) {
        return <div>Please connect your wallet to view analytics</div>;
    }

    if (isCheckingProcessId) {
        return (
            <div className="py-10 container space-y-4">
                <AnalyticsDashboardSkeleton pulseAnimation />
            </div>
        );
    }

    return (
        <section className="py-10 container">
            <header className="space-y-4">
                {!processId && (
                    <EnableAnalytics
                        walletAddress={walletAddress}
                        handleProcessId={handleProcessId}
                        processId={processId}
                    />
                )}
            </header>
            {processId && (
                <>
                    <AnalyticsOverview processId={processId} />
                </>
            )}
        </section>
    );
};

export default Analytics;
