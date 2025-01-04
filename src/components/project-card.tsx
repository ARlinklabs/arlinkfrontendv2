import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { detectFrameworkImage } from "@/pages/depoly/utilts";
import type { Project } from "@/types";
import { GitBranch, LucideLink, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    return (
        <Link
            to={`/deployment?repo=${(project.name)}`}
            className="inline-block w-full group"
        >
            <Card className="w-full bg-[#0d0d0d] group-hover:border-neutral-600 text-white border-neutral-800 p-4 transition-all">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 flex items-center justify-center h-12 bg-neutral-800/70 border border-neutral-800 rounded-lg">
                            <img
                                src={`/logos/${
                                    detectFrameworkImage(project.outputDir).svg
                                }`}
                                alt={`${
                                    detectFrameworkImage(project.outputDir).name
                                } logo`}
                                className="w-8 h-8"
                            />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">
                                {project.name.length > 15
                                    ? `${project.name.substring(0, 15)}...`
                                    : project.name}
                            </h2>
                            <a
                                href={`https://${project.arnsProcess}`}
                                className="text-sm text-nowrap block text-neutral-500 hover:underline hover:text-neutral-400 transition-colors"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {project.arnsProcess.toLowerCase()}
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            className="text-neutral-400 h-8 w-8 p-0 bg-neutral-900 hover:bg-neutral-800 border rounded-full hover:text-white"
                        >
                            <LucideLink className="h-4 w-4" />
                            <span className="sr-only">Copy link</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-neutral-400 h-8 w-8 p-0 hover:bg-neutral-900 rounded-full hover:text-white"
                        >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                        </Button>
                    </div>
                </div>

                <div className="flex mt-4 items-center justify-between gap-2 text-sm">
                    <a
                        href={`https://github.com/${project.repo}`}
                        className="flex w-fit gap-2 pr-4 p-[7px] items-center font-light bg-neutral-900 border-neutral-700/50 border rounded-full"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img
                            src="/github-mark-white.svg"
                            className="h-6 w-6 aspect-square"
                            alt="GitHub logo"
                        />
                        <span className="font-medium text-neutral-400">
                            {project.repo.toLowerCase().length > 24
                                ? `${project.repo
                                      .toLowerCase()
                                      .slice(0, 24)}...`
                                : project.repo.toLowerCase()}
                        </span>
                    </a>
                    <div className="flex items-center space-x-2 text-sm">
                        <div className="flex items-center space-x-2 rounded-full bg-neutral-800/30 px-3 py-1">
                            <GitBranch className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-full bg-neutral-800/30 px-3 py-1">
                            <div className="w-2 h-2 rounded-full bg-neutral-400" />
                            <span className="text-neutral-400 -translate-y-[1.5px]">
                                {project.branch}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex text-xs mt-3 items-center gap-2 translate-x-1">
                    <span className="text-neutral-600">Framework: </span>
                    <span className="font-medium text-neutral-600 group-hover:text-neutral-500">
                        {detectFrameworkImage(project.outputDir).name}
                    </span>
                </div>
            </Card>
        </Link>
    );
}
