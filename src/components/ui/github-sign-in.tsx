import {
  
    handleGitHubCallback,
    handleGitHubCallbackTemplate,
    initiateGitHubAuth,
    initiateGitHubAuthForTemplate,
} from "@/actions/github";
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/store/useGlobalState";
import { Github } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function GitHubSignInTemplate() {
    const [isLoading, setIsLoading] = useState(false);

    const { githubToken, setGithubToken } = useGlobalState();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleAuth = async () => {
            const code = searchParams.get("code");
            if (code && !githubToken) {
                try {
                    const token = await handleGitHubCallbackTemplate(code);
                    setGithubToken(token);
                    
                    window.history.replaceState(
                        {},
                        "",
                        window.location.pathname,
                    );
                } catch (error) {
                    console.log("Failed to authenticate with github", error);
                }
            }
        };
        if (!githubToken) {
            handleAuth();
        }
    }, [searchParams, githubToken]);

    // handlers
    const handleGithubLogin = async () => {
        setIsLoading(true);
        await initiateGitHubAuthForTemplate();
        setIsLoading(false);
    };

    useEffect(() => {
        console.log(githubToken);
    }, [githubToken]);

    return (
        <Button
            variant="outline"
            className="w-fit bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700 hover:text-white"
            onClick={() => {
                handleGithubLogin();
            }}
        >
            <Github className="mr-2 h-4 w-4" />
            {isLoading ? "Connecting..." : "Connect GitHub Account"}
        </Button>
    );
}
 /// this is same thing runs int he dropdown.tsx  code , this can be removed in the future
export function GitHubSignInDeploy() {
    const [isLoading, setIsLoading] = useState(false);

    const { githubToken, setGithubToken } = useGlobalState();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleAuth = async () => {
            const code = searchParams.get("code");
            if (code && !githubToken) {
                try {
                    const token = await handleGitHubCallback(code);
                    setGithubToken(token);
                   
                    window.history.replaceState(
                        {},
                        "",
                        window.location.pathname,
                    );
                } catch (error) {
                    console.log("Failed to authenticate with github", error);
                }
            }
        };
        if (!githubToken) {
            handleAuth();
        }
    }, [searchParams, githubToken]);

    // handlers
    const handleGithubLogin = async () => {
        setIsLoading(true);
        await initiateGitHubAuth();
        setIsLoading(false);
    };

    useEffect(() => {
        console.log(githubToken);
    }, [githubToken]);

    return (
        <Button
            variant="outline"
            className="w-fit bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700 hover:text-white"
            onClick={() => {
                handleGithubLogin();
            }}
        >
            <Github className="mr-2 h-4 w-4" />
            {isLoading ? "Connecting..." : "Connect GitHub Account"}
        </Button>
    );
}
