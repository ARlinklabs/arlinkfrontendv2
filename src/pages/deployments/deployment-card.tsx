import useDeploymentManager from "@/hooks/use-deployment-manager";
import { Zap, Globe, ChevronRight, ExternalLink } from "lucide-react";
import ReactConfetti from "react-confetti";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function DeploymentCard({}) {
    const navigate = useNavigate();
    // hooks and stores
    const { deployments } = useDeploymentManager();
    const [searchParmas] = useSearchParams();

    // constants
    const repo = searchParmas.get("repo");
    const deployment = deployments.find((project) => project.Name === repo);

    console.log(deployments);

    if (!deployment?.UnderName)
        navigate("/deployment?repo=" + deployment?.Name);

    if (!deployment) {
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
                            to={`https://${deployment.UnderName}_arlink.arweave.net`}
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
                            src={`https://${deployment.UnderName}_arlink.arweave.net`}
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

                <button
                    onClick={() =>
                        navigate("/deployment?repo=" + deployment.Name)
                    }
                    className="w-full text-semibold bg-neutral-100 text-neutral-900 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
                >
                    Continue to project dashboard
                </button>
            </div>
        </div>
    );
}
