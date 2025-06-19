import { checkProcessId } from "@/actions/analytics";
import AnalyticsOverview from "@/components/analytics/analytics-overview";
import EnableAnalytics from "@/components/analytics/enable-analytics";
import { AnalyticsDashboardSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalState } from "@/store/useGlobalState";
import { useActiveAddress } from "@arweave-wallet-kit/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Analytics = () => {
    const [searchParams] = useSearchParams();
    const projectName = searchParams.get("repo");
    const deployments = useGlobalState((state) => state.deployments);
    const selectedProject = useMemo(() => {
        return deployments.find((project) => project.Name === projectName);
    }, []);
    const walletAddress = useActiveAddress();
    const [completedAnalyticsProcess, setCompletedAnalyticsProcess] =
        useState<boolean>(false);

    // process Id states
    const [isCheckingProcessId, setIsCheckingProcessId] =
        useState<boolean>(false);
    const [processId, setProcessId] = useState<string | null>(null);

    const handleProcessId = (value: string) => {
        setProcessId(value);
    };

    // useEffects
    useEffect(() => {
        if (!selectedProject || !walletAddress) return;

        const init = async () => {
            setIsCheckingProcessId(true);
            try {
                const processId = await checkProcessId(
                    selectedProject.Name,
                    walletAddress,
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
    }, []);

    // conditions
    if (!selectedProject || !projectName || !walletAddress)
        return <div>No project exists with the name ${projectName}</div>;

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
