"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { 
    Settings, 
    GitBranch, 
    ArrowRight, 
    ArrowLeft, 
    Loader2,
    Rocket,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import { BranchPreviewsFullSkeleton } from "@/components/skeletons";
import { GlowingOutlineButton } from "@/components/ui/glowing-outline-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TDeployment } from "@/types";

interface GitHubBranch {
    name: string;
    sha: string;
    protected: boolean;
}

interface EnableBranchDeploymentsProps {
    deployment: TDeployment;
    onComplete: (config: {
        allBranches: string[];
        instantDeployBranch: string;
        selectedBranches: string[];
    }) => void;
}

const EnableBranchDeployments = ({ deployment, onComplete }: EnableBranchDeploymentsProps) => {
    const [currentStep, setCurrentStep] = useState(0); // 0: initial, 1: select branches, 2: choose instant deploy
    const [isLoading, setIsLoading] = useState(false);
    const [branches, setBranches] = useState<GitHubBranch[]>([]);
    const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
    const [instantDeployBranch, setInstantDeployBranch] = useState<string>("");
    const [searchParams] = useSearchParams();
    const repoName = searchParams.get("repo") || "Default Project";

    // Extract owner and repo name like in deployment-logs.tsx
    const owner = deployment?.RepoUrl.split("/").reverse()[1];
    const repoNameFromUrl = deployment?.RepoUrl.replace(/\.git|\/$/, "")
        .split("/")
        .pop();

    const fetchBranches = async () => {
        if (!owner || !repoNameFromUrl) {
            toast.error('Repository information not found');
            return;
        }
        
        setIsLoading(true);
        try {
            // Try to fetch branches without authentication (works for public repos)
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repoNameFromUrl}/branches`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Repository not found or is private. This feature currently only works with public repositories.');
                } else if (response.status === 403) {
                    throw new Error('Access denied. This feature currently only works with public repositories.');
                } else {
                    throw new Error(`Failed to fetch branches: ${response.statusText}`);
                }
            }

            const branchData = await response.json();
            console.log('Fetched branches from GitHub:', branchData);
            
            if (!branchData || branchData.length === 0) {
                throw new Error('No branches found in this repository.');
            }
            
            setBranches(branchData);
        } catch (error) {
            console.error('Error fetching branches:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch branches from GitHub';
            toast.error(errorMessage);
            
            // Don't use fallback mock data - better to show the real error
            setBranches([]);
        } finally {
            setIsLoading(false);
        }
    };

    const activateBranchDeployments = async () => {
        console.log('Starting branch deployment setup...');
        console.log('Owner:', owner);
        console.log('Repo:', repoNameFromUrl);
        
        setCurrentStep(1);
        await fetchBranches();
    };

    const handleBranchSelection = (branchName: string, checked: boolean) => {
        if (checked && selectedBranches.length < 3) {
            setSelectedBranches([...selectedBranches, branchName]);
        } else if (!checked) {
            setSelectedBranches(selectedBranches.filter(b => b !== branchName));
        } else if (selectedBranches.length >= 3) {
            toast.error('You can only select up to 3 branches');
        }
    };

    const proceedToInstantDeploy = () => {
        if (selectedBranches.length === 0) {
            toast.error('Please select at least one branch');
            return;
        }
        setCurrentStep(2);
    };

    const completeSetup = async () => {
        if (!instantDeployBranch) {
            toast.error('Please select a branch for instant deployment');
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch(
                `https://vmi2322729.contaboserver.net/branch-preview/${owner}/${repoNameFromUrl}/settings`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        enabled: true,
                        allowedBranches: selectedBranches,
                        deployImmediately: [instantDeployBranch]
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to enable branch previews: ${response.statusText}`);
            }

            toast.success('Branch previews enabled successfully! Deployments are being built.');
            
            const allSelectedBranches = [deployment.Branch, ...selectedBranches];
            onComplete({
                allBranches: allSelectedBranches,
                instantDeployBranch: instantDeployBranch,
                selectedBranches: selectedBranches
            });
        } catch (error) {
            console.error('Error enabling branch previews:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to enable branch previews';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {currentStep === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative isolate"
                >
                    <div className="absolute top-0 bg-gradient-to-b from-black/80 via-black/70 to-black h-full w-full z-50">
                        <div className="w-full h-1/3 flex items-center justify-center flex-col gap-4 max-w-3xl mx-auto">
                            <div className="space-y-4">
                                <h2 className="text-6xl font-bold text-center">
                                    Branch Previews
                                </h2>
                                <p className="text-balance text-xl text-center leading-tight">
                                    Automatically deploy commits from selected branches to preview environments. 
                                    Monitor multiple branches and get instant deployments for rapid development.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 pt-4">
                                <GlowingOutlineButton
                                    disabled={isLoading}
                                    className={`${isLoading ? "glow-btn-default-active glowing_button-default " : "glow-btn opacity-100"} font-semibold`}
                                    onClick={activateBranchDeployments}
                                >
                                    <div className="flex justify-center gap-2 items-center">
                                        <Settings size={16} strokeWidth={2} />
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                Setting up
                                                <motion.div
                                                    className="flex gap-1"
                                                    initial="hidden"
                                                    animate="visible"
                                                    variants={{
                                                        visible: {
                                                            transition: {
                                                                staggerChildren: 0.2,
                                                                repeat: Infinity,
                                                                repeatType: "loop",
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {[...Array(3)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="w-1 h-1 bg-current rounded-full"
                                                            variants={{
                                                                hidden: { opacity: 0.3, scale: 0.8 },
                                                                visible: { opacity: 1, scale: 1 },
                                                            }}
                                                            transition={{
                                                                duration: 0.5,
                                                                ease: "easeInOut",
                                                            }}
                                                        />
                                                    ))}
                                                </motion.div>
                                            </span>
                                        ) : (
                                            "Enable"
                                        )}
                                    </div>
                                </GlowingOutlineButton>
                            </div>
                        </div>
                    </div>
                    <BranchPreviewsFullSkeleton />
                </motion.div>
            )}

            {currentStep > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative isolate"
                >
                    <div className="absolute top-0 bg-gradient-to-b from-black/80 via-black/70 to-black h-full w-full z-10">
                        <div className="w-full h-1/2 flex items-center flex-col gap-4 backdrop-blur-sm mx-auto">
                            <div className="flex flex-col mt-8 p-4 h-2/3 max-w-5xl w-full">
                                <div className="space-y-2">
                                    <header className="text-3xl font-semibold">
                                        Setup Branch Previews
                                    </header>
                                    <p className="text-lg text-neutral-400 font-medium">
                                        Configure automatic deployments for your Git branches
                                    </p>
                                </div>

                                {currentStep === 1 && (
                                    <motion.div
                                        className="flex gap-4 mt-8"
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 20,
                                            mass: 1,
                                        }}
                                    >
                                        <div className="flex-1 bg-neutral-800 flex items-center justify-center border border-neutral-600 font-medium h-8 aspect-square rounded-full text-nowrap">
                                            1
                                        </div>
                                        <Card className="w-full">
                                            <CardHeader className="p-4 w-full">
                                                <CardTitle className="text-lg">
                                                    Select Branches to Monitor
                                                </CardTitle>
                                                <CardDescription className="w-full">
                                                    {isLoading ? (
                                                        "Fetching available branches from your repository..."
                                                    ) : branches.filter(branch => branch.name !== deployment.Branch).length > 0 ? (
                                                        `Choose up to 3 branches to monitor for automatic deployments. Your main branch (${deployment.Branch}) is already deployed and will always be available.`
                                                    ) : (
                                                        `No additional branches found beyond your main branch (${deployment.Branch}).`
                                                    )}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6 relative bg-neutral-900/50 border-t border-neutral-800">
                                                <motion.div
                                                    key={isLoading ? 'loading' : branches.filter(branch => branch.name !== deployment.Branch).length > 0 ? 'branches' : 'empty'}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                {isLoading ? (
                                                        // Show list skeleton while loading (default expectation)
                                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                                            {[1, 2, 3].map((i) => (
                                                                <Card key={i} className="bg-neutral-950 border-neutral-800">
                                                                    <CardContent className="p-4">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center space-x-3">
                                                                                <div className="w-4 h-4 bg-neutral-800 rounded animate-pulse"></div>
                                                                                <div className="w-4 h-4 bg-neutral-800 rounded animate-pulse"></div>
                                                                                <div className="h-5 w-24 bg-neutral-800 rounded animate-pulse"></div>
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    ) : branches.filter(branch => branch.name !== deployment.Branch).length === 0 ? (
                                                        // Show encouraging message when no additional branches
                                                        <div className="py-6">
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
                                                                            Create new branches to enable previews
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
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                                        {branches.filter(branch => branch.name !== deployment.Branch).map((branch) => (
                                                                <motion.div
                                                                    key={branch.name}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                            <Card 
                                                                className={cn(
                                                                    "bg-neutral-950 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer",
                                                                    selectedBranches.includes(branch.name) && "border-neutral-600 bg-neutral-900/30"
                                                                )}
                                                                onClick={() => handleBranchSelection(branch.name, !selectedBranches.includes(branch.name))}
                                                            >
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-3">
                                                                                                                                        <Checkbox
                                                                checked={selectedBranches.includes(branch.name)}
                                                                onCheckedChange={(checked) => 
                                                                    handleBranchSelection(branch.name, checked as boolean)
                                                                }
                                                                className="data-[state=checked]:bg-white data-[state=checked]:border-white data-[state=checked]:text-black"
                                                            />
                                                                            <GitBranch className="h-4 w-4 text-neutral-400" />
                                                                            <span className="font-medium text-neutral-100">{branch.name}</span>
                                                                            {branch.protected && (
                                                                                <Badge variant="outline" className="text-xs">Protected</Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                                </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                                </motion.div>
                                            </CardContent>
                                            <CardFooter className="py-4 space-x-2">
                                                {branches.filter(branch => branch.name !== deployment.Branch).length > 0 ? (
                                                    <>
                                                <div className="text-sm text-neutral-400">
                                                    {selectedBranches.length}/3 branches selected
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={proceedToInstantDeploy}
                                                    disabled={selectedBranches.length === 0 || isLoading}
                                                    className="text-sm font-semibold px-6 bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Continue
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={fetchBranches}
                                                        disabled={isLoading}
                                                        className="text-sm font-semibold px-6 bg-white text-black hover:bg-gray-100 disabled:opacity-75"
                                                    >
                                                        <motion.div
                                                            animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                                                            transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
                                                            className="mr-2"
                                                        >
                                                            <Loader2 className="h-4 w-4" />
                                                        </motion.div>
                                                        {isLoading ? "Refreshing..." : "Refresh Branches"}
                                                    </Button>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                )}

                                {currentStep === 2 && (
                                    <>
                                        <motion.div
                                            className="flex gap-4 mt-8"
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 100,
                                                damping: 20,
                                                mass: 1,
                                            }}
                                        >
                                            <div className="flex-1 bg-neutral-800 flex items-center justify-center border border-neutral-600 font-medium h-8 aspect-square rounded-full text-nowrap">
                                                1
                                            </div>
                                            <Card className="w-full opacity-50">
                                                <CardHeader className="p-4">
                                                    <CardTitle className="text-lg">Select Branches to Monitor</CardTitle>
                                                    <CardDescription>
                                                        {selectedBranches.length} branches selected: {selectedBranches.join(', ')}
                                                    </CardDescription>
                                                </CardHeader>
                                            </Card>
                                        </motion.div>

                                        <motion.div
                                            className="flex gap-4 mt-4"
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 100,
                                                damping: 20,
                                                mass: 1,
                                                delay: 0.2,
                                            }}
                                        >
                                            <div className="flex-1 bg-neutral-800 flex items-center justify-center border border-neutral-600 font-medium h-8 aspect-square rounded-full text-nowrap">
                                                2
                                            </div>
                                            <Card className="w-full">
                                                <CardHeader className="p-4">
                                                    <CardTitle className="text-lg">
                                                        Choose Branch for Instant Deployment
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Select one branch to deploy immediately for preview
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-6 bg-neutral-900/50 border-t border-neutral-800">
                                                    <div className="space-y-3">
                                                        {selectedBranches.map((branchName) => (
                                                            <Card 
                                                                key={branchName} 
                                                                className={cn(
                                                                    "bg-neutral-950 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer",
                                                                    instantDeployBranch === branchName && "border-neutral-600 bg-neutral-900/30"
                                                                )}
                                                                onClick={() => setInstantDeployBranch(branchName)}
                                                            >
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-3">
                                                                                                                                        <input
                                                                type="radio"
                                                                checked={instantDeployBranch === branchName}
                                                                onChange={() => setInstantDeployBranch(branchName)}
                                                                className="w-4 h-4 text-white bg-neutral-800 border-neutral-600 focus:ring-white focus:ring-2 accent-white"
                                                            />
                                                                            <Rocket className="h-4 w-4 text-neutral-400" />
                                                                            <span className="font-medium text-neutral-100">{branchName}</span>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="py-4 space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setCurrentStep(1)}
                                                        className="text-sm font-semibold px-6"
                                                    >
                                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                                        Back
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={completeSetup}
                                                        disabled={!instantDeployBranch}
                                                        className="text-sm font-semibold px-6 bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Complete Setup
                                                        <CheckCircle2 className="ml-2 h-4 w-4" />
                                                    </Button>
                                                    <p className="text-xs text-neutral-500">
                                                        This will enable branch monitoring and deploy the selected branch
                                                    </p>
                                                </CardFooter>
                                            </Card>
                                        </motion.div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <BranchPreviewsFullSkeleton />
                </motion.div>
            )}
        </div>
    );
};

export default EnableBranchDeployments; 