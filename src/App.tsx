"use client";
import {
    createBrowserRouter,
    RouterProvider,
    Outlet,
    useNavigate,
} from "react-router-dom";
import Home from "@/pages/index";
import Dashboard from "@/pages/dashboard";
import Deployment from "@/pages/deployments/deployment";
import Navbar from "./components/shared/navbar";
import { Toaster } from "./components/ui/sonner";
import DeploymentLogs from "./pages/deployments/deployment-logs";
import { useEffect } from "react";
import ComingSoon from "./components/coming-soon";
import NewDeployment from "./pages/depoly/new-deployment";
import DeploymentSetting from "./pages/deployments/deployment-settings";

// Layout component remains the same
function Layout() {
    return (
        <div className="bg-black">
            <Navbar />
            <main className="max-w-[1440px] mx-auto">
                <Outlet />
            </main>
        </div>
    );
}

function Root() {
    return (
        <>
            <RedirectHandler />
            <Outlet />
        </>
    );
}

const router = createBrowserRouter([
    {
        element: <Root />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/",
                element: <Layout />,
                children: [
                    {
                        path: "dashboard",
                        element: <Dashboard />,
                    },
                    {
                        path: "deployment",
                        element: <Deployment />,
                    },
                    {
                        path: "deployment/logs",
                        element: <DeploymentLogs />,
                    },
                    {
                        path: "deployment/settings",
                        element: <DeploymentSetting />,
                    },
                    {
                        path: "deploy",
                        element: <NewDeployment />,
                    },
                    {
                        path: "integration",
                        element: <ComingSoon />,
                    },
                    {
                        path: "feedback",
                        element: <ComingSoon />,
                    },
                    {
                        path: "support",
                        element: <ComingSoon />,
                    },
                    {
                        path: "*",
                        element: <ComingSoon />,
                    },
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
