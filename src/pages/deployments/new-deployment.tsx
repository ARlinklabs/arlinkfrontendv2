import Layout from "@/layouts/layout";
import { TemplateSelection } from "../../components/ui/template";
import ConfiguringDeploymentProject from "../../components/configuring-deployment";
import { useEffect, useState } from "react";
import type { Steps } from "@/types";
import RepoProvider from "./repo-provider";
import ConfigureProtocolLandProject from "../../components/configuring-pl-deployment";
import useDeploymentManager from "@/hooks/use-deployment-manager";

const NewDeployment = () => {
    const [selectedRepoUrl, setSelectedRepoUrl] = useState<{
        name: string;
        url: string;
    }>({
        name: "project name",
        url: "demo-url",
    });
    const { managerProcess } = useDeploymentManager();

    useEffect(() => {
        console.log(managerProcess);
    }, [managerProcess]);

    const [step, setStep] = useState<Steps>("importing");

    useEffect(() => {
        console.log(selectedRepoUrl);
    }, [selectedRepoUrl]);

    return (
        <Layout>
            <div className="md:container px-4 text-white p-10">
                <Steps
                    step={step}
                    setSelectedRepo={setSelectedRepoUrl}
                    selectedRepo={selectedRepoUrl}
                    setStep={setStep}
                />
            </div>
        </Layout>
    );
};

export default NewDeployment;

const Steps = ({
    step,
    setSelectedRepo,
    selectedRepo,
    setStep,
}: {
    step: Steps;
    setSelectedRepo: React.Dispatch<
        React.SetStateAction<{ name: string; url: string }>
    >;
    selectedRepo: { name: string; url: string };
    setStep: React.Dispatch<React.SetStateAction<Steps>>;
}) => {
    switch (step) {
        case "importing":
            return (
                <>
                    <h1 className="text-2xl lg:text-4xl font-bold mb-4">
                        Let's Deploy your project
                    </h1>
                    <p className="text-sm lg:text-base text-neutral-400 mb-8">
                        Arlink allows you to permanently deploy and manage your
                        <br className="hidden lg:block" />
                        web apps on the PermaWeb with ease.
                    </p>

                    <div className="flex lg:flex-row flex-col gap-4">
                        <RepoProvider
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
                    repoName={selectedRepo.name}
                    repoUrl={selectedRepo.url}
                    setStep={setStep}
                />
            );
        case "configuring-protocol":
            return (
                <ConfigureProtocolLandProject
                    setStep={setStep}
                    selectedRepo={selectedRepo}
                />
            );
        default:
            return <div>Something wrong happened</div>;
    }
};
