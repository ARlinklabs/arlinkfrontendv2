"use client";

import {
    createBrowserRouter,
    RouterProvider,
    Outlet,
    useNavigate,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Navbar from "./components/shared/navbar";
import { Toaster } from "./components/ui/sonner";

// Lazy-loaded components
const Home = lazy(() => import("@/pages/index"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Deployment = lazy(() => import("@/pages/deployments/deployment"));
const ComingSoon = lazy(() => import("./components/coming-soon"));
const NewDeployment = lazy(() => import("./pages/deployments/new-deployment"));
const DeploymentSetting = lazy(
    () => import("./pages/deployments/deployment-settings"),
);
const DeploymentCard = lazy(
    () => import("./pages/deployments/deployment-card"),
);
const DeploymentStatus = lazy(
    () => import("./pages/deployments/deployment-status"),
);
const Analytics = lazy(() => import("./pages/deployments/analytics"));
const DeploymentHistory = lazy(
    () => import("./pages/deployments/deployment-history"),
);
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

function Layout() {
    return (
        <div className="bg-random">
            <Navbar />
            <main className="max-w-[1440px] mx-auto">
                <Suspense fallback={<Loading />}>
                    <Outlet />
                </Suspense>
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
                    { path: "deployment", element: <Deployment /> },
                    { path: "deployment/card", element: <DeploymentCard /> },
                    {
                        path: "deployment/history",
                        element: <DeploymentHistory />,
                    },
                    {
                        path: "deployment/branch-status",
                        element: <DeploymentStatus />,
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
                    { path: "deployment/analytics", element: <Analytics /> },
                    {
                        path: "deployment/settings",
                        element: <DeploymentSetting />,
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
