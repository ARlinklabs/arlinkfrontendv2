import { useEffect, useState } from "react";
import {
    Settings,
    Search,
    MoreHorizontal,
    MessageCircle,
    GitBranch,
    DollarSign,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { timeAgo, TESTING_FETCH } from "@/lib/utils";
import DeploymentStatusSkeleton from "../../components/ DeploymentStatusSkeleton";
import type {
    ConfigResponse,
    BranchDeployment,
    ActiveBranchCard,
} from "@/types";

export default function DeploymentStatus() {
    const { owner, repo } = useParams();
    const [isToggleOn, setIsToggleOn] = useState(false);
    const [showBranchSelection, setShowBranchSelection] = useState(false);
    const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
    const [priorityBranch, setPriorityBranch] = useState<string | null>(null);
    const [config, setConfig] = useState<ConfigResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConfig = async () => {
        try {
            const response = await fetch(
                `${TESTING_FETCH}/config/${owner}/${repo}`,
            );
            const data = await response.json();
            setConfig(data);
        } catch (err) {
            console.error("Failed to fetch config:", err);
            setError((err as Error).message || "Failed to fetch");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!owner || !repo) return;
        setLoading(true);
        fetchConfig();
        const interval = setInterval(fetchConfig, 30000);
        return () => clearInterval(interval);
    }, [owner, repo]);

    useEffect(() => {
        const stored = localStorage.getItem("selectedBranches");
        if (stored) setSelectedBranches(JSON.parse(stored));
        const storedPriority = localStorage.getItem("priorityBranch");
        if (storedPriority) setPriorityBranch(storedPriority);
    }, []);

    useEffect(() => {
        localStorage.setItem(
            "selectedBranches",
            JSON.stringify(selectedBranches),
        );
    }, [selectedBranches]);

    useEffect(() => {
        if (priorityBranch) {
            localStorage.setItem("priorityBranch", priorityBranch);
        }
    }, [priorityBranch]);

    const handleToggle = () => {
        setIsToggleOn(!isToggleOn);
        setShowBranchSelection(!isToggleOn);
    };

    const handleBranchToggle = (branchName: string) => {
        setSelectedBranches((prev) =>
            prev.includes(branchName)
                ? prev.filter((b) => b !== branchName)
                : prev.length >= 4
                  ? (alert("Only 4 branches can be selected."), prev)
                  : [...prev, branchName],
        );
    };

    const handleDeployNow = async () => {
        if (!priorityBranch || !selectedBranches.includes(priorityBranch)) {
            alert(
                "Priority branch must be selected and among the selected branches.",
            );
            return;
        }

        try {
            await fetch(
                `${TESTING_FETCH}/branch-preview/${owner}/${repo}/settings`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        enabled: true,
                        allowedBranches: selectedBranches,
                        deployImmediately: [priorityBranch],
                    }),
                },
            );
            alert("Deployment triggered!");
            await fetchConfig();
        } catch (error) {
            console.error("Deployment failed:", error);
            alert("Failed to deploy. Check console.");
        }
    };

    const availableBranches = config?.branchPreview?.allowedBranches || [];
    const deployments = config?.branchPreview?.deployments || {};
    const noBranchesAvailable = availableBranches.length === 0;

    const activeBranches: ActiveBranchCard[] = Object.entries(
        deployments,
    ).flatMap(([branchName, deployment]: [string, BranchDeployment]) => {
        const base = {
            name: branchName,
            author: "vaishnavi-patil",
            updatedTime: timeAgo(deployment.lastDeployedAt),
            status: deployment.status,
        };

        const cards: ActiveBranchCard[] = [];

        if (["building", "deployed", "failed"].includes(deployment.status)) {
            cards.push({
                ...base,
                showViewDeployment: deployment.status === "deployed",
                showComment: deployment.status === "failed",
            });
        }

        if (
            deployment.resolvedCount !== undefined &&
            deployment.totalCount !== undefined
        ) {
            cards.push({
                ...base,
                showResolvedStatus: true,
                resolvedCount: deployment.resolvedCount,
                totalCount: deployment.totalCount,
            });
        }

        return cards;
    });

    const isResolvedCard = (
        branch: ActiveBranchCard,
    ): branch is Extract<ActiveBranchCard, { showResolvedStatus: true }> =>
        "showResolvedStatus" in branch;

    if (loading) return <DeploymentStatusSkeleton />;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

    return (
        <div className="flex flex-col z-0 md:py-7 md:flex-row min-h-[80vh] text-white">
            <div className="md:container p-3">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold mb-2 tracking-tight text-neutral-100">
                        Branch Deployment Settings
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        Configure automatic deployments for your Git branches.
                    </p>
                </div>

                <Separator className="mb-6" />

                <div className="p-4 mb-8 rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80 hover:bg-arlink-bg-secondary-color">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isToggleOn ? "bg-blue-600" : "bg-gray-600"}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isToggleOn ? "translate-x-6" : "translate-x-1"}`}
                            />
                        </button>
                    </div>
                </div>

                {showBranchSelection && (
                    <div className="rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80 hover:bg-arlink-bg-secondary-color p-6 mb-8">
                        <div className="mb-4">
                            <div className="bg-[#DF7F00]/10 border border-[#553700] rounded-lg p-3 mb-4 flex items-center space-x-4">
                                <DollarSign className="text-[#CB9800] w-5 h-5" />
                                <p className="text-[#CB9800] text-sm italic font-normal">
                                    Each enabled branch creates preview
                                    deployments using build minutes and storage.
                                </p>
                            </div>

                            <h3 className="font-semibold mb-2">
                                Select Branches to Deploy
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                                {selectedBranches.length} selected
                            </p>

                            {noBranchesAvailable ? (
                                <div className="text-sm text-red-400 italic">
                                    🚫 No branches available for deployment in
                                    this repository.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {availableBranches.map((branch) => (
                                        <div
                                            key={branch}
                                            className="flex items-center justify-between p-3 rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80 hover:bg-arlink-bg-secondary-color"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <GitBranch className="w-4 h-4 text-gray-400" />
                                                <span>{branch}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() =>
                                                        handleBranchToggle(
                                                            branch,
                                                        )
                                                    }
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${selectedBranches.includes(branch) ? "bg-blue-600" : "bg-gray-600"}`}
                                                >
                                                    <span
                                                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${selectedBranches.includes(branch) ? "translate-x-5" : "translate-x-1"}`}
                                                    />
                                                </button>
                                                <input
                                                    type="radio"
                                                    name="priority"
                                                    value={branch}
                                                    checked={
                                                        priorityBranch ===
                                                        branch
                                                    }
                                                    onChange={() =>
                                                        setPriorityBranch(
                                                            branch,
                                                        )
                                                    }
                                                    disabled={
                                                        !selectedBranches.includes(
                                                            branch,
                                                        )
                                                    }
                                                    className="accent-blue-600 w-4 h-4"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handleDeployNow}
                                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
                                disabled={
                                    selectedBranches.length === 0 ||
                                    !priorityBranch ||
                                    noBranchesAvailable
                                }
                            >
                                🚀 Deploy Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Active Branches Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-1">
                                Active Branches
                            </h2>
                            <p className="text-gray-400 flex items-center">
                                Open branches on
                                <span className="mx-1 bg-white text-black px-1 rounded text-xs font-mono">
                                    {repo}
                                </span>
                                that have been deployed
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 border border-neutral-800 rounded px-3 py-1">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                </div>
                                <span className="text-sm">Status</span>
                                <span className="text-xs text-gray-400">
                                    {activeBranches.length}/
                                    {availableBranches.length}
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
                                            <GitBranch className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div
                                            className={`w-2.5 h-2.5 rounded-full -ml-2.5 mt-6 ${
                                                branch.status === "deployed"
                                                    ? "bg-green-500"
                                                    : branch.status ===
                                                        "building"
                                                      ? "bg-yellow-500"
                                                      : "bg-red-500"
                                            }`}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium">
                                                {branch.name}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-400 flex items-center space-x-2">
                                            <span>
                                                updated {branch.updatedTime} by
                                            </span>
                                            <span className="font-mono text-xs">
                                                {branch.author}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    {isResolvedCard(branch) && (
                                        <span className="text-white text-sm italic">
                                            {branch.resolvedCount}/
                                            {branch.totalCount} resolved
                                        </span>
                                    )}
                                    {"showViewDeployment" in branch &&
                                        branch.showViewDeployment && (
                                            <button className="text-gray-400 hover:text-white text-sm">
                                                View Deployment Status
                                            </button>
                                        )}
                                    {"showComment" in branch &&
                                        branch.showComment && (
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
