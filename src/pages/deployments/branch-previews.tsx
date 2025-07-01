"use client";

import {
    GitBranch,
    Settings,
    Search,
    Copy,
    ExternalLink
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
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useGlobalState } from "@/store/useGlobalState";
import EnableBranchDeployments from "@/components/enable-branch-deployments";
import { BranchPreviewsFullSkeleton } from "@/components/skeletons";
import { toast } from "sonner";
import type { TDeployment, ArnsName } from "@/types";
import { useActiveAddress } from "@arweave-wallet-kit/react";
import { setArnsUnderName } from "@/lib/ao-vars";
import { handleFetchExistingArnsName } from "../utilts";
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
    CommandGroup,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

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
    const [statusFilter, setStatusFilter] = useState("all");
    const [isArnsModalOpen, setIsArnsModalOpen] = useState(false);
    const [selectedBranchForArns, setSelectedBranchForArns] = useState<BranchData | null>(null);
    const [underName, setUnderName] = useState("");
    
    // ARNS related states
    const activeAddress = useActiveAddress();
    const [arnsNames, setArnsNames] = useState<ArnsName[]>([]);
    const [selectedArns, setSelectedArns] = useState<ArnsName | undefined>(undefined);
    const [isArnsDropdownOpen, setIsArnsDropdownOpen] = useState(false);
    const [isLoadingArns, setIsLoadingArns] = useState(false);
    const [isAssigningArns, setIsAssigningArns] = useState(false);
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
            isMainBranch: true,
            commit: deployment.DeploymentId, // Add transaction ID for main branch
            url: deployment.UnderName ? `${deployment.UnderName}_arlink.arweave.net` : null
        });
        
        // Add configured branches with real deployment data
        branchConfig.selectedBranches.forEach(branchName => {
            const deploymentData = branchConfig.deployments?.[branchName];
            
            if (deploymentData) {
                // Branch has deployment data - check actual status
                const lastDeployed = deploymentData.lastDeployedAt 
                    ? new Date(deploymentData.lastDeployedAt).toLocaleString()
                    : "Unknown";
                
                branches.push({
                    id: branchName,
                    name: branchName,
                    lastUpdated: lastDeployed,
                    author: "system",
                    status: { resolved: 0, total: 0, type: "resolved" as const },
                    hasDeployment: deploymentData.status === "deployed",
                    isMainBranch: false,
                    deploymentStatus: deploymentData.status, // Use actual status from API
                    commit: deploymentData.commit,
                    url: deploymentData.undername ? `${deploymentData.undername}_arlink.arweave.net` : deploymentData.url || null
                });
            } else {
                // Branch has no deployment data - it's waiting for a push
                branches.push({
                    id: branchName,
                    name: branchName,
                    lastUpdated: "No deployments yet",
                    author: "system",
                    status: { resolved: 0, total: 0, type: "pending" as const },
                    hasDeployment: false,
                    isMainBranch: false,
                    deploymentStatus: "waiting" // This should show grey status
                });
            }
        });
        
        return branches;
    }, [branchConfig, deployment]);

    // Filter branches based on search term and status
    const filteredBranches = realBranches.filter((branch: BranchData) => {
        const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Status filter logic
        if (statusFilter === "all") return matchesSearch;
        if (statusFilter === "ready") return matchesSearch && (branch.isMainBranch || branch.deploymentStatus === "deployed");
        if (statusFilter === "building") return matchesSearch && branch.deploymentStatus === "building";
        if (statusFilter === "failed") return matchesSearch && branch.deploymentStatus === "failed";
        if (statusFilter === "waiting") return matchesSearch && !branch.hasDeployment && !branch.isMainBranch;
        
        return matchesSearch;
    });

    // Get branch status based on branch data (Vercel-style)
    const getBranchStatus = (branch: any) => {
        if (branch.isMainBranch) {
            return { 
                type: "ready", 
                color: "bg-green-900/20 text-green-400 border-green-800", 
                text: "Ready",
                dot: "bg-green-500"
            };
        } else if (branch.deploymentStatus === "deployed") {
            return { 
                type: "ready", 
                color: "bg-green-900/20 text-green-400 border-green-800", 
                text: "Ready",
                dot: "bg-green-500"
            };
        } else if (branch.deploymentStatus === "building") {
            return { 
                type: "building", 
                color: "bg-orange-900/20 text-orange-400 border-orange-800", 
                text: "Building",
                dot: "bg-orange-500"
            };
        } else if (branch.deploymentStatus === "failed") {
            return { 
                type: "failed", 
                color: "bg-red-900/20 text-red-400 border-red-800", 
                text: "Failed",
                dot: "bg-red-500"
            };
        } else if (branch.deploymentStatus === "waiting") {
            return { 
                type: "waiting", 
                color: "bg-neutral-900/20 text-neutral-500 border-neutral-800", 
                text: "Waiting for push",
                dot: "bg-neutral-500"
            };
        } else {
            // Fallback for any other status
            return { 
                type: "waiting", 
                color: "bg-neutral-900/20 text-neutral-500 border-neutral-800", 
                text: "Waiting for push",
                dot: "bg-neutral-500"
            };
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

    // Fetch ARNS names when component mounts
    useEffect(() => {
        const fetchArnsNames = async () => {
            await handleFetchExistingArnsName({
                setArnsNames,
                activeAddress,
                setExistingArnsLoading: setIsLoadingArns,
            });
        };
        
        if (activeAddress) {
            fetchArnsNames();
        }
    }, [activeAddress]);

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
                            onClick={() => window.location.href = '/deploy'}
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
                                <SelectTrigger className="w-40 bg-neutral-900 border-neutral-700 text-neutral-100">
                                    <SelectValue placeholder="All Branches" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-neutral-700">
                                    <SelectItem value="all" className="text-neutral-100">All Branches</SelectItem>
                                    <SelectItem value="ready" className="text-neutral-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                            Ready
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="building" className="text-neutral-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                            Building
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="failed" className="text-neutral-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                            Failed
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="waiting" className="text-neutral-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-neutral-500 rounded-full" />
                                            Waiting
                                        </div>
                                    </SelectItem>
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
                        {filteredBranches.length === 0 || (filteredBranches.length === 1 && filteredBranches[0].isMainBranch) ? (
                            // Show message when no additional branches are available
                            <Card className="bg-neutral-950 border-neutral-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                                                <GitBranch className="h-5 w-5 text-neutral-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-neutral-100">
                                                    No Additional Branches
                                                </h3>
                                                <p className="text-sm text-neutral-400">
                                                    Create new branches to enable branch previews
                                                </p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="outline"
                                            size="sm"
                                            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                                            onClick={() => window.open(deployment?.RepoUrl, '_blank')}
                                        >
                                            <GitBranch className="h-4 w-4 mr-2" />
                                            Open Repository
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                                                ) : (
                            // Show actual branches list (Vercel-style)
                            filteredBranches.map((branch: BranchData) => {
                                const branchStatus = getBranchStatus(branch);
                                const showViewButton = branchStatus.type === "ready" && branch.url;
                                const isWaiting = branchStatus.type === "waiting";
                                
                                return (
                                    <Card 
                                        key={branch.id} 
                                        className="bg-neutral-950 border-neutral-800 hover:border-neutral-700 transition-colors"
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 p-0 flex items-center justify-center"
                                                            onClick={() => {
                                                                const repoUrl = deployment?.RepoUrl?.replace(/\.git$/, '');
                                                                window.open(`${repoUrl}/tree/${branch.name}`, '_blank');
                                                            }}
                                                            title="View branch on GitHub"
                                                        >
                                                            <GitBranch className="h-3 w-3 text-neutral-400" />
                                                        </Button>
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <h3 className="font-medium text-neutral-100">
                                                                    {branch.name}
                                                                </h3>
                                                                {deployment && (
                                                                    <span className="text-xs text-neutral-500">
                                                                        {deployment.RepoUrl.split('/').slice(-2).join('/')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <div className={`w-2 h-2 rounded-full ${branchStatus.dot}`}></div>
                                                                <span className="text-xs text-neutral-400">{branchStatus.text}</span>
                                                                {!isWaiting && (
                                                                    <>
                                                                        <span className="text-xs text-neutral-600">•</span>
                                                                        <span className="text-xs text-neutral-500">{branch.lastUpdated}</span>
                                                                    </>
                                                                )}
                                                                {/* Show Transaction ID for deployed branches */}
                                                                {branch.commit && branchStatus.type === "ready" && (
                                                                    <>
                                                                        <span className="text-xs text-neutral-600">•</span>
                                                                        <span className="text-xs text-neutral-500 font-mono">
                                                                            {branch.commit.slice(0, 3)}...{branch.commit.slice(-5)}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {isWaiting && (
                                                                <p className="text-xs text-neutral-500 mt-1">
                                                                    Push to this branch to create a preview
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {/* Preview Button */}
                                                    {showViewButton && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 p-2"
                                                            onClick={() => {
                                                                if (branch.url) {
                                                                    window.open(`https://${branch.url}`, '_blank');
                                                                }
                                                            }}
                                                            title="View Preview"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    
                                                    {/* Copy Transaction ID */}
                                                    {branch.commit && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 p-2"
                                                            onClick={() => {
                                                                if (branch.commit) {
                                                                    navigator.clipboard.writeText(branch.commit);
                                                                    toast.success("Transaction ID copied to clipboard");
                                                                }
                                                            }}
                                                            title="Copy Transaction ID"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    
                                                                                                        {/* ARNS Settings Gear - Only for deployed branches */}
                                                    {branchStatus.type === "ready" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 p-2"
                                                            onClick={() => {
                                                                setSelectedBranchForArns(branch);
                                                                setUnderName("");
                                                                setSelectedArns(undefined);
                                                                setIsArnsModalOpen(true);
                                                            }}
                                                            title="Assign ARNS"
                                                        >
                                                            <Settings className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* ARNS Assignment Modal */}
            <Dialog open={isArnsModalOpen} onOpenChange={setIsArnsModalOpen}>
                <DialogContent className="bg-neutral-950 border-neutral-800 text-neutral-100 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                            Assign ARNS to Branch Preview
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Assign a custom ARNS undername to make this branch preview accessible at a memorable URL.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="branch-name" className="text-sm font-medium text-neutral-200">
                                Branch
                            </Label>
                            <div className="flex items-center space-x-2 min-w-0">
                                <GitBranch className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                                <span className="font-medium text-neutral-100 truncate max-w-[200px]" title={selectedBranchForArns?.name}>
                                    {selectedBranchForArns?.name}
                                </span>
                                <span className="text-xs text-green-400 flex-shrink-0">• Ready</span>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-neutral-200">
                                Select ARNS
                            </Label>
                            {isLoadingArns ? (
                                <div className="flex items-center justify-center p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm text-neutral-400">Loading ARNS names...</span>
                                </div>
                            ) : (
                                <Popover open={isArnsDropdownOpen} onOpenChange={setIsArnsDropdownOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between bg-neutral-900 border-neutral-700 text-neutral-100"
                                            aria-expanded={isArnsDropdownOpen}
                                        >
                                            <span className="truncate mr-2" title={selectedArns?.name}>
                                                {selectedArns ? selectedArns.name : "Select an ARNS name"}
                                            </span>
                                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0 bg-neutral-900 border-neutral-700">
                                        <Command className="bg-neutral-900">
                                            <CommandInput placeholder="Search ARNS names..." className="border-0" />
                                            <CommandList>
                                                <CommandEmpty>No ARNS names found.</CommandEmpty>
                                                <CommandGroup>
                                                    {arnsNames.map((arns) => (
                                                        <CommandItem
                                                            key={arns.processId}
                                                            value={arns.name}
                                                            onSelect={() => {
                                                                setSelectedArns(arns);
                                                                setIsArnsDropdownOpen(false);
                                                            }}
                                                            className="text-neutral-100"
                                                        >
                                                            <Check
                                                                className={`mr-2 h-4 w-4 flex-shrink-0 ${
                                                                    selectedArns?.processId === arns.processId
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                }`}
                                                            />
                                                            <span className="truncate" title={arns.name}>
                                                                {arns.name}
                                                            </span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="under-name" className="text-sm font-medium text-neutral-200">
                                Undername
                            </Label>
                            <Input
                                id="under-name"
                                placeholder="my-preview-site"
                                value={underName}
                                onChange={(e) => setUnderName(e.target.value)}
                                className="bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
                            />
                            <p className="text-xs text-neutral-500">
                                Your branch preview will be available at: <br />
                                <span className={`break-all ${underName && selectedArns ? 'text-green-400' : 'text-neutral-500'}`}>
                                    {underName && selectedArns 
                                        ? `https://${underName}_${selectedArns.name.replace('.arweave', '')}.ar.io` 
                                        : "https://your-undername_your-arns.ar.io"
                                    }
                                </span>
                            </p>
                        </div>
                        
                        {selectedBranchForArns?.url && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-neutral-200">
                                    Current URL
                                </Label>
                                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                                    <span className="text-sm text-neutral-400 break-all">
                                        https://{selectedBranchForArns.url}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <DialogFooter className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsArnsModalOpen(false)}
                            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                            disabled={isAssigningArns}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!underName.trim()) {
                                    toast.error("Please enter an undername");
                                    return;
                                }
                                if (!selectedArns) {
                                    toast.error("Please select an ARNS name");
                                    return;
                                }

                                setIsAssigningArns(true);
                                try {
                                    if (!selectedBranchForArns) {
                                        toast.error("Branch information not found");
                                        return;
                                    }
                                    
                                    // Extract the deployment ID from the branch URL or use the transaction ID
                                    const deploymentId = selectedBranchForArns.commit || selectedBranchForArns.url;
                                    
                                    if (!deploymentId) {
                                        toast.error("Deployment ID not found for this branch");
                                        return;
                                    }
                                    
                                    const txId = await setArnsUnderName(
                                        selectedArns.processId,
                                        deploymentId,
                                        underName
                                    );

                                    if (txId) {
                                        const finalUrl = `https://${underName}_${selectedArns.name.replace('.arweave', '')}.ar.io`;
                                        toast.success(
                                            `ARNS assigned! Your site will be available at ${finalUrl}. Transaction ID: ${txId}`,
                                            { duration: 8000 }
                                        );
                                        setIsArnsModalOpen(false);
                                    } else {
                                        toast.error("Failed to assign ARNS. Please try again.");
                                    }
                                } catch (error) {
                                    console.error("Error assigning ARNS:", error);
                                    toast.error("An error occurred while assigning ARNS");
                                } finally {
                                    setIsAssigningArns(false);
                                }
                            }}
                            disabled={!underName.trim() || !selectedArns || isAssigningArns}
                            className="bg-white text-black hover:bg-gray-100 disabled:opacity-50"
                        >
                            {isAssigningArns ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                "Assign ARNS"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
} 