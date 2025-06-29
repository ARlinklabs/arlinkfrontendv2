"use client";

import {
    GitBranch,
    Settings,
    MessageCircle,
    Eye,
    Search,
    MoreVertical,
    User,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useGlobalState } from "@/store/useGlobalState";
import EnableBranchDeployments from "@/components/enable-branch-deployments";
import { BranchPreviewsFullSkeleton } from "@/components/skeletons";
import { toast } from "sonner";
import type { TDeployment } from "@/types";

interface BranchData {
    id: string;
    name: string;
    lastUpdated: string;
    author: string;
    status: {
        resolved: number;
        total: number;
        type: "resolved" | "pending" | "failed";
    };
    hasDeployment?: boolean;
    isMainBranch?: boolean;
    deploymentStatus?: string;
    commit?: string;
    url?: string | null;
}


export default function BranchPreviews() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const projectName = searchParams.get("repo");
    const { deployments } = useGlobalState();
    const [deployment, setDeployment] = useState<TDeployment | null>(null);
    
    // Deployment existence check
    useEffect(() => {
        if (!projectName) {
            toast.error("No repository specified");
            navigate("/dashboard");
            return;
        }

        const foundDeployment = deployments.find((d) => d.Name === projectName);
        if (!foundDeployment) {
            toast.error("Deployment not found");
            navigate("/dashboard");
            return;
        }

        setDeployment(foundDeployment);
    }, [projectName, deployments, navigate]);

    // Branch deployment states
    const [isCheckingBranchStatus, setIsCheckingBranchStatus] = useState(false);
    const [branchDeploymentsEnabled, setBranchDeploymentsEnabled] = useState(false);
    const [isBuilding, setIsBuilding] = useState(false);
    const [isIncompatible, setIsIncompatible] = useState(false);
    const [previewSyncEnabled, setPreviewSyncEnabled] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("4/5");
    const [branchConfig, setBranchConfig] = useState<{
        allBranches: string[];
        instantDeployBranch: string;
        selectedBranches: string[];
        deployments?: any;
    } | null>(null);

    // Create branches from real config data
    const realBranches = useMemo(() => {
        if (!branchConfig || !deployment) return [];
        
        const branches = [];
        
        // Add main branch
        branches.push({
            id: deployment.Branch,
            name: deployment.Branch,
            lastUpdated: "Ready",
            author: "main",
            status: { resolved: 0, total: 0, type: "resolved" as const },
            hasDeployment: true,
            isMainBranch: true
        });
        
        // Add configured branches with real deployment data
        branchConfig.selectedBranches.forEach(branchName => {
            const deploymentData = branchConfig.deployments?.[branchName];
            
            if (deploymentData) {
                // Branch has deployment data
                const lastDeployed = deploymentData.lastDeployedAt 
                    ? new Date(deploymentData.lastDeployedAt).toLocaleString()
                    : "Unknown";
                
                branches.push({
                    id: branchName,
                    name: branchName,
                    lastUpdated: lastDeployed,
                    author: "system",
                    status: { resolved: 0, total: 0, type: "resolved" as const },
                    hasDeployment: true,
                    isMainBranch: false,
                    deploymentStatus: deploymentData.status,
                    commit: deploymentData.commit,
                    url: deploymentData.undername ? `${deploymentData.undername}_arlink.arweave.net` : null
                });
            } else {
                // Branch is still building/waiting
                branches.push({
                    id: branchName,
                    name: branchName,
                    lastUpdated: "Building",
                    author: "system",
                    status: { resolved: 0, total: 0, type: "pending" as const },
                    hasDeployment: false,
                    isMainBranch: false,
                    deploymentStatus: "building"
                });
            }
        });
        
        return branches;
    }, [branchConfig, deployment]);

    // Filter branches based on search term
    const filteredBranches = realBranches.filter((branch) => {
        const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Get branch status based on branch data
    const getBranchStatus = (branch: any) => {
        if (branch.isMainBranch) {
            return { type: "resolved", color: "bg-neutral-800 text-neutral-200 border-neutral-700", text: "Ready" };
        } else if (branch.deploymentStatus === "deployed") {
            return { type: "deployed", color: "bg-neutral-700 text-neutral-300 border-neutral-600", text: "Deployed" };
        } else if (branch.deploymentStatus === "building") {
            return { type: "building", color: "bg-neutral-900 text-neutral-500 border-neutral-800", text: "Building" };
        } else if (branch.deploymentStatus === "failed") {
            return { type: "failed", color: "bg-red-900/30 text-red-400 border-red-800", text: "Failed" };
        } else {
            return { type: "building", color: "bg-neutral-900 text-neutral-500 border-neutral-800", text: "Building" };
        }
    };

    // Function to fetch branch deployment config and status
    const fetchBranchConfig = async () => {
        if (!deployment) return;
        
        try {
            // Extract owner and repo name from the deployment
            const owner = deployment.RepoUrl.split("/").reverse()[1];
            const repoName = deployment.RepoUrl.replace(/\.git|\/$/, "")
                .split("/")
                .pop();
            
            const response = await fetch(
                `https://vmi2322729.contaboserver.net/config/${owner}/${repoName}`
            );

            if (response.ok) {
                const config = await response.json();
                console.log('Branch preview config:', config);
                
                const isEnabled = config.branchPreview?.enabled || false;
                setBranchDeploymentsEnabled(isEnabled);
                
                if (isEnabled && config.branchPreview.allowedBranches) {
                    setBranchConfig({
                        allBranches: [deployment.Branch, ...config.branchPreview.allowedBranches],
                        instantDeployBranch: "", // Will be determined from deployments
                        selectedBranches: config.branchPreview.allowedBranches,
                        deployments: config.branchPreview.deployments || {}
                    });
                }
                
                return isEnabled;
            } else if (response.status === 404) {
                console.log('Deployment not compatible with branch previews');
                setIsIncompatible(true);
                setBranchDeploymentsEnabled(false);
                return false;
            } else {
                console.error('Failed to fetch branch preview config');
                setBranchDeploymentsEnabled(false);
                setIsIncompatible(false);
                return false;
            }
        } catch (error) {
            console.error('Error checking branch deployment status:', error);
            setBranchDeploymentsEnabled(false);
            setIsIncompatible(false);
            return false;
        }
    };

    // Initial check when component mounts
    useEffect(() => {
        if (!deployment) return;

        const checkInitialStatus = async () => {
            setIsCheckingBranchStatus(true);
            setIsIncompatible(false); // Reset incompatible state
            await fetchBranchConfig();
            setIsCheckingBranchStatus(false);
        };

        checkInitialStatus();
    }, [deployment]);

    // Polling effect - runs every 5 seconds when feature is enabled
    useEffect(() => {
        if (!branchDeploymentsEnabled || !deployment || isIncompatible) return;

        const pollInterval = setInterval(async () => {
            console.log('Polling for branch deployment updates...');
            await fetchBranchConfig();
        }, 5000); // Poll every 5 seconds

        return () => {
            clearInterval(pollInterval);
        };
    }, [branchDeploymentsEnabled, deployment]);

    const handleEnableBranchDeployments = (config: {
        allBranches: string[];
        instantDeployBranch: string;
        selectedBranches: string[];
    }) => {
        console.log('Branch deployments enabled with config:', config);
        setBranchConfig(config);
        setBranchDeploymentsEnabled(true);
        setIsBuilding(true);
        
        // Show building state for a while, then switch to enabled state
        setTimeout(() => {
            setIsBuilding(false);
        }, 10000); // Show building for 10 seconds
    };

    // Loading state
    if (isCheckingBranchStatus) {
        return (
            <div className="py-10 container">
                <BranchPreviewsFullSkeleton />
            </div>
        );
    }

    // Show incompatible message if deployment doesn't support branch previews
    if (isIncompatible && deployment) {
        return (
            <div className="py-10 container">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <div className="space-y-4">
                        <div className="w-20 h-20 mx-auto rounded-full bg-yellow-900/20 border border-yellow-800 flex items-center justify-center">
                            <Settings className="h-10 w-10 text-yellow-400" />
                        </div>
                        <h2 className="text-4xl font-bold text-neutral-100">
                            Feature Not Compatible
                        </h2>
                        <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            Branch Previews are not available for this deployment. This feature requires a newer deployment version.
                        </p>
                    </div>
                    
                    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 text-left max-w-xl mx-auto">
                        <h3 className="text-lg font-semibold text-neutral-100 mb-3">
                            To enable Branch Previews:
                        </h3>
                        <ol className="space-y-2 text-neutral-300">
                            <li className="flex items-start space-x-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-neutral-700 text-neutral-100 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                                <span>Create a new deployment from the dashboard</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-neutral-700 text-neutral-100 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                                <span>Use the same repository settings as this deployment</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-neutral-700 text-neutral-100 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                                <span>Branch Previews will be available in the new deployment</span>
                            </li>
                        </ol>
                    </div>
                    
                    <div className="pt-4">
                        <Button 
                            className="bg-neutral-700 hover:bg-neutral-600 text-white font-medium px-8 py-3"
                            onClick={() => window.location.href = '/deployments'}
                        >
                            Create New Deployment
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Show building state if deployments are enabled but still building
    if (branchDeploymentsEnabled && isBuilding && deployment) {
        return (
            <div className="py-10 container">
                <div className="relative">
                    <div className="absolute top-0 bg-gradient-to-b from-black/90 via-black/80 to-black/70 h-full w-full z-10 flex items-center justify-center">
                        <div className="text-center space-y-4 max-w-2xl mx-auto p-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
                            <h2 className="text-4xl font-bold text-white">
                                Building Branch Previews
                            </h2>
                            <p className="text-xl text-white/80">
                                Your deployments are being built and will be available shortly. This usually takes 2-5 minutes.
                            </p>
                            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-sm text-white/60">
                                    Branch deployments are being created for: {branchConfig?.selectedBranches.join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <BranchPreviewsFullSkeleton />
                </div>
            </div>
        );
    }

    // Show enable form if branch deployments are not enabled
    if (!branchDeploymentsEnabled && deployment) {
        return (
            <div className="py-10 container">
                <EnableBranchDeployments 
                    deployment={deployment}
                    onComplete={handleEnableBranchDeployments}
                />
            </div>
        );
    }

    // Loading state while searching for deployment
    if (!deployment) {
        return (
            <div className="py-10 container">
                <div className="text-xl">Searching for deployment...</div>
            </div>
        );
    }

    // Show error if no project found
    if (!projectName) {
        return (
            <div className="py-10 container">
                <div className="text-center text-neutral-400">
                    No project exists with the name {projectName}
                </div>
            </div>
        );
    }

    // Main branch previews content (only shown when enabled)
    return (
        <section className="py-10 container">
            <div className="container mx-auto space-y-8 bg-random min-h-[80vh]">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-neutral-100">
                        Branch Previews
                    </h1>
                    <p className="text-neutral-400">
                        Monitor and manage automatic deployments for your Git branches. Control sync settings and view deployment status.
                    </p>
                </div>

                {/* Preview Sync Toggle */}
                <Card className="bg-neutral-950 border-neutral-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        Preview Sync
                                    </h3>
                                    <p className="text-sm text-neutral-400">
                                        Sync branch changes to preview deployments in real-time. Disable to pause automatic updates.
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={previewSyncEnabled}
                                onCheckedChange={setPreviewSyncEnabled}
                                className="data-[state=checked]:bg-neutral-700"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Active Branches */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-neutral-100">Active Branches</h2>
                            <p className="text-neutral-400 flex items-center gap-1">
                                {branchConfig ? branchConfig.allBranches.length : 0} branch{branchConfig && branchConfig.allBranches.length !== 1 ? 'es' : ''} configured for automatic deployment
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-32 bg-neutral-900 border-neutral-700 text-neutral-100">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-red-900/30 text-red-400 border-red-800">
                                            <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                                        </Badge>
                                        <span>Status</span>
                                    </div>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-neutral-700">
                                    <SelectItem value="4/5" className="text-neutral-100">4/5</SelectItem>
                                    <SelectItem value="all" className="text-neutral-100">All</SelectItem>
                                    <SelectItem value="resolved" className="text-neutral-100">Resolved</SelectItem>
                                    <SelectItem value="pending" className="text-neutral-100">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                                <Input
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64 bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Branches List */}
                    <div className="space-y-3">
                        {filteredBranches.map((branch: BranchData) => {
                            const branchStatus = getBranchStatus(branch);
                            
                            return (
                                <Card 
                                    key={branch.id} 
                                    className="bg-neutral-950 border-neutral-800 hover:border-neutral-700 transition-colors"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-3">
                                                    <GitBranch className="h-5 w-5 text-neutral-400" />
                                                    <div>
                                                        <h3 className="font-semibold text-neutral-100">
                                                            {branch.name}
                                                        </h3>
                                                        <div className="flex items-center space-x-2 text-sm text-neutral-400">
                                                            <User className="h-3 w-3" />
                                                            <span>{branch.author}</span>
                                                            <Clock className="h-3 w-3 ml-2" />
                                                            <span>{branch.lastUpdated}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-3">
                                                    <Badge variant="outline" className={branchStatus.color}>
                                                        {branchStatus.text || `${branch.status.resolved}/${branch.status.total}`}
                                                    </Badge>
                                                    
                                                    {(branch.hasDeployment || branch.url) && (
                                                        <div className="flex items-center space-x-2">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                                                                onClick={() => {
                                                                    if (branch.url) {
                                                                        window.open(`https://${branch.url}`, '_blank');
                                                                    }
                                                                }}
                                                                disabled={!branch.url}
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                View
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                                                            >
                                                                <MessageCircle className="h-4 w-4 mr-1" />
                                                                Comment
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-neutral-100">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="bg-neutral-900 border-neutral-700">
                                                        <DropdownMenuItem className="text-neutral-100 hover:bg-neutral-800">
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-neutral-100 hover:bg-neutral-800">
                                                            Copy URL
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-400 hover:bg-red-900/20">
                                                            Delete Preview
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
} 