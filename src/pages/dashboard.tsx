"use client";

import { useEffect, useState, useMemo } from "react";
import {
	Loader,
	Search,
	Grid,
	List,
	Link2,
	MoreVertical,
	GitBranch,
	Clock,
	Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConnection, useActiveAddress } from "arweave-wallet-kit";
import Layout from "@/layouts/layout";
import useDeploymentManager from "@/hooks/useDeploymentManager";
import type { TDeployment } from "@/types/index";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboardcomp = () => {
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState("activity");
	const { connected } = useConnection();
	const address = useActiveAddress();
	const { managerProcess, deployments, refresh } = useDeploymentManager();

	// useEffect(() => {
	// 	console.log("connected", connected, address);
	// 	refresh();
	// }, [connected, address, refresh]);

	const formatProjectData = (deployments: TDeployment[]) => {
		return deployments.map((dep: TDeployment) => ({
			id: dep.ID,
			name: dep.Name,
			url: dep.RepoUrl,
			repo: dep.RepoUrl.split("/").slice(-2).join("/"),
			link: `/deployments/${dep.Name}`,
			createdAt: dep.ID, // Using ID as a proxy for creation time
		}));
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const projects = useMemo(() => formatProjectData(deployments), [deployments]);

	const filteredAndSortedProjects = useMemo(() => {
		return projects
			.filter(
				(project) =>
					project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					project.repo.toLowerCase().includes(searchTerm.toLowerCase()),
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

	const SkeletonCards = () => (
		<div
			className={`grid ${
				viewMode === "grid"
					? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
					: "grid-cols-1"
			} gap-[20px]`}
		>
			{[1, 2, 3, 4, 5, 6].map((i) => (
				<Card key={i} className="bg-neutral-950 border-[#383838]">
					<CardHeader className="p-4 pb-2">
						<div className="flex items-start justify-between">
							<div className="flex items-start space-x-3">
								<Skeleton className="w-12 h-12 rounded-lg bg-neutral-800/50" />
								<div className="space-y-1.5">
									<Skeleton className="h-5 w-40 bg-neutral-800/50" />
									<Skeleton className="h-4 w-48 bg-neutral-800/50" />
								</div>
							</div>
							<div className="flex items-center space-x-1">
								<div className="rounded-full p-2 hover:bg-neutral-800/50">
									<Link2 className="w-4 h-4 text-neutral-400" />
								</div>
								<div className="rounded-full p-2 hover:bg-neutral-800/50">
									<MoreVertical className="w-4 h-4 text-neutral-400" />
								</div>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-4 pt-2 space-y-4">
						<div className="flex items-center space-x-2 text-sm">
							<div className="flex items-center space-x-2 rounded-full bg-neutral-800/30 px-3 py-1">
								<GitBranch className="w-4 h-4 text-neutral-400" />
							</div>
							<div className="flex items-center space-x-2 rounded-full bg-neutral-800/30 px-3 py-1">
								<div className="w-2 h-2 rounded-full bg-neutral-400" />
								<span className="text-neutral-400">main</span>
							</div>
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-32 bg-neutral-800/50" />
							<div className="flex items-center space-x-2 text-neutral-400 text-sm">
								<Clock className="w-4 h-4" />
								<Skeleton className="h-4 w-20 bg-neutral-800/50" />
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);

	useEffect(() => {
		console.log(deployments);
	}, [deployments]);

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
								<SelectItem value="activity">Sort by newest</SelectItem>
								<SelectItem value="created">Sort by oldest</SelectItem>
								<SelectItem value="name">Sort by name</SelectItem>
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

				{!managerProcess && (
					<div className="relative min-h-[200px]">
						<SkeletonCards />
					</div>
				)}

				{managerProcess && deployments.length === 0 && (
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
				)}

				{managerProcess && deployments.length > 0 && (
					<div
						className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}
					>
						{filteredAndSortedProjects.map((project) => (
							<Link
								to={`/deployment?repo=${project.name}`}
								key={project.id}
								className="block"
							>
								<Card className="group bg-black border-[#383838] hover:border-slate-400 transition-colors duration-200">
									<CardHeader className="p-4">
										<div className="flex items-center space-x-4">
											<div
												className="w-10 h-10 rounded-md flex-shrink-0"
												style={{
													background:
														"linear-gradient(to bottom right, #00ff00, #32cd32, #98fb98, #00fa9a, #00bfff, #ffd700)",
												}}
											/>
											<div className="flex-1 min-w-0">
												<CardTitle className="text-lg font-semibold text-neutral-200 truncate">
													{project.name}
												</CardTitle>
												<p className="text-sm text-neutral-400 truncate">
													{project.url}
												</p>
											</div>
										</div>
									</CardHeader>
									<CardContent className="px-4 pb-4 pt-0">
										<p className="text-sm text-neutral-400 truncate">
											{project.repo}
										</p>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)}
			</div>
		</Layout>
	);
};

export default Dashboardcomp;
