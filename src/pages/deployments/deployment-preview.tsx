import {
    ArrowRight,
    Zap,
    MonitorSmartphone,
    GitBranch,
    Globe,
    ChevronRight,
} from "lucide-react";

export default function DeploymentPreview() {
    return (
        <div className="text-neutral-100 p-6 rounded-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-8 mt-4 text-center">
                Congratulation your app has been deployed 🎉
            </h2>
            <div className="bg-arlink-bg-secondary-color flex border border-neutral-800  flex-col p-5 rounded-lg gap-4">
                <div className="order border-neutral-800 rounded-lg  mb-4">
                    <h3 className="text-lg font-semibold mb-4 text-neutral-100">
                        Project name
                    </h3>
                    <div className="bg-neutral-900 border-2 border-neutral-800 h-[400px] rounded-lg overflow-hidden">
                        <iframe
                            src={`https://fabric.codebydennis.com/`}
                            className="w-full h-full"
                            title="Deployment Preview"
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
                            Push new changes to this project branch to see
                            latest updates
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
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

                        <ChevronRight className="h-5 w-5 text-neutral-600" />
                    </div>
                </div>

                <button className="w-full text-semibold bg-neutral-100 text-neutral-900 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">
                    Continue to project dashboard
                </button>
            </div>
        </div>
    );
}
