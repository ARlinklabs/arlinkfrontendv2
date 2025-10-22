"use client";

import {
    createBrowserRouter,
    RouterProvider,
    Outlet,
    useNavigate,
} from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { lazy, Suspense, useEffect, useRef } from "react";
import { useConnection, useActiveAddress, fixConnection, walletManager } from "@/lib/wallet-strategies";
import { useGlobalState } from "@/store/useGlobalState";
import Navbar from "./components/shared/navbar";
import { Toaster } from "./components/ui/sonner";
import ErrorBoundary from "./components/ui/error-boundary";
import { handleGitHubCallback } from "@/actions/github";


// Lazy-loaded components
const Home = lazy(() => import("@/pages/index"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Deployment = lazy(() => import("@/pages/deployments/deployment"));
const DeploymentLogs = lazy(
    () => import("./pages/deployments/deployment-logs"),
);
const ComingSoon = lazy(() => import("./components/coming-soon"));
const NewDeployment = lazy(() => import("./pages/deployments/new-deployment"));
const DeploymentSetting = lazy(
    () => import("./pages/deployments/deployment-settings"),
);
const DeploymentCard = lazy(
    () => import("./pages/deployments/deployment-card"),
);
const Analytics = lazy(() => import("./pages/deployments/analytics"));
const DeploymentHistory = lazy(
    () => import("./pages/deployments/deployment-history"),
);
const BranchPreviews = lazy(() => import("./pages/deployments/branch-previews"));
const TemplateDashboard = lazy(
    () => import("./pages/template/template-dashboard"),
);
const SelectedTemplate = lazy(
    () => import("./pages/template/selected-template"),
);
const TemplateDeploy = lazy(() => import("./pages/template/template-deploy"));
const CloneTemplate = lazy(() => import("./pages/template/clone-template"));
const UploadTemplate = lazy(() => import("./pages/template/upload-template"));
const Generate = lazy(() => import("./pages/6&iFtgG4Lr8Ul54+29"));
const Arns = lazy(() => import("./pages/arns/"));
const ArnsDashboard = lazy(() => import("./pages/arns/dashboard"));

const Loading = () => <div className="text-center p-4"></div>;

// Wallet Manager Component - handles wallet state changes at app level
function WalletManager() {
    const { connected, disconnect } = useConnection();
    const address = useActiveAddress();
    const disconnectRef = useRef(disconnect);
    const autoReconnectAttempted = useRef(false);
    
    // Keep disconnect ref updated
    useEffect(() => {
        disconnectRef.current = disconnect;
    }, [disconnect]);

    // Auto-reconnect on app initialization
    useEffect(() => {
        // Only attempt auto-reconnect once on mount
        if (!autoReconnectAttempted.current && !connected) {
            autoReconnectAttempted.current = true;
            
            // Auto-reconnect happens silently unless debug mode is enabled
            walletManager.autoReconnect().catch((error) => {
                console.warn('Auto-reconnect error:', error);
            });
        }
    }, []); // Run only once on mount
    
    // Apply connection fix to handle edge cases where we're connected but have no address
    // Use ref for disconnect to avoid infinite loops
    useEffect(() => {
        // Only clean up bad states (connected without address)
        fixConnection(address || undefined, connected, disconnectRef.current);
    }, [address, connected]);

    const setWalletAddress = useGlobalState(state => state.setWalletAddress);
    const clearWalletData = useGlobalState(state => state.clearWalletData);
    
    useEffect(() => {
        const currentWalletAddress = useGlobalState.getState().walletAddress;
        
        if (connected && address) {
            // Only update if address actually changed to prevent unnecessary updates
            if (currentWalletAddress !== address) {
                setWalletAddress(address);
            }
        } else if (!connected) {
            // Clear wallet data when disconnected, but only if we have data to clear
            if (currentWalletAddress) {
                clearWalletData();
            }
        }
    }, [connected, address, setWalletAddress, clearWalletData]);
    
    return null; // This component doesn't render anything
}

function Layout() {
    return (
        <ErrorBoundary>
            <div className="bg-random">
                <WalletManager />
                <Navbar />
                <main className="max-w-[1440px] mx-auto">
                    <Suspense fallback={<Loading />}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </ErrorBoundary>
    );
}

function Root() {
    return (
        <>
            <RedirectHandler />
            <GitHubCallbackHandler />
            <Outlet />
        </>
    );
}

const router = createBrowserRouter([
    {
        element: <Root />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<Loading />}>
                        <Home />
                    </Suspense>
                ),
            },
            {
                path: "/",
                element: <Layout />,
                children: [
                    { path: "dashboard", element: <Dashboard /> },
                    { 
                        path: "deployment", 
                        element: (
                            <ErrorBoundary>
                                <Deployment />
                            </ErrorBoundary>
                        )
                    },
                    { 
                        path: "deployment/logs", 
                        element: (
                            <ErrorBoundary>
                                <DeploymentLogs />
                            </ErrorBoundary>
                        )
                    },
                    { 
                        path: "deployment/card", 
                        element: (
                            <ErrorBoundary>
                                <DeploymentCard />
                            </ErrorBoundary>
                        )
                    },
                    {
                        path: "deployment/history",
                        element: (
                            <ErrorBoundary>
                                <DeploymentHistory />
                            </ErrorBoundary>
                        ),
                    },
                    { path: "templates", element: <TemplateDashboard /> },
                    { path: "6&iFtgG4Lr8Ul54+29", element: <Generate /> },
                    {
                        path: "templates/:framework/:name/:id",
                        element: <SelectedTemplate />,
                    },
                    {
                        path: "templates/clone/:framework/:name/:id",
                        element: <CloneTemplate />,
                    },
                    {
                        path: "/deploy/:owner/:repoName",
                        element: <TemplateDeploy />,
                    },
                    { path: "templates/upload", element: <UploadTemplate /> },
                    {
                        path: "templates/deploy/:owner/:repoName",
                        element: <TemplateDeploy />,
                    },
                    { 
                        path: "deployment/analytics", 
                        element: (
                            <ErrorBoundary>
                                <Analytics />
                            </ErrorBoundary>
                        )
                    },
                    {
                        path: "deployment/settings",
                        element: (
                            <ErrorBoundary>
                                <DeploymentSetting />
                            </ErrorBoundary>
                        ),
                    },
                    {
                        path: "deployment/branch-previews",
                        element: (
                            <ErrorBoundary>
                                <BranchPreviews />
                            </ErrorBoundary>
                        ),
                    },
                    { path: "deploy", element: <NewDeployment /> },
                    { path: "integration", element: <ComingSoon /> },
                    { path: "feedback", element: <ComingSoon /> },
                    { path: "support", element: <ComingSoon /> },
                    { path: "/arns", element: <Arns /> },
                    { path: "/arns/dashboard", element: <ArnsDashboard /> },

                    { path: "*", element: <ComingSoon /> },
                ],
            },
        ],
    },
]);

function RedirectHandler() {
    const navigate = useNavigate();
    useEffect(() => {
        const redirect = sessionStorage.getItem("redirect");
        if (redirect) {
            sessionStorage.removeItem("redirect");
            navigate(redirect, { replace: true });
        }
    }, [navigate]);
    return null;
}

function GitHubCallbackHandler() {
    const { githubToken, setGithubToken } = useGlobalState();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleAuth = async () => {
            const code = searchParams.get("code");
            if (code && !githubToken) {
                try {
                    console.log("Processing GitHub callback with code:", code);
                    const token = await handleGitHubCallback(code);
                    setGithubToken(token);
                    
                    // Clean up the URL
                    window.history.replaceState(
                        {},
                        "",
                        window.location.pathname,
                    );
                    console.log("GitHub authentication successful");
                } catch (error) {
                    console.error("Failed to authenticate with GitHub:", error);
                }
            }
        };

        handleAuth();
    }, [searchParams, githubToken, setGithubToken]);

    return null;
}

function App() {
    return (
        <>
            <Toaster
                toastOptions={{
                    classNames: {
                        error: "text-red-200 bg-arlink-bg-secondary-color border border-neutral-800",
                        success:
                            "text-green-200 bg-arlink-bg-secondary-color border border-neutral-800",
                        warning:
                            "text-yellow-400 bg-arlink-bg-secondary-color border border-neutral-800",
                        info: "text-blue-400 bg-arlink-bg-secondary-color border border-neutral-800",
                        loading:
                            "text-neutral-400 bg-arlink-bg-secondary-color border border-neutral-800",
                    },
                }}
            />
            <RouterProvider router={router} />
        </>
    );
}

export default App;
