import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Layout from "@/layouts/layout";
import { toast } from "sonner";
import useDeploymentManager from "@/hooks/use-deployment-manager";
import DeploymentOverview from "@/pages/deployments/deployment-overview";
import {
    DeploymentCardSkeleton,
    ConfigureProjectSkeleton,
} from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjects, mapConfigToDeployment } from "@/lib/api";
import type { TDeployment } from "@/types";

export default function DeploymentPage() {
    const [searchParams] = useSearchParams();
    const repo = searchParams.get("repo");
    const navigate = useNavigate();
    const { deployments, hasFetchedOnce, refresh } = useDeploymentManager();
    const [fetchedDeployment, setFetchedDeployment] = useState<TDeployment | null>(null);
    const [backendChecked, setBackendChecked] = useState(false);

    const localDeployment = useMemo(
        () => deployments.find((d) => d.Name === repo),
        [deployments, repo],
    );
    const deployment = localDeployment || fetchedDeployment;

    // If not found locally after initial fetch, query backend by projectName
    useEffect(() => {
        if (localDeployment || !repo || !hasFetchedOnce || backendChecked) return;

        let cancelled = false;
        (async () => {
            try {
                const { projects } = await getProjects();
                const match = projects.find(
                    (p) => (p.projectName || p.repoName) === repo,
                );
                if (match && !cancelled) {
                    setFetchedDeployment(mapConfigToDeployment(match));
                    refresh();
                }
            } catch {
                // non-fatal
            } finally {
                if (!cancelled) setBackendChecked(true);
            }
        })();
        return () => { cancelled = true; };
    }, [repo, localDeployment, hasFetchedOnce, backendChecked]);

    // Only redirect after both local AND backend lookup failed
    useEffect(() => {
        if (!repo) {
            toast.error("No repository specified");
            navigate("/dashboard");
            return;
        }

        if (hasFetchedOnce && backendChecked && !deployment) {
            toast.error("Deployment not found");
            navigate("/dashboard");
        }
    }, [repo, deployment, hasFetchedOnce, backendChecked, navigate]);

    if (!deployment) {
        return (
            <Layout>
                <div className="w-full px-4 py-10 md:px-[40px]">
                    <div className="flex md:flex-row flex-col space-y-3 justify-between items-start mb-6">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48 bg-neutral-800" />
                            <Skeleton className="h-4 w-72 bg-neutral-800/50" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-20 bg-neutral-800" />
                            <Skeleton className="h-9 w-20 bg-neutral-800" />
                            <Skeleton className="h-9 w-28 bg-neutral-800" />
                        </div>
                    </div>
                    <DeploymentCardSkeleton />
                    <ConfigureProjectSkeleton />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <DeploymentOverview deployment={deployment} />
        </Layout>
    );
}
