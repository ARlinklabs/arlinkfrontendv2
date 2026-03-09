"use client";

import {
    createBrowserRouter,
    RouterProvider,
    Outlet,
    useNavigate,
} from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { lazy, Suspense, useEffect, useRef } from "react";
import { useWallet, useAddress } from "ao-wallet-kit";
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
const Arns = lazy(() => import("./pages/arns/"));
const ArnsDashboard = lazy(() => import("./pages/arns/dashboard"));

const Loading = () => <div className="text-center p-4"></div>;

// Syncs wallet state from ao-wallet-kit into the Zustand global store
function WalletStateSync() {
    const { connected } = useWallet();
    const address = useAddress();

    const setWalletAddress = useGlobalState(state => state.setWalletAddress);
    const clearWalletData = useGlobalState(state => state.clearWalletData);

    useEffect(() => {
        const currentWalletAddress = useGlobalState.getState().walletAddress;

        if (connected && address) {
            if (currentWalletAddress !== address) {
                setWalletAddress(address);
            }
        } else if (!connected) {
            if (currentWalletAddress) {
                clearWalletData();
            }
        }
    }, [connected, address, setWalletAddress, clearWalletData]);

    return null;
}

function Layout() {
    return (
        <ErrorBoundary>
            <div className="bg-random">
                <WalletStateSync />
                <Navbar />
                <main className="w-full">
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
                    {
                        path: "templates/deploy/:owner/:repoName",
                        element: <TemplateDeploy />,
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
                    const token = await handleGitHubCallback(code);
                    setGithubToken(token);
                    window.history.replaceState({}, "", window.location.pathname);
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
