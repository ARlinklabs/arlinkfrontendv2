// import type { Repository } from "@/index";
// import { Octokit } from "@octokit/rest";
// import { toast } from "sonner";

// export async function fetchRepositories({
// 	githubToken,
// 	setRepositories,
// }: {
// 	githubToken: string | null;
// 	setRepositories: React.Dispatch<React.SetStateAction<Repository[]>>

// }) {
// 	if (!githubToken) return;
// 	const octokit = new Octokit({ auth: githubToken });
// 	let allRepos: Repository[] = [];
// 	let page = 1;

// 	try {
// 		while (true) {
// 			const response = await octokit.repos.listForAuthenticatedUser({
// 				per_page: 100,
// 				page: page,
// 			});

// 			if (response.data.length === 0) {
// 				break;
// 			}

// 			allRepos = allRepos.concat(response.data as Repository[]);
// 			page++;
// 		}

// 		setRepositories(allRepos);
// 	} catch (error) {
// 		console.error("Error fetching repositories:", error);
// 		toast.error("Failed to fetch repositories");
// 	}
// }

//

import type { Repository } from "@/index";
import { Octokit } from "@octokit/rest";
import { toast } from "sonner";

export async function fetchRepositories({
	githubToken,
	setRepositories,
}: {
	githubToken: string | null;
	setRepositories: React.Dispatch<React.SetStateAction<Repository[]>>;
}) {
	if (!githubToken) return;

	const octokit = new Octokit({ auth: githubToken });
	const { data: user } = await octokit.users.getAuthenticated();
	console.log("Authenticated as:", user.login);
	try {
		const response = await octokit.repos.listForAuthenticatedUser({
			per_page: 100,
			page: 1, 
			sort: "updated", 
			direction: "desc",
		});

		setRepositories(response.data as Repository[]);
	} catch (error) {
		console.error("Error fetching repositories:", error);
		toast.error("Failed to fetch repositories");
	}
}

export async function fetchRepositoryByName({
	githubToken,
	repo,
}: {
	githubToken: string | null;
	repo: string;
}): Promise<Repository | null> {
	if (!githubToken) {
		toast.error("No GitHub token provided");
		return null;
	}

	const octokit = new Octokit({ auth: githubToken });

	try {
		const { data: user } = await octokit.users.getAuthenticated();

		const response = await octokit.repos.get({
			owner: user.login,
			repo,
		});

		return response.data as Repository;
	} catch (error) {
		console.error("Error fetching repository:", error);
		if ((error as { status?: number }).status === 404) {
			toast.error("Repository not found");
		} else if ((error as { status?: number }).status === 401) {
			toast.error("Invalid or expired GitHub token");
		} else if ((error as { status?: number }).status === 403) {
			toast.error("Token doesn't have required permissions");
		} else {
			toast.error("Failed to fetch repository");
		}
		return null;
	}
}
