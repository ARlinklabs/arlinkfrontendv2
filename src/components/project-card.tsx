"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    detectFrameworkImage,
    extractOwnerName,
    extractRepoName,
} from "@/pages/utilts";
import type { Project } from "@/types";
import {
    ExternalLink,
    GitBranch,
    Loader2,
    LucideLink,
    MoreVertical,
    Trash2,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import type React from "react";
import { useState } from "react";
import { useGlobalState } from "@/store/useGlobalState";
import useDeploymentManager from "@/hooks/use-deployment-manager";
import { performDeleteDeployment, deleteFromServer } from "@/actions/deploy";

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const globalState = useGlobalState();
    const { refresh } = useDeploymentManager();
    const navigate = useNavigate();
    const copyUnderName = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (project.UnderName) {
            navigator.clipboard.writeText(
                `${project.UnderName}_arlink.arweave.net`,
            );
        }
        toast.success("Copied to clipboard!");
    };
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const handleMoreOptionsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    async function deleteDeployment() {
        setIsDeleting(true);
        if (!globalState.managerProcess) {
            toast.error("Manager process not found");
            setIsDeleting(false);
            return;
        }

        try {
            const ownerName = extractOwnerName(project.repoUrl);
            const repoProjectName = extractRepoName(project.repoUrl);
            const deleteRes = await deleteFromServer({
                ownerName,
                repoProjectName,
            });
            if (deleteRes) {
                await performDeleteDeployment(
                    project.name,
                    globalState.managerProcess,
                    refresh,
                );
                toast.success("Deployment deleted successfully");
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Error deleting deployment:", error);
            toast.error("An error occurred while deleting the deployment");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="inline-block w-full group">
            <Card
                className="w-full bg-[#0d0d0d] group-hover:border-neutral-600 text-white border-neutral-800 p-4 transition-all"
                onClick={() => navigate(`/deployment?repo=${project.name}`)}
                role="button"
                tabIndex={0}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="md:w-12 w-10 flex items-center justify-center md:h-12 h-10 bg-neutral-800/70 border border-neutral-800 rounded-lg">
                            <img
                                src={`/logos/${detectFrameworkImage(project.outputDir).svg}`}
                                alt={`${detectFrameworkImage(project.outputDir).name} logo`}
                                className="md:w-8 md:h-8 w-6 h-6"
                            />
                        </div>
                        <div>
                            <h2 className="md:text-lg text-base text-white font-semibold">
                                {project.name.length > 15
                                    ? `${project.name.substring(0, 15)}...`
                                    : project.name}
                            </h2>

                            {project.UnderName ? (
                                <Button
                                    variant="link"
                                    className="md:text-xs text-[10px] text-nowrap block text-neutral-500 hover:underline hover:text-neutral-400 transition-colors p-0 h-auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                            `https://${project.UnderName}_arlink.arweave.net`,
                                            "_blank",
                                        );
                                    }}
                                >
                                    {project.UnderName.toLowerCase().length > 12
                                        ? `${project.UnderName.toLowerCase().slice(0, 12)}...`
                                        : project.UnderName.toLowerCase()}
                                    _arlink.arweave.net
                                </Button>
                            ) : (
                                <Button
                                    variant="link"
                                    className="md:text-xs text-[10px] text-nowrap block text-neutral-500 hover:underline hover:text-neutral-400 transition-colors p-0 h-auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                            `https://${project.arnsProcess}`,
                                            "_blank",
                                        );
                                    }}
                                >
                                    {project.arnsProcess.toLowerCase().length >
                                    35
                                        ? `${project.arnsProcess.toLowerCase().slice(0, 35)}...`
                                        : project.arnsProcess.toLowerCase()}
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            onClick={copyUnderName}
                            className="text-neutral-400 transition-all hover:rotate-45 md:h-8 md:w-8 h-7 w-7 p-0 bg-neutral-900 hover:bg-neutral-800 border rounded-full hover:text-white"
                        >
                            <LucideLink className="md:h-4 md:w-4 h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleMoreOptionsClick}
                            className="text-neutral-400 md:h-8 md:w-8 h-7 w-7 p-0 hover:bg-neutral-900 rounded-full hover:text-white"
                        >
                            <Popover>
                                <PopoverTrigger>
                                    <MoreVertical className="md:h-4 md:w-4 h-3 w-3" />
                                </PopoverTrigger>
                                <PopoverContent className="w-fit p-1 flex flex-col gap-1 rounded-xl bg-arlink-bg-secondary-color backdrop-blur-xl mt-2">
                                    <Button
                                        variant={"outline"}
                                        className="px-3 group gap-3 flex justify-start border-none rounded-lg bg-arlink-bg-secondary-color"
                                        onClick={() => {
                                            navigate(
                                                `/deployment?repo=${project.name}`,
                                            );
                                        }}
                                    >
                                        <ExternalLink />
                                        View
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className="px-3  transition-all flex justify-start border-none bg-arlink-bg-secondary-color hover:bg-red-700 rounded-lg"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? (
                                                    <div className="flex items-center gap-3">
                                                        <Loader2 className="animate-spin" />
                                                        deleting...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <Trash2 /> Delete
                                                    </div>
                                                )}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Are you absolutely sure?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action is irreversible.
                                                    The data will be deleted
                                                    from the our records but all
                                                    deployments will remain
                                                    permanently stored on
                                                    Arweave
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={deleteDeployment}
                                                >
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </PopoverContent>
                            </Popover>
                            <span className="sr-only">More options</span>
                        </Button>
                    </div>
                </div>

                <div className="flex mt-4 items-center justify-between gap-2 md:text-sm text-xs">
                    <Button
                        variant="outline"
                        className="flex w-fit gap-2 text-neutral-400 transition-all hover:text-white pr-4 p-[7px] items-center font-light bg-neutral-900 border-neutral-700/50 border rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                                `https://github.com/${project.repo}`,
                                "_blank",
                            );
                        }}
                    >
                        <img
                            src="/github-mark-white.svg"
                            className="md:h-6 md:w-6 h-5 w-5 aspect-square"
                            alt="GitHub logo"
                        />
                        <span className="font-medium">
                            {project.repo.toLowerCase().length > 20
                                ? `${project.repo.toLowerCase().slice(0, 20)}...`
                                : project.repo.toLowerCase()}
                        </span>
                    </Button>
                    <div className="flex items-center space-x-2 md:text-sm text-xs">
                        <div className="flex items-center space-x-2 rounded-full bg-neutral-800/30 px-3 py-1">
                            <GitBranch className="md:w-4 md:h-4 w-3 h-3 text-neutral-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-full bg-neutral-800/30 px-3 py-1">
                            <div className="w-2 h-2 rounded-full bg-neutral-400" />
                            <span className="text-neutral-400 -translate-y-[1.5px]">
                                {project.branch}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex md:text-xs text-[10px] mt-3 items-center gap-2 translate-x-1">
                    <span className="text-neutral-600">Framework: </span>
                    <span className="font-medium text-neutral-600 group-hover:text-neutral-500">
                        {detectFrameworkImage(project.outputDir).name}
                    </span>
                </div>
            </Card>
        </div>
    );
}
