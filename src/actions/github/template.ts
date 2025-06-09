import {
    TemplateDetails,
    TemplatesResponse,
    TemplateSubmission,
} from "@/types";
import { Octokit } from "@octokit/rest";
import { createDataItemSigner, connect } from "@permaweb/aoconnect";

const TARGET_PROCESS = "6M87yicVAKQzGkMrjLZKaomLbBj2BdRCWM-WUFpWHr4";

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

export async function submitTemplate(template: TemplateSubmission) {
    const ao = connect({
        CU_URL: "https://ur-cu.randao.net",
        MODE: "legacy",
    });

    try {
        const message = await ao.message({
            process: TARGET_PROCESS,
            tags: [
                { name: "Action", value: "SubmitTemplate" },
                { name: "Name", value: template.name },
                { name: "Description", value: template.description },
                { name: "RepoUrl", value: template.repoUrl },
                { name: "Framework", value: template.framework },
                { name: "UseCase", value: template.useCase },
                { name: "ThumbnailUrl", value: template.thumbnailUrl },
                { name: "CreatorName", value: template.creatorName },
                { name: "SubmissionCode", value: template.submissionCode },
                { name: "DemoUrl", value: template.demoUrl },
            ],
            signer: createDataItemSigner(window.arweaveWallet),
        });

        // console.log("Template submission message sent with ID:", message);

        const { Messages, Error } = await ao.result({
            message: message,
            process: TARGET_PROCESS,
        });

        if (Messages && Messages.length > 0) {
            console.log("Response Messages:", Messages);
        }

        if (Error) {
            console.error("Error received:", Error);
        }

        return {
            messageId: message,
            response: Messages,
            error: Error,
        };
    } catch (error) {
        console.error("Template submission failed:", error);
        throw error;
    }
}
export async function getAllTemplates() {
    const ao = connect({
        CU_URL: "https://ur-cu.randao.net",
        MODE: "legacy",
    });

    try {
        const response = await ao.dryrun({
            process: TARGET_PROCESS,
            tags: [{ name: "Action", value: "GetTemplates" }],
        });

        // console.log("🔍 Dry run response:", response);

        if (response.Messages && response.Messages.length > 0) {
            const message = response.Messages[0];

            const statusTag = message.Tags.find(
                (tag: any) => tag.name === "Status",
            );
            if (statusTag?.value !== "Success") {
                console.error("❌ Response status not successful");
                return {
                    templates: [],
                    total: 0,
                    error: "Response status not successful",
                };
            }

            try {
                // Parse the Data field which contains the templates
                const parsedData: TemplatesResponse = JSON.parse(message.Data);
                // console.log("📋 Parsed templates:", parsedData);

                return {
                    templates: parsedData.templates.map((template) => ({
                        ...template,
                        // Ensure consistent casing in properties
                        framework: template.Framework,
                        description: template.Description,
                        creatorWallet: template.CreatorWallet,
                        repoUrl: template.RepoUrl,
                        name: template.Name,
                        id: template.ID,
                        createdAt: template.CreatedAt,
                        creatorName: template.CreatorName,
                        stars: template.Stars,
                        useCase: template.UseCase,
                        thumbnailUrl: template.ThumbnailUrl,
                    })),
                    total: parsedData.total,
                    error: null,
                };
            } catch (parseError) {
                console.error("❌ Error parsing template data:", parseError);
                return {
                    templates: [],
                    total: 0,
                    error: "Failed to parse template data",
                };
            }
        }

        if (response.Error) {
            console.error("❌ Error retrieving templates:", response.Error);
            return {
                templates: [],
                total: 0,
                error: response.Error,
            };
        }

        return {
            templates: [],
            total: 0,
            error: "No templates found",
        };
    } catch (error) {
        console.error("❌ Failed to get templates:", error);
        throw error;
    }
}

interface SubmissionCodeResponse {
    messageId: string;
    code?: string;
    error?: string;
}

export async function generateSubmissionCode(): Promise<SubmissionCodeResponse> {
    const ao = connect({
        CU_URL: "https://cu.ardrive.io",
        MODE: "legacy",
    });

    try {
        const message = await ao.message({
            process: TARGET_PROCESS,
            tags: [{ name: "Action", value: "GenerateSubmissionCode" }],
            signer: createDataItemSigner(window.arweaveWallet),
        });

        // console.log("🎫 Code generation message sent with ID:", message);

        const { Messages, Error } = await ao.result({
            message: message,
            process: TARGET_PROCESS,
        });

        if (Messages && Messages.length > 0) {
            const code = Messages[0].Tags.find(
                (tag: { name: string }) => tag.name === "Code",
            )?.value;
            return {
                messageId: message,
                code: code,
            };
        }

        if (Error) {
            console.error("❌ Error generating code:", Error);
            return {
                messageId: message,
                error: Error,
            };
        }

        return {
            messageId: message,
            error: "No response received",
        };
    } catch (error) {
        console.error("❌ Failed to generate code:", error);
        throw error;
    }
}

interface TemplateDetailsRequest {
    framework: string;
    templateName: string;
    templateId: string;
}

// Get specific template details using dryrun
export async function getTemplateDetails(details: TemplateDetailsRequest) {
    const ao = connect({
        CU_URL: "https://ur-cu.randao.net",
        MODE: "legacy",
    });

    try {
        const response = await ao.dryrun({
            process: TARGET_PROCESS,
            tags: [
                { name: "Action", value: "GetTemplateByDetails" },
                { name: "Framework", value: details.framework },
                { name: "TemplateName", value: details.templateName },
                { name: "TemplateId", value: details.templateId },
            ],
        });

        // console.log("🔍 Dry run response for template details:", response);

        if (response.Messages && response.Messages.length > 0) {
            const message = response.Messages[0];

            // Check response status
            const statusTag = message.Tags.find(
                (tag: { name: string }) => tag.name === "Status",
            );
            if (statusTag?.value !== "Success") {
                console.error("❌ Template details status not successful");
                return {
                    template: null,
                    status: "error",
                    error: `Template not found: ${
                        statusTag?.value || "Unknown error"
                    }`,
                };
            }

            try {
                const parsedData = JSON.parse(message.Data);
                // console.log("📋 Parsed template details:", parsedData);

                if (parsedData.template) {
                    const templateDetails: TemplateDetails = {
                        ...parsedData.template,
                        framework: parsedData.template.framework,
                        description: parsedData.template.description,
                        creatorWallet: parsedData.template.creatorWallet,
                        repoUrl: parsedData.template.repoUrl,
                        name: parsedData.template.name,
                        id: parsedData.template.id,
                        createdAt: parsedData.template.createdAt,
                        creatorName: parsedData.template.creatorName,
                        useCase: parsedData.template.useCase,
                        thumbnailUrl: parsedData.template.thumbnailUrl,
                        stats: parsedData.template.stats,
                    };
                    // console.log("🔍 Template details:", templateDetails);
                    return {
                        template: templateDetails,
                        status: "success",
                        error: null,
                    };
                }
            } catch (parseError) {
                console.error("❌ Error parsing template details:", parseError);
                return {
                    template: null,
                    status: "error",
                    error: "Failed to parse template details",
                };
            }
        }

        if (response.Error) {
            console.error(
                "❌ Error retrieving template details:",
                response.Error,
            );
            return {
                template: null,
                status: "error",
                error: response.Error,
            };
        }

        return {
            template: null,
            status: "error",
            error: "Template not found",
        };
    } catch (error) {
        console.error("❌ Failed to get template details:", error);
        throw error;
    }
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
