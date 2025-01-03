import Layout from "@/layouts/layout";
import { TemplateSelection } from "./template";
import GitAuthRepoSelector from "./provdier-repository";
import ConfiguringDeploymentProject from "./configuring-deployment";
import { useState } from "react";
import type { Steps } from "@/types";

const Deploy = () => {
    const [selectedRepoUrl, setSelectedRepoUrl] = useState<string>("");
    const [step, setStep] = useState<Steps>("importing");

    return (
        <Layout>
            <div className="container text-white p-10">
                <Steps
                    step={step}
                    setSelectedRepo={setSelectedRepoUrl}
                    repoUrl={selectedRepoUrl}
                    setStep={setStep}
                />
            </div>
        </Layout>
    );
};

export default Deploy;

const Steps = ({
    step,
    setSelectedRepo,
    repoUrl,
    setStep,
}: {
    step: Steps;
    setSelectedRepo: React.Dispatch<React.SetStateAction<string>>;
    repoUrl: string;
    setStep: React.Dispatch<React.SetStateAction<Steps>>;
}) => {
    switch (step) {
        case "importing":
            return (
                <>
                    <h1 className="text-4xl font-bold mb-4">
                        Let's Deploy your project
                    </h1>
                    <p className="text-neutral-400 mb-8">
                        Arlink allows you to permanently deploy and manage your
                        <br />
                        web apps on the PermaWeb with ease.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <GitAuthRepoSelector
                            setSelectedRepo={setSelectedRepo}
                            setStep={setStep}
                        />
                        <TemplateSelection />
                    </div>
                </>
            );
        case "configuring":
            return (
                <ConfiguringDeploymentProject
                    repoUrl={repoUrl}
                    setStep={setStep}
                />
            );
        default:
            return <div>Something wrong happened</div>;
    }
};
