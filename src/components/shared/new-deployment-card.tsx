import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe, GitBranch, MoreVertical } from "lucide-react";

interface NewDeploymentCardProps {
    projectName: string;
    framework?: {
        svg: string;
        name: string;
    };
    activeTab: string;
    customArnsName: string;
    arnsName?: {
        name: string;
    };
    selectedBranch: string;
}

export default function NewDeploymentCard({
    projectName,
    framework,
    activeTab,
    customArnsName,
    arnsName,
    selectedBranch,
}: NewDeploymentCardProps) {
    return (
        <Card className="mb-6 bg-arlink-bg-secondary-color border border-neutral-800 w-full text-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm text-neutral-500 font-semibold">
                    New Deployment card
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mt-2">
                    <div className="relative w-16 h-16 overflow-hidden rounded-lg bg-neutral-700">
                        {framework && (
                            <img
                                src={`/logos/${framework.svg}`}
                                alt={`${framework.name} logo`}
                                className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                            {projectName.length === 0
                                ? "Project Name"
                                : projectName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <Globe className="w-4 h-4" />
                            <div className="hover:underline">
                                {activeTab === "arlink"
                                    ? `${
                                          customArnsName.length === 0
                                              ? projectName.toLowerCase()
                                              : customArnsName.toLowerCase()
                                      }.arlink.arweave.net`
                                    : `${projectName}.${arnsName?.name}`}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <GitBranch className="w-4 h-4" />
                            <span>{selectedBranch}</span>
                        </div>
                        <button
                            type="button"
                            className="text-neutral-400 hover:text-white transition-colors"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
