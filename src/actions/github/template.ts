import {
    TemplateDashboard,
    TemplatesResponse,
} from "@/types";
import { Octokit } from "@octokit/rest";
import staticTemplates from "@/data/templates.json";

export async function forkRepository(
    githubToken: string,
    owner: string,
    repo: string,
) {
    try {
        const octokit = new Octokit({
            auth: githubToken,
            previews: ["hellcat-preview"],
        });
        const response = await octokit.repos.createFork({
            owner,
            repo,
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error forking repository:", error);
        return { success: false, error: "Failed to fork repository" };
    }
}


export async function getAllTemplates(): Promise<TemplatesResponse & { error?: string }> {
    const templates = staticTemplates as TemplateDashboard[];
    return {
        templates,
        total: templates.length,
    };
}


export async function getTemplateDetails(details: {
    framework: string;
    templateName: string;
    templateId: string;
}) {
    const templates = staticTemplates as TemplateDashboard[];
    const found = templates.find((t) => t.ID === details.templateId);
    if (!found) {
        return { template: null, status: "error", error: "Template not found" };
    }
    return {
        template: {
            id: found.ID,
            framework: found.Framework,
            description: found.Description,
            creatorWallet: found.CreatorWallet,
            repoUrl: found.RepoUrl || "",
            name: found.Name,
            createdAt: found.CreatedAt,
            creatorName: found.CreatorName,
            useCase: found.UseCase,
            thumbnailUrl: found.ThumbnailUrl,
            demoUrl: found.DemoUrl,
        },
        status: "success",
    };
}

export async function getRepoReadme(
    owner: string,
    repo: string,
    path?: string,
): Promise<{
    content: string | null;
    error: boolean;
    errorType: "server" | "not-found" | null;
}> {
    try {
        const branches = ["main", "master"];
        const readmePath = path ? `${path}/README.md` : "README.md";

        for (const branch of branches) {
            try {
                const response = await fetch(
                    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${readmePath}`,
                );

                if (response.ok) {
                    const content = await response.text();
                    return {
                        content,
                        error: false,
                        errorType: null,
                    };
                }
            } catch (e) {
                console.log(e);
            }
        }

        return {
            content: null,
            error: true,
            errorType: "not-found",
        };
    } catch (error) {
        console.error(error);
        return {
            content: null,
            error: true,
            errorType: "server",
        };
    }
}
