import useDeploymentManager from "@/hooks/use-deployment-manager";
import { Zap, Globe, ChevronRight, ExternalLink } from "lucide-react";
import ReactConfetti from "react-confetti";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import TwitterShareButton from "@/components/ui/twitter-share-button";
import { useState, useEffect, useMemo } from "react";
import { getProjects, mapConfigToDeployment } from "@/lib/api";
import type { TDeployment } from "@/types";

export default function DeploymentCard({}) {
    const navigate = useNavigate();
    // hooks and stores
    const { deployments, isRefreshing, walletAddress, refresh } = useDeploymentManager();
    const [searchParmas] = useSearchParams();
    const [showNotFound, setShowNotFound] = useState<boolean>(false);
    const [fetchedDeployment, setFetchedDeployment] = useState<TDeployment | null>(null);

    // constants
    const repo = searchParmas.get("repo");
    const localDeployment = useMemo(
        () => deployments.find((project) => project.Name === repo),
        [deployments, repo],
    );
    const deployment = localDeployment || fetchedDeployment;

    // If not found locally, query the backend directly by projectName
    useEffect(() => {
        if (localDeployment || !repo || isRefreshing) return;

        let cancelled = false;
        (async () => {
            try {
                const { projects } = await getProjects();
                const match = projects.find(
                    (p) => (p.projectName || p.repoName) === repo,
                );
                if (match && !cancelled) {
                    setFetchedDeployment(mapConfigToDeployment(match));
                    // Also refresh global state so other pages pick it up
                    refresh();
                }
            } catch {
                // non-fatal
            }
        })();
        return () => { cancelled = true; };
    }, [repo, localDeployment, isRefreshing]);

    if (!deployment?.UnderName && deployment)
        navigate("/deployment?repo=" + deployment?.Name);

    // Handle showing "No Deployment Found" with a delay to prevent flashing during wallet switches
    useEffect(() => {
        if (deployment) {
            setShowNotFound(false);
        } else if (walletAddress && deployments.length > 0 && !isRefreshing) {
            // Only show not found if we have deployments but this specific one isn't found
            setShowNotFound(true);
        } else if (walletAddress && deployments.length === 0 && !isRefreshing) {
            // Add a small delay before showing "not found" when no deployments at all
            const timer = setTimeout(() => {
                setShowNotFound(true);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setShowNotFound(false);
        }
    }, [deployment, walletAddress, deployments.length, isRefreshing]);

    // Reset showNotFound when wallet changes
    useEffect(() => {
        setShowNotFound(false);
    }, [walletAddress]);

    // Show loading state only when we don't have the deployment data yet
    // Don't show loading if we're just refreshing existing data
    if (!deployment && (isRefreshing || (walletAddress && deployments.length === 0 && !showNotFound))) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-100">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-300 border-t-transparent mb-4"></div>
                <p className="text-neutral-400">Loading deployment...</p>
            </div>
        );
    }

    if (!deployment && showNotFound) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-100">
                <h2 className="text-2xl font-semibold mb-4">
                    No Deployment Found
                </h2>
                <p className="text-neutral-400 mb-8">
                    We couldn't find the deployment you're looking for.
                </p>
                <a
                    href="/dashboard"
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 rounded-md transition-colors"
                >
                    Return to Dashboard
                </a>
            </div>
        );
    }

    // If no deployment and not showing "not found" yet, show loading
    if (!deployment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-100">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-300 border-t-transparent mb-4"></div>
                <p className="text-neutral-400">Loading deployment...</p>
            </div>
        );
    }

    return (
        <div className="text-neutral-100 relative p-6 rounded-lg max-w-3xl mx-auto">
            <ReactConfetti
                numberOfPieces={200}
                recycle={false}
                gravity={0.2}
                initialVelocityX={15}
                className="absolute w-full"
                initialVelocityY={30}
                colors={["#FF69B4", "#FFD700", "#7FFFD4", "#FF6347"]}
            />
            <h2 className="text-2xl font-semibold mb-8 mt-4 text-center">
                Congratulation your app has been deployed 🎉
            </h2>
            <div className="bg-arlink-bg-secondary-color flex border border-neutral-800  flex-col p-5 rounded-lg gap-4">
                <div className="order border-neutral-800 rounded-lg  mb-4">
                    <h3 className="text-lg flex items-center gap-4  font-semibold mb-4 text-neutral-100">
                        <span>{deployment.Name}</span>
                        <Link
                            to={`https://${deployment.UnderName}_arlink.ardrive.net`}
                            target="_blank"
                            className="text-sm group text-neutral-300 transition-all hover:underline flex items-center"
                        >
                            Visit
                            <ExternalLink
                                size={14}
                                className="w-4 transition-all group-hover:opacity-100 opacity-0 font-medium hover:underline h-4 ml-2"
                            />
                        </Link>
                    </h3>
                    <div className="bg-neutral-900 block border-2 border-neutral-800 h-[400px] rounded-lg overflow-hidden">
                        <iframe
                            src={`https://${deployment.UnderName}_arlink.ardrive.net`}
                            className="w-full h-full"
                            title={`${deployment.Name} Preview`}
                            scrolling="no"
                        />
                    </div>
                </div>

                <div className="space-y-4 mb-4">
                    <div>
                        <div className="flex items-center">
                            <Zap className="mr-2 h-5 w-5 text-neutral-200" />
                            <span className="text-md">
                                CI CD instant previews
                            </span>
                        </div>
                        <div className="text-xs text-neutral-400 mt-1 ml-7">
                            Push new changes to&nbsp;
                            <strong className="text-white">
                                {deployment.Branch}
                            </strong>
                            &nbsp;branch to see latest updates
                        </div>
                    </div>
                    <Link
                        to={"/deployment/settings?repo=" + deployment.Name}
                        className="flex items-center justify-between group"
                    >
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Globe className="mr-2 h-5 w-5 text-neutral-200" />
                                    <span className="text-md leading-none">
                                        Add an ArNS as domain
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs text-neutral-400 mt-1 ml-7">
                                Add a custom domain with arns
                            </div>
                        </div>

                        <ChevronRight className="h-5 w-5 text-neutral-600 group-hover:text-white transition-all" />
                    </Link>
                </div>
                <div className="space-y-2 flex items-center flex-col">
                    <button
                        onClick={() =>
                            navigate("/deployment?repo=" + deployment.Name)
                        }
                        className="w-full text-semibold bg-neutral-100 text-neutral-900 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
                    >
                        Continue to project dashboard
                    </button>

                    <TwitterShareButton
                        className="bg-neutral-900/30 hover:bg-neutral-800 transition-all px-2 py-1 items-center justify-center flex w-full rounded-md border border-neutral-800"
                        undername={deployment.UnderName}
                    />
                </div>
            </div>
        </div>
    );
}
