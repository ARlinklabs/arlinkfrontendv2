import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "@/layouts/layout";
import { toast } from "sonner";
import type { TDeployment } from "@/types";
import { useGlobalState } from "@/store/useGlobalState";
import DeploymentComponent from "@/pages/deployments/deployment-component";

export default function DeploymentPage() {
    const [searchParams] = useSearchParams();
    const repo = searchParams.get("repo");
    const navigate = useNavigate();
    const { deployments } = useGlobalState();
    const [deployment, setDeployment] = useState<TDeployment | null>(null);

    useEffect(() => {
        deployments.forEach((deployment) => {
            console.log({ ...deployment, repo });
        });
    }, []);

    console.log({
        deployments: deployments.find((project) => project.Name === repo),
    });

    useEffect(() => {
        if (!repo) {
            toast.error("No repository specified");
            navigate("/dashboard");
            return;
        }

        const foundDeployment = deployments.find((d) => d.Name === repo);
        if (!foundDeployment) {
            toast.error("Deployment not found");
            navigate("/dashboard");
            return;
        }

        setDeployment(foundDeployment);
    }, [repo, deployments, navigate]);

    if (!deployment) {
        return (
            <Layout>
                <div className="text-xl">Searching for deployment...</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <DeploymentComponent deployment={deployment} />
        </Layout>
    );
}
