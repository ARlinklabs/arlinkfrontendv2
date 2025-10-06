"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, Grid, List, Plus, RocketIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/layouts/layout";
import useDeploymentManager from "@/hooks/use-deployment-manager";

import type { TDeployment } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectCard } from "@/components/project-card";
import { ProjectCardSkeleton } from "@/components/skeletons";


const Dashboardcomp = () => {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("activity");
    const { managerProcess, deployments, isRefreshing, walletAddress } = useDeploymentManager();
    const [cardsLimit, setCardsLimit] = useState(12);
    const navigate = useNavigate();
    const [managerProcessExists, setManagerProcessExists] = useState<boolean>(true);
    const [showNoDeployments, setShowNoDeployments] = useState<boolean>(false);

    const formatProjectData = (deployments: TDeployment[]) => {
        return deployments.map((dep: TDeployment) => ({
            arnsProcess: dep.ArnsProcess,
            id: dep.ID,
            name: dep.Name,
            url: dep.RepoUrl,
            repo: dep.RepoUrl.split("/").slice(-2).join("/"),
            repoUrl: dep.RepoUrl,
            link: `/deployments/${dep.Name}`,
            createdAt: dep.ID,
            branch: dep.Branch,
            outputDir: dep.OutputDIR,
            deploymentId: dep.DeploymentId,
            UnderName: dep.UnderName,
        }));
    };

    const projects = useMemo(
        () => formatProjectData(deployments),
        [deployments],
    );

    const filteredAndSortedProjects = useMemo(() => {
        return projects
            .filter(
                (project) =>
                    project.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    project.repo
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
            )
            .sort((a, b) => {
                if (sortBy === "name") {
                    return a.name.localeCompare(b.name);
                }
                if (sortBy === "created") {
                    return a.createdAt - b.createdAt;
                }
                return b.createdAt - a.createdAt;
            });
    }, [projects, searchTerm, sortBy]);

    // Determine if we should show loading state (memoized to prevent re-renders)
    const shouldShowLoading = useCallback(() => {
        return (
            isRefreshing || 
            (walletAddress && !managerProcess) ||
            (walletAddress && managerProcess && deployments.length === 0 && !showNoDeployments)
        );
    }, [isRefreshing, walletAddress, managerProcess, deployments.length, showNoDeployments]);

    // Update manager process existence state
    useEffect(() => {
        setManagerProcessExists(!!managerProcess);
    }, [managerProcess]);

    // Handle showing "no deployments found"
    useEffect(() => {
        if (deployments.length > 0) {
            setShowNoDeployments(false);
        } else if (walletAddress && managerProcess && !isRefreshing) {
            setShowNoDeployments(true);
        } else {
            setShowNoDeployments(false);
        }
    }, [deployments.length, walletAddress, managerProcess, isRefreshing]);

    return (
        <Layout>
            <div className="md:container px-4 mx-auto py-8 ">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="relative w-full md:max-w-[600px]">
                        <Search className="absolute left-3 top-1/2 h-[18px] md:h-[20px] w-[18px] md:w-[20px] transform -translate-y-1/2 text-neutral-600" />
                        <Input
                            className="pl-10 w-full rounded-md bg-arlink-bg-secondary-color hover:border-neutral-600 transition-colors placeholder:text-neutral-400 font-light border-[#383838] focus:ring-neutral-700 focus-visible:ring-neutral-700 text-sm md:text-base"
                            placeholder="Search Repositories and Projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="px-4 text-sm w-[180px] md:text-base bg-arlink-bg-secondary-color hover:border-neutral-600 border-[#383838] focus:ring-neutral-700">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="bg-arlink-bg-secondary-color border-[#383838] text-sm md:text-base">
                                <SelectItem value="activity">
                                    Sort by newest
                                </SelectItem>
                                <SelectItem value="created">
                                    Sort by oldest
                                </SelectItem>
                                <SelectItem value="name">
                                    Sort by name
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={() => setViewMode("grid")}
                            className="border-[#383838] md:block hidden bg-arlink-bg-secondary-color hover:bg-neutral-900 hover:border-neutral-600 p-2 md:p-3"
                        >
                            <Grid className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setViewMode("list")}
                            className="border-[#383838] md:block hidden bg-arlink-bg-secondary-color hover:bg-neutral-900 hover:border-neutral-600 p-2 md:p-3"
                        >
                            <List className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        
                        <Button
                            onClick={() => navigate("/deploy")}
                            className="font-semibold text-sm md:text-base px-3 py-2 md:px-4 md:py-2"
                            disabled={!managerProcessExists}
                        >
                            <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />{" "}
                            Add deployment
                        </Button>
                    </div>
                </div>

                {shouldShowLoading() ? (
                    <ProjectCardSkeleton viewMode={viewMode} />
                ) : deployments.length > 0 ? (
                    <div
                        className={`grid ${
                            viewMode === "grid"
                                ? "md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                                : "grid-cols-1"
                        } gap-6`}
                    >
                        {filteredAndSortedProjects
                            .slice(0, cardsLimit)
                            .map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))}
                    </div>
                ) : showNoDeployments ? (
                    <NoDeploymentFoundCard />
                ) : (
                    <ProjectCardSkeleton viewMode={viewMode} />
                )}

                {cardsLimit < deployments.length && (
                    <Button
                        type="button"
                        variant={"outline"}
                        className="border-[#383838]  w-full bg-arlink-bg-secondary-color hover:bg-neutral-900 hover:border-neutral-600 mt-6"
                        onClick={() => setCardsLimit((prev) => prev + 10)}
                    >
                        Show more
                    </Button>
                )}
            </div>
        </Layout>
    );
};

export default Dashboardcomp;

const NoDeploymentFoundCard = () => {
    return (
        <Card className="bg-arlink-bg-secondary-color border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                <RocketIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                    No deployments yet
                </h3>
                <p className="text-muted-foreground mb-6">
                    Start your first deployment and bring your project to life!
                </p>
                <Link to="/deploy">
                    <Button variant="default" className="font-semibold">
                        Create Your First Deployment
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};
