import { useState } from "react";
import {
    Settings,
    Search,
    MoreHorizontal,
    MessageCircle,
    GitBranch,
    DollarSign,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function DeploymentStatus() {
    const [isToggleOn, setIsToggleOn] = useState(false);
    const [showBranchSelection, setShowBranchSelection] = useState(false);
    const [selectedBranches, setSelectedBranches] = useState(["main"]);

    const branches = [
        { name: "main", status: "active" },
        { name: "feature/auth", status: "active" },
        { name: "fix/login", status: "building" },
    ];

    const activeBranches = [
        {
            name: "blog-post-update",
            author: "vaishnavi-patil",
            updatedTime: "12m ago",
            status: "29/60 resolved",
            hasIcon: true,
        },
        {
            name: "hackathon-power-picker",
            author: "vaishnavi-patil",
            updatedTime: "17m ago",
            status: "0/1 resolved",
            hasIcon: true,
        },
        {
            name: "date-picker-updates",
            author: "vaishnavi-patil",
            updatedTime: "3h ago",
            showViewDeployment: true,
            hasIcon: true,
        },
        {
            name: "date-picker-updates",
            author: "vaishnavi-patil",
            updatedTime: "3h ago",
            showComment: true,
            hasIcon: true,
        },
        {
            name: "Fix initial indexes of options (#2033)",
            branchName: "fix-indexes",
            author: "vaishnavi-patil",
            updatedTime: "6h ago",
            showComment: true,
            hasIcon: true,
        },
    ];

    const handleToggle = () => {
        setIsToggleOn(!isToggleOn);
        setShowBranchSelection(!isToggleOn);
    };

    const handleBranchToggle = (branchName) => {
        setSelectedBranches((prev) =>
            prev.includes(branchName)
                ? prev.filter((b) => b !== branchName)
                : [...prev, branchName],
        );
    };

    return (
        <div className="flex flex-col z-0 md:py-7 md:flex-row min-h-[80vh] text-white">
            <div className="md:container p-3">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold mb-2 tracking-tight text-neutral-100">
                        Branch Deployment Settings
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        Configure automatic deployments for your Git branches.
                        Each enabled branch will consume deployment resources.
                    </p>
                </div>

                <Separator className="mb-6" />

                {/* Branch Deployments Toggle */}
                <div className=" p-4 mb-8 rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80 hover:bg-arlink-bg-secondary-color ">
                    <div className="flex items-center justify-between ">
                        <div className="flex items-center space-x-3 ">
                            <Settings className="w-5 h-5 text-gray-400" />
                            <div>
                                <h3 className="font-semibold">
                                    Branch Deployments
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Automatically deploy commits from selected
                                    branches to preview environments
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggle}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                isToggleOn ? "bg-blue-600" : "bg-gray-600"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    isToggleOn
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Branch Selection Modal */}
                {showBranchSelection && (
                    <div className="rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80 hover:bg-arlink-bg-secondary-color p-6 mb-8">
                        <div className="mb-4">
                            <div className="bg-[#DF7F00]/10 border border-[#553700] rounded-lg p-3 mb-4 flex items-center space-x-4">
                                <DollarSign className="text-[#CB9800] w-5 h-5" />
                                <p className="text-[#CB9800] text-sm italic font-normal">
                                    Resource Impact: Each enabled branch will
                                    create preview deployments that consume
                                    build minutes and storage. Estimated cost:
                                    $0.05/month for 1 selected branch
                                </p>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">
                                    Select Branches to Deploy
                                </h3>
                                <span className="text-sm text-gray-400">
                                    {selectedBranches.length} selected
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 ">
                            {branches.map((branch) => (
                                <div
                                    key={branch.name}
                                    className="flex items-center justify-between p-3  rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80 hover:bg-arlink-bg-secondary-color "
                                >
                                    <div className="flex items-center space-x-3">
                                        <GitBranch className="w-4 h-4 text-gray-400" />
                                        <span>{branch.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${
                                                branch.status === "active"
                                                    ? "bg-green-900 text-green-200"
                                                    : "bg-yellow-900 text-yellow-200"
                                            }`}
                                        >
                                            {branch.status}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleBranchToggle(branch.name)
                                            }
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                                selectedBranches.includes(
                                                    branch.name,
                                                )
                                                    ? "bg-blue-600"
                                                    : "bg-gray-600"
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                                    selectedBranches.includes(
                                                        branch.name,
                                                    )
                                                        ? "translate-x-5"
                                                        : "translate-x-1"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Branches */}
                <div>
                    <div className="flex items-center justify-between mb-6 ">
                        <div>
                            <h2 className="text-xl font-semibold mb-1">
                                Active Branches
                            </h2>
                            <p className="text-gray-400 flex items-center">
                                Open branches on
                                <span className="mx-1 bg-white text-black px-1 rounded text-xs font-mono">
                                    vercel/front
                                </span>
                                that have been deployed
                            </p>
                        </div>
                        <div className="flex items-center space-x-4 ">
                            <div className="flex items-center space-x-2 ">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                                <span className="text-sm">Status</span>
                                <span className="text-xs text-gray-400">
                                    4/5
                                </span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gray-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {activeBranches.map((branch, index) => (
                            <div
                                key={index}
                                className="rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80 hover:bg-arlink-bg-secondary-color p-4 flex items-center justify-between transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <div className="border border-[#222222] p-3 rounded-full">
                                            <GitBranch className="w-4 h-4 text-gray-400 " />
                                        </div>
                                        <div
                                            className={`w-2.5 h-2.5 rounded-full -ml-2.5 mt-6 ${
                                                branch.status?.includes(
                                                    "resolved",
                                                )
                                                    ? "bg-blue-500"
                                                    : branch.showViewDeployment ||
                                                        branch.showComment
                                                      ? "bg-red-500"
                                                      : "bg-yellow-500"
                                            }`}
                                        ></div>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium">
                                                {branch.name}
                                            </span>
                                            {branch.branchName && (
                                                <span className="text-gray-400">
                                                    ({branch.branchName})
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-400 flex items-center space-x-2">
                                            <span>
                                                updated {branch.updatedTime} by
                                            </span>
                                            <div className="flex items-center space-x-1">
                                                <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                                                <span>{branch.author}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    {branch.status && (
                                        <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                            {branch.status}
                                        </div>
                                    )}
                                    {branch.showViewDeployment && (
                                        <button className="text-gray-400 hover:text-white text-sm">
                                            View Deployment Status
                                        </button>
                                    )}
                                    {branch.showComment && (
                                        <button className="flex items-center space-x-1 text-gray-400 hover:text-white">
                                            <MessageCircle className="w-4 h-4" />
                                            <span className="text-sm">
                                                Comment
                                            </span>
                                        </button>
                                    )}
                                    <button className="text-gray-400 hover:text-white">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
