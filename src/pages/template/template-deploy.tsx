import { useGlobalState } from "@/store/useGlobalState";
import { useParams } from "react-router-dom";
import ConfiguringDeploymentProject from "@/components/configuring-deployment";
import { Steps } from "@/types";
import { useState } from "react";
import { GitHubSignInDeploy } from "@/components/ui/github-sign-in";

const TemplateDeploy = () => {
    const [, setStep] = useState<Steps>("configuring");

    const { owner, repoName } = useParams();
    const { githubToken } = useGlobalState();
    const selectedUrl = `https://github.com/${owner}/${repoName}`;

    if (!githubToken) {
        return (
            <div className="flex flex-col mt-8 items-center justify-center min-h-[80vh] px-4">
                <div className="bg-neutral-950 border w-full max-w-[800px] border-neutral-900 hover:border-neutral-800 rounded-lg p-8 mb-6">
                    <div className="flex flex-col items-center text-center w-full gap-8">
                        <div className="w-full h-[300px] bg-neutral-800/50 rounded-lg flex items-center justify-center">
                            <div className="animate-pulse bg-neutral-800 h-16 w-16 rounded-full" />
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <h2 className="text-2xl font-bold text-white">
                                Connect Your GitHub Account
                            </h2>
                            <p className="text-neutral-400 max-w-md">
                                To deploy this template, you'll need to connect
                                your GitHub account first. This allows us to
                                create a repository for your project.
                            </p>

                            <div className="mt-4">
                                <GitHubSignInDeploy />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!repoName) {
        return <div>Template not found</div>;
    }

    return (
        <div className="min-h-screen bg-random text-white p-4 sm:p-8">
            <ConfiguringDeploymentProject
                repoName={repoName}
                repoUrl={selectedUrl}
                setStep={setStep}
            />
        </div>
    );
};

export default TemplateDeploy;
