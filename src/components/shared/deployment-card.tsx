import { Link } from "react-router-dom";
import { ExternalLink, MoveUpRight, GitBranch, GitCommit } from "lucide-react";
import { TDeployment } from "@/types";
import { extractGithubPath, sanitizeRepoUrl } from "@/pages/utilts";

interface DeploymentCardProps {
    deployment: TDeployment;
}

const DeploymentCard = ({ deployment }: DeploymentCardProps) => {
    return (
        <div className="mb-6 animate-in fade-in-0 bg-arlink-bg-secondary-color p-4 border border-neutral-800 rounded-lg">
            <div className="flex md:flex-row flex-col w-full gap-7">
                {/* Preview Section */}
                <div className="relative lg:w-2/5 md:w-1/2 w-full">
                    {deployment.UnderName ? (
                        <>
                            <iframe
                                src={`https://${deployment.UnderName}_arlink.ardrive.net/`}
                                className="w-full border border-neutral-700 z-20 h-[330px] relative rounded-sm"
                                title="Deployment Preview"
                                scrolling="no"
                            />
                        </>
                    ) : (
                        <div className="w-full border border-neutral-700 h-[330px] flex items-center rounded-sm justify-center bg-neutral-900 text-white">
                            <p className="text-center">
                                Deployment URL not available.
                                <br />
                                Please check your deployment status.
                            </p>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="flex flex-col py-1 justify-between">
                    <div className="flex flex-col gap-4">
                        {/* Deployment URL */}
                        <div>
                            <p className="text-sm text-neutral-400 mb-1">
                                Deployment url
                            </p>
                            <Link
                                to={`https://ardrive.net/${deployment.DeploymentId}`}
                                target="_blank"
                                className="text-md hover:underline flex items-center"
                            >
                                {deployment.DeploymentId
                                    ? `https://ardrive.net/${deployment.DeploymentId.slice(
                                          0,
                                          20,
                                      )}...`
                                    : deployment?.DeploymentId
                                    ? `https://ardrive.net/${deployment.DeploymentId}`
                                    : "Not available"}
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </Link>
                        </div>

                        {/* Live URL */}
                        <div>
                            <p className="text-sm text-neutral-400 mb-1">
                                Live at
                            </p>
                            <div className="flex text-md items-center space-x-2">
                                <Link
                                    to={`https://${deployment.UnderName}_arlink.ardrive.net`}
                                    target="_blank"
                                    className="text-sm hover:underline flex items-center"
                                >
                                    {`${deployment.UnderName}_arlink.ardrive.net`}
                                    <MoveUpRight className="w-4 h-4 ml-2" />
                                </Link>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col">
                            <p className="text-sm mb-1 text-neutral-400">
                                Status
                            </p>
                            {!deployment.UnderName ? (
                                <div className="flex text-md items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                                    <span>Not live</span>
                                </div>
                            ) : (
                                <div className="flex text-md items-center gap-2">
                                    <div className="w-3 h-3 bg-[#00FFEA] rounded-full" />
                                    <span>Live</span>
                                </div>
                            )}
                        </div>

                        {/* Branch Info */}
                        <div className="flex flex-col">
                            <p className="text-sm text-neutral-400">Branch</p>
                            <div className="flex text-md mt-1 font-medium items-center space-x-2 text-sm">
                                <GitBranch className="w-4 h-4 text-neutral-600" />
                                <span>{deployment?.Branch}</span>
                            </div>
                            <div className="flex text-md mt-1 font-medium items-center space-x-2 text-sm">
                                <GitCommit className="w-4 h-4 text-neutral-600" />
                                <span>
                                    {deployment?.DeploymentId?.substring(0, 7)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* GitHub Link */}
                    <a
                        href={sanitizeRepoUrl(deployment.RepoUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-fit gap-2 pr-4 p-[7px] items-center md:mt-0 mt-8 font-light hover:bg-neutral-900 border-neutral-700/50 border rounded-full"
                    >
                        <img
                            src="/github-mark-white.svg"
                            className="h-6 w-6 aspect-square"
                            alt="github-logo"
                        />
                        <span className="font-medium text-neutral-400">
                            {deployment?.RepoUrl ? extractGithubPath(deployment.RepoUrl) : ""}
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default DeploymentCard;
