import { DeploymentStore } from "@/types";
import { create } from "zustand";

export const useDeploymentStore = create<DeploymentStore>((set, get) => ({
    deployments: [],

    addDeployment: (config) => {
        const githubPath = `${config.owner}/${config.repoName}`.toLowerCase();

        // Check if deployment with same GitHub path already exists
        const existingDeployment = get().deployments.find((deployment) => {
            const deploymentPath =
                `${deployment.owner}/${deployment.repoName}`.toLowerCase();
            return deploymentPath === githubPath;
        });

        if (existingDeployment) {
            return {
                success: false,
                error: `Deployment already exists for ${config.owner}/${config.repoName}`,
            };
        }

        set((state) => ({
            deployments: [...state.deployments, config],
        }));

        return { success: true };
    },

    removeDeployment: (arnsUnderName) =>
        set((state) => ({
            deployments: state.deployments.filter(
                (deployment) => deployment.arnsUnderName !== arnsUnderName
            ),
        })),

    updateDeployment: (githubPath, updates) => {
        const existingDeploymentIndex = get().deployments.findIndex(
            (deployment) => {
                const deploymentPath =
                    `${deployment.owner}/${deployment.repoName}`.toLowerCase();
                return deploymentPath === githubPath.toLowerCase();
            }
        );

        if (existingDeploymentIndex === -1) {
            return {
                success: false,
                error: `No deployment found for ${githubPath}`,
            };
        }

        set((state) => ({
            deployments: state.deployments.map((deployment, index) => {
                if (index === existingDeploymentIndex) {
                    return { ...deployment, ...updates };
                }
                return deployment;
            }),
        }));

        return { success: true };
    },

    getDeploymentByGithubPath: (githubPath) => {
        const searchPath = githubPath.toLowerCase();
        return get().deployments.find((deployment) => {
            const deploymentPath =
                `${deployment.owner}/${deployment.repoName}`.toLowerCase();
            return deploymentPath === searchPath;
        });
    },
}));
