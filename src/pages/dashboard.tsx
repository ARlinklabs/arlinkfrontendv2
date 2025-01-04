"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Grid, List, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConnection, useActiveAddress } from "arweave-wallet-kit";
import Layout from "@/layouts/layout";
import useDeploymentManager from "@/hooks/useDeploymentManager";
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
import { useGlobalState } from "@/store/useGlobalState";
import { handleGitHubCallback } from "@/components/Githubloginbutton";

const Dashboardcomp = () => {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("activity");
    const [noDeploymentFound, setNoDeploymentFound] = useState<boolean>(false);

    //  doubts state
    const address = useActiveAddress();
    const { connected } = useConnection();
    const { managerProcess, deployments, refresh } = useDeploymentManager();
    // const { setGithubToken, githubToken } = useGlobalState();
    const [searchParams] = useSearchParams();

    const [cardsLimit, setCardsLimit] = useState(0);
    // useEffect(() => {
    // 	console.log("connected", connected, address);
    // 	refresh();
    // }, [connected, address, refresh]);

    const demoDeployments: TDeployment[] = [
        {
            ID: 1,
            Name: "Marketing Website",
            RepoUrl: "https://github.com/company/marketing-site",
            InstallCMD: "npm install",
            Branch: "main",
            BuildCMD: "npm run build",
            OutputDIR: ".next",
            ArnsProcess:
                "arn:aws:lambda:us-east-1:123456789012:function:marketing-site",
            DeploymentId: "dep_mk1",
            DeploymentHash: "8f4j2m1",
        },
        {
            ID: 2,
            Name: "Admin Dashboard",
            RepoUrl: "https://github.com/company/admin-panel",
            InstallCMD: "yarn install",
            Branch: "production",
            BuildCMD: "yarn build",
            OutputDIR: "./build",
            ArnsProcess:
                "arn:aws:lambda:us-east-1:123456789012:function:admin-dashboard",
            DeploymentId: "dep_ad1",
            DeploymentHash: "9k3l2n8",
        },
        {
            ID: 3,
            Name: "Customer Portal",
            RepoUrl: "https://github.com/company/customer-portal",
            InstallCMD: "pnpm install",
            Branch: "stable",
            BuildCMD: "pnpm build",
            OutputDIR: "./dist",
            ArnsProcess:
                "arn:aws:lambda:us-east-1:123456789012:function:customer-portal",
            DeploymentId: "dep_cp1",
            DeploymentHash: "7h5g3f2",
        },
        {
            ID: 4,
            Name: "Documentation Site",
            RepoUrl: "https://github.com/company/docs",
            InstallCMD: "npm ci",
            Branch: "main",
            BuildCMD: "npm run build",
            OutputDIR: "./public",
            ArnsProcess:
                "arn:aws:lambda:us-east-1:123456789012:function:docs-site",
            DeploymentId: "dep_ds1",
            DeploymentHash: "4r6t8y1",
        },
        {
            ID: 5,
            Name: "E-commerce Frontend",
            RepoUrl: "https://github.com/company/shop",
            InstallCMD: "yarn",
            Branch: "master",
            BuildCMD: "yarn build",
            OutputDIR: "./out",
            ArnsProcess:
                "arn:aws:lambda:us-east-1:123456789012:function:ecommerce",
            DeploymentId: "dep_ec1",
            DeploymentHash: "2w3e4r5",
        },
        {
            ID: 6,
            Name: "Blog Platform",
            RepoUrl: "https://github.com/company/blog",
            InstallCMD: "npm install",
            Branch: "development",
            BuildCMD: "npm run build",
            OutputDIR: ".next",
            ArnsProcess: "arn:aws:lambda:us-east-1:123456789012:function:blog",
            DeploymentId: "dep_bp1",
            DeploymentHash: "5t6y7u8",
        },
        {
            ID: 7,
            Name: "Analytics Dashboard",
            RepoUrl: "https://github.com/company/analytics",
            InstallCMD: "yarn install",
            Branch: "main",
            BuildCMD: "yarn build",
            OutputDIR: "./build",
            ArnsProcess:
                "arn:aws:lambda:us-east-1:123456789012:function:analytics",
            DeploymentId: "dep_an1",
            DeploymentHash: "9i8u7y6",
        },
        {
            ID: 8,
            Name: "Support Portal",
            RepoUrl: "https://github.com/company/support",
            InstallCMD: "pnpm install",
            Branch: "stable",
            BuildCMD: "pnpm build",
            OutputDIR: "./dist",
            ArnsProcess:
                "arn:aws:lambda:us-east-1:123456789012:function:support",
            DeploymentId: "dep_sp1",
            DeploymentHash: "1q2w3e4",
        },
        {
            ID: 9,
            Name: "Landing Page",
            RepoUrl: "https://github.com/company/landing",
            InstallCMD: "npm install",
            Branch: "production",
            BuildCMD: "npm run build",
            OutputDIR: "./out",
            ArnsProcess:
                "arn:aws:lambda:us-east-1:123456789012:function:landing",
            DeploymentId: "dep_lp1",
            DeploymentHash: "5t6y7u8",
        },
        {
            ID: 10,
            Name: "Developer Portal",
            RepoUrl: "https://github.com/company/dev-portal",
            InstallCMD: "yarn",
            Branch: "main",
            BuildCMD: "yarn build",
            OutputDIR: "./public",
            ArnsProcess:
                "arn:aws:lambda:us-east-1:123456789012:function:dev-portal",
            DeploymentId: "dep_dp1",
            DeploymentHash: "9o0p1q2",
        },
        {
            ID: 11,
            Name: "Internal Tools",
            RepoUrl: "https://github.com/company/internal-tools",
            InstallCMD: "npm ci",
            Branch: "master",
            BuildCMD: "npm run build",
            OutputDIR: "./build",
            ArnsProcess:
                "arn:aws:lambda:us-east-1:123456789012:function:internal-tools",
            DeploymentId: "dep_it1",
            DeploymentHash: "3w4e5r6",
        },
        {
            ID: 12,
            Name: "API Documentation",
            RepoUrl: "https://github.com/company/api-docs",
            InstallCMD: "pnpm install",
            Branch: "main",
            BuildCMD: "pnpm build",
            OutputDIR: "./dist",
            ArnsProcess:
                "arn:aws:lambda:us-east-1:123456789012:function:api-docs",
            DeploymentId: "dep_ad1",
            DeploymentHash: "7t8y9u0",
        },
    ];
    const formatProjectData = (deployments: TDeployment[]) => {
        return deployments.map((dep: TDeployment) => ({
            arnsProcess: dep.ArnsProcess,
            id: dep.ID,
            name: dep.Name,
            url: dep.RepoUrl,
            repo: dep.RepoUrl.split("/").slice(-2).join("/"),
            repoUrl: dep.RepoUrl,
            link: `/deployments/${dep.Name}`,
            createdAt: dep.ID, // Using ID as a proxy for creation time
            branch: dep.Branch,
            outputDir: dep.OutputDIR,
            deploymentId: dep.DeploymentId,
        }));
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const projects = useMemo(
        () => formatProjectData(deployments),
        [deployments]
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
                        .includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                if (sortBy === "name") {
                    return a.name.localeCompare(b.name);
                }
                if (sortBy === "created") {
                    return a.createdAt - b.createdAt;
                }
                // Default to "activity" (which is the reverse order of the original array)
                return b.createdAt - a.createdAt;
            });
    }, [projects, searchTerm, sortBy]);

    // useEffect(() => {
    // 	// initial checkup
    // 	// if the user already has the github token we set the value of drop down to this
    // 	const handleAuth = async () => {
    // 		const code = searchParams.get("code");

    // 		// generating token with the code
    // 		if (code) {
    // 			try {
    // 				const token = await handleGitHubCallback(code);
    // 				setGithubToken(token);
    // 				await checkAndInstallGitHubApp(token);
    // 				window.history.replaceState({}, "", window.location.pathname);
    // 				onSuccess("1");
    // 			} catch (error) {
    // 				console.log("Failed to authenticate with github", error);
    // 			} finally {
    // 				setLoadingId(null);
    // 			}
    // 		}
    // 	};

    // 	// if we don't have github token then we call this function to set the github token
    // 	if (!githubToken) {
    // 		handleAuth();
    // 	}
    // }, [searchParams]);

    useEffect(() => {
        setCardsLimit(Math.min(deployments.length, 10));
    }, [deployments]);

    useEffect(() => {
        if (!noDeploymentFound) {
            let intervalId = null;
            intervalId = setTimeout(() => {
                setNoDeploymentFound(true);
            }, 10000);
            return () => {
                clearInterval(intervalId);
            };
        }
    }, [noDeploymentFound]);

    return (
        <Layout>
            <div className="container mx-auto py-8 ">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="relative w-full md:max-w-[600px]">
                        <Search className="absolute left-3 top-1/2 h-[20px] w-[20px] transform -translate-y-1/2 text-neutral-600" />
                        <Input
                            className="pl-10 w-full rounded-md bg-arlink-bg-secondary-color hover:border-neutral-600 transition-colors placeholder:text-neutral-400 font-light border-[#383838]  focus:ring-neutral-700 focus-visible:ring-neutral-700 "
                            placeholder="Search Repositories and Projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[180px] bg-arlink-bg-secondary-color hover:border-neutral-600 border-[#383838] focus:ring-neutral-700">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className=" bg-arlink-bg-secondary-color border-[#383838]">
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
                            className="border-[#383838]  bg-arlink-bg-secondary-color hover:bg-neutral-900 hover:border-neutral-600"
                        >
                            <Grid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setViewMode("list")}
                            className="border-[#383838]  bg-arlink-bg-secondary-color hover:bg-neutral-900 hover:border-neutral-600"
                        >
                            <List className="w-4 h-4" />
                        </Button>
                        <Link to="/deploy">
                            <Button className="font-semibold">
                                <Plus /> Add deployment
                            </Button>
                        </Link>
                    </div>
                </div>

                {deployments.length === 0 && (
                    <ProjectCardSkeleton viewMode={viewMode} />
                )}

                {deployments.length === 0 && noDeploymentFound && (
                    <NoDeploymentFoundCard />
                )}

                {managerProcess && deployments.length > 0 && (
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
        <Card className="bg-arlink-bg-secondary-color order-neutral-800">
            <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground mb-2">No deployments yet</p>
                <Link to="/deploy">
                    <Button variant="link" className="text-muted-foreground">
                        Click here to create one
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};
