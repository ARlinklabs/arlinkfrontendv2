"use client";
import {
	Routes,
	Route,
	BrowserRouter,
	useNavigate,
	Outlet,
} from "react-router-dom";
import Home from "@/pages/index";
import Dashboard from "@/pages/dashboard";
import Deployment from "@/pages/deployments/deployment";
import DeployThirdParty from "@/pages/deploythirdparty";
import { useEffect } from "react";
import Deploy from "@/pages/depoly/deploy";
import Navbar from "./components/navbar";
import NotFound from "./components/ui/not-found";
import DMZTDeploy from "./pages/depoly/DMZT-deploy";
import { Toaster } from "./components/ui/sonner";

// Create a new component to handle redirects
function RedirectHandler() {
	const navigate = useNavigate();

	useEffect(() => {
		// Check for stored redirect
		const redirect = sessionStorage.getItem("redirect");
		if (redirect) {
			sessionStorage.removeItem("redirect");
			// Use navigate to handle the redirect
			navigate(redirect, { replace: true });
		}
	}, [navigate]);

	return null;
}

function Layout() {
	return (
		<div>
			<Navbar />
			<main className="max-w-[1440px] mx-auto">
				<Outlet />
			</main>
		</div>
	);
}

function App() {
	return (
		<>
			<Toaster
				toastOptions={{
					classNames: {
						error:
							"text-red-200 bg-arlink-bg-secondary-color border border-neutral-800",
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
			<BrowserRouter>
				<RedirectHandler />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/*" element={<Layout />}>
						<Route path="dashboard" element={<Dashboard />} />
						<Route path="deployment" element={<Deployment />} />
						<Route path="deploythirdparty" element={<DeployThirdParty />} />
						<Route path="deploy" element={<DMZTDeploy />} />
						<Route path="dmztDeploy" element={<Deploy />} />
						{/* routes for */}
						<Route path="integration" element={<NotFound />} />
						<Route path="feedback" element={<NotFound />} />
						<Route path="support" element={<NotFound />} />
						{/* Catch-all route for undefined paths */}
						<Route path="*" element={<NotFound />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
