import { GITHUB_CLIENT_ID, GITHUB_CLIENT_ID_TEMPLATE } from "@/config";
import { BUILDER_BACKEND } from "@/lib/utils";
import { Octokit } from "@octokit/rest";

export function createOctokit(token: string): Octokit {
    return new Octokit({ auth: token });
}

export async function initiateGitHubAuth() {
    const BASE_URL =
        import.meta.env.VITE_ENV === "test"
            ? "http://localhost:3000"
            : "https://arlink.ar.io";

    const redirectUri = `${BASE_URL}/deploy`;
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=repo,read:org,repo:status,read:user,admin:repo_hook`;
    window.location.href = authUrl;
}

export async function initiateGitHubAuthForTemplate() {
    const BASE_URL =
        import.meta.env.VITE_ENV === "test"
            ? "http://localhost:3000"
            : "https://arlink.ar.io";

    const redirectUri = `${BASE_URL}/templates/upload`;
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID_TEMPLATE}&redirect_uri=${redirectUri}&scope=repo`;

    window.location.href = authUrl;
}

export async function handleGitHubCallback(code: string): Promise<string> {
    const tokenUrl = `${BUILDER_BACKEND}/github/callback`;
    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(
            data.error_description || "Failed to obtain access token",
        );
    }

    return data.access_token;
}

export async function handleGitHubCallbackTemplate(
    code: string,
): Promise<string> {
    const tokenUrl = `${BUILDER_BACKEND}/github/template-callback`;
    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(
            data.error_description || "Failed to obtain access token",
        );
    }

    return data.access_token;
}


