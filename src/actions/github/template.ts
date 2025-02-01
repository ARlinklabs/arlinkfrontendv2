import { TemplatesResponse, TemplateSubmission } from "@/types";
import { Octokit } from "@octokit/rest";
import { createDataItemSigner, connect } from "@permaweb/aoconnect";
import { useAoSigner } from "@project-kardeshev/ao-wallet-kit";

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
    const TARGET_PROCESS = "6M87yicVAKQzGkMrjLZKaomLbBj2BdRCWM-WUFpWHr4";
    const ao = connect();
    const signer = useAoSigner();
    try {
        // Send template submission message
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
            ],
            signer: createDataItemSigner(signer),
        });

        console.log("Template submission message sent with ID:", message);

        // Wait for and get the response
        const { Messages, Error } = await ao.result({
            message: message,
            process: TARGET_PROCESS,
        });

        // Log the response messages
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
    const ao = connect();
    const TARGET_PROCESS = "6M87yicVAKQzGkMrjLZKaomLbBj2BdRCWM-WUFpWHr4";

    try {
        const response = await ao.dryrun({
            process: TARGET_PROCESS,
            tags: [{ name: "Action", value: "GetTemplates" }],
        });

        console.log("🔍 Dry run response:", response);

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
                console.log("📋 Parsed templates:", parsedData);

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
