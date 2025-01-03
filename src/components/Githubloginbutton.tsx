import { useCallback, useState } from "react";
import { useGlobalState } from "@/store/useGlobalState";
import { useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { BUILDER_BACKEND } from "@/lib/utils";

import { Octokit } from "@octokit/rest";
const GITHUB_CLIENT_ID = "Iv23lio5BbiK9CbfQFDT";

export async function initiateGitHubAuth() {
    const BASE_URL =
        import.meta.env.VITE_ENV === "test"
            ? "http://localhost:3000"
            : "https://arlink.arweave.net";

    const redirectUri = encodeURIComponent(`${BASE_URL}/deploy`);
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=repo`;
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
            data.error_description || "Failed to obtain access token"
        );
    }

    return data.access_token;
}

export function createOctokit(token: string): Octokit {
    return new Octokit({ auth: token });
}
// Add this new function to check GitHub app installation
export async function checkAndInstallGitHubApp(token: string) {
    //   try {
    //     // TODO: Change this builder backend import to the new one
    //     // const response = await fetch(`${BUILDER_BACKEND}/check-github-app`, {
    //     //   headers: {
    //     //     'Authorization': `Bearer ${token}`
    //     //   }
    //     // });
    //     // const data = await response.json();
    //     // if (!data.installed) {
    //     //   // If the app is not installed, open the installation page
    //     // //   window.location.href = 'https://github.com/apps/arlinkapp/installations/new';
    //     // }
    //   } catch (error) {
    //     console.error('Error checking GitHub app installation:', error);
    //   }
}

// dhruv
export function useCustomGithubAuth() {
    const { githubToken, setGithubToken } = useGlobalState();
    const [searchParams] = useSearchParams();
    const [isProcessingAuth, setIsProcessingAuth] = useState(false);

    const location = useLocation();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const handleAuth = useCallback(async () => {
        const code = searchParams.get("code");

        if (code) {
            console.log("hrllo world");
            setIsProcessingAuth(true);
            try {
                const token = await handleGitHubCallback(code);
                console.log("FITHUB TOKEN BOYS: ", githubToken);
                setGithubToken(token);
                await checkAndInstallGitHubApp(token);

                window.history.replaceState({}, "", window.location.pathname);
                return true;
            } catch (error) {
                console.error("Github auth error: ", error);
                toast.error("Failed to authenticate with github");
                return false;
            } finally {
                setIsProcessingAuth(false);
            }
        }

        if (githubToken) {
            setGithubToken(null);
            toast.success("Logged out of github");
            return true;
        }

        await initiateGitHubAuth();
        return false;
    }, [
        searchParams,
        githubToken,
        isProcessingAuth,
        setGithubToken,
        location.pathname,
    ]);

    return {
        handleAuth,
        isProcessingAuth,
    };
}
