"use client";
import { Button } from "@/components/ui/button";
import { ConnectButton, useConnection } from "arweave-wallet-kit";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function Home() {
	const { connected, connect } = useConnection();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		connect();
		console.log(import.meta.env.VITE_ENV);

		// Check if we're not supposed to be on the home page
		if (location.pathname !== "/") {
			navigate(location.pathname + location.search);
		}
	}, [navigate, location]);

	// Only render the home page content if we're actually on the home page
	if (location.pathname !== "/") {
		return null; // or a loading spinner
	}
	return (
		<>
			<div className="min-h-screen bg-black text-white relative overflow-hidden">
				{/* Ambient background glow */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-800/30 via-neutral-900/20 to-black"></div>

				{/* Floating logo and connect button */}
				<div className="absolute top-6 w-full z-10">
					<div className="container mx-auto px-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<img
									src="/joose.svg"
									alt="Joose logo"
									style={{ width: "50px", height: "50px" }}
								/>
								<span className="text-xl font-bold">Arlink</span>
							</div>
							<ConnectButton />
						</div>
					</div>
				</div>

				{/* Hero Section - pushed down further */}
				<section className="relative pt-40 md:pt-52">
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-500/30 via-neutral-900/5 to-transparent"></div>
					<div className="container mx-auto px-4 text-center relative">
						<div className="mx-auto max-w-3xl space-y-8">
							<div className="inline-block rounded-full bg-gradient-to-r from-neutral-800 via-neutral-400/20 to-neutral-800 px-4 py-1.5 text-sm text-white/70">
								Built for the PermaWeb
							</div>
							<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
								Deployments on Arweave made as simple as one click
							</h1>
							<p className="mx-auto max-w-2xl text-lg text-neutral-400">
								Arlink allows you to permanently deploy and manage your web apps
								on the PermaWeb with ease.
							</p>
							<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
								<Link to={connected ? "/dashboard" : "/deploy"}>
									<Button className="bg-gradient-to-r from-white via-neutral-200 to-white text-black hover:opacity-90 transition-opacity min-w-[140px]">
										{connected
											? "View your Deployments"
											: "Deploy your first app"}
										<span className="text-2xl ml-1"></span>
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</section>

				{/* Dashboard Preview */}
				<section className="relative py-32 mt-0">
					{/* Primary glow behind dashboard */}
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-500/40 via-neutral-900/30 to-transparent translate-y-20"></div>

					<div className="container mx-auto px-4 relative max-w-7xl">
						{/* Outer glow for the dashboard - made wider */}
						<div className="absolute -inset-x-40 -inset-y-32 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-400/30 via-neutral-900/20 to-transparent blur-3xl translate-y-10"></div>
						<div className="absolute -inset-x-40 -inset-y-32 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-500/30 via-neutral-800/20 to-transparent blur-3xl rotate-12 translate-y-10"></div>

						<div className="relative rounded-2xl">
							{/* Animated border container */}
							<div className="relative rounded-2xl overflow-hidden">
								<div className="dashboard-border-glow"></div>

								{/* Content wrapper */}
								<div className="relative bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden">
									{/* Multi-layered inner glow */}
									<div className="absolute inset-0">
										<div className="absolute inset-0 bg-gradient-to-b from-white/[0.07] to-transparent"></div>
										<div className="absolute inset-0 bg-gradient-to-t from-white/[0.05] to-transparent"></div>
										<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
									</div>

									{/* Dashboard image */}
									<div className="relative z-10 p-1">
										<div className="rounded-xl overflow-hidden relative group">
											{/* Inner border for depth */}
											<div className="relative rounded-xl border border-white/10 overflow-hidden">
												<img
													src="./dashboard.png"
													alt="Dashboard Preview"
													className="rounded-xl w-full shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10"
												/>

												{/* Enhanced bottom shadow overlay */}
												<div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-black via-black/90 to-transparent"></div>

												{/* Added side shadows */}
												<div className="absolute inset-0 shadow-[inset_0_0_100px_60px_rgba(0,0,0,0.9)] pointer-events-none"></div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="relative py-20 md:py-32">
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-neutral-500/20 via-neutral-900/5 to-transparent"></div>
					<div className="container mx-auto px-4 relative">
						<div className="text-center mb-20">
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
								Deploy Faster, Stay Forever
							</h2>
							<p className="mt-4 text-lg text-neutral-400 mx-auto max-w-2xl">
								Quick and simple deployments, helping you build an unstoppable,
								decentralized internet that lasts forever.
							</p>
						</div>

						{/* Bento Box Grid - 3 boxes */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
							{/* Large Feature Card */}
							<div className="md:row-span-2 p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 transition-colors group">
								<div className="h-full flex flex-col justify-between">
									<div>
										<div className="bg-gradient-to-r from-white via-neutral-400/50 to-white bg-clip-text text-transparent">
											<h3 className="text-2xl font-semibold mb-4">
												Git Connected Deployments
											</h3>
										</div>
										<p className="text-neutral-400 group-hover:text-neutral-300 transition-colors text-lg">
											import your code from github or Protocol Land and
											seamlessly deploy with one click.
										</p>
									</div>
									<div className="mt-6">
										<svg
											viewBox="0 0 98 96"
											className="w-10 h-10 opacity-70 group-hover:opacity-100 transition-opacity"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												fillRule="evenodd"
												clipRule="evenodd"
												d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
												fill="currentColor"
											/>
										</svg>
									</div>
								</div>
							</div>

							{/* Two Regular Feature Cards */}
							<div className="p-6 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 transition-colors group">
								<div className="bg-gradient-to-r from-white via-neutral-400/50 to-white bg-clip-text text-transparent">
									<h3 className="text-xl font-semibold mb-2">
										CI/CD for the permaweb
									</h3>
								</div>
								<p className="text-neutral-400 group-hover:text-neutral-300 transition-colors">
									Forget about the hassle of CI/CD, we got you covered.
									Automated deployments and updates made simple.
								</p>
							</div>

							<div className="p-6 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 transition-colors group">
								<div className="bg-gradient-to-r from-white via-neutral-400/50 to-white bg-clip-text text-transparent">
									<h3 className="text-xl font-semibold mb-2">
										ARNS integrated
									</h3>
								</div>
								<p className="text-neutral-400 group-hover:text-neutral-300 transition-colors">
									seamlessly link your custom ARNS or use ARlink undernames
									goodbye to sharing long transaction IDs
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Footer Section - ghost style */}
				<footer className="relative py-8">
					<div className="container mx-auto px-4 relative">
						<div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4">
							{/* Left side - Community text and social icons */}
							<div className="flex flex-col md:flex-row items-center gap-6">
								<span className="text-neutral-500/80 text-sm font-medium">
									Join our community
								</span>
								<div className="flex items-center gap-4">
									<a
										href="https://x.com/arlinklabs"
										className="text-neutral-600 hover:text-neutral-300 transition-colors"
										target="_blank"
										rel="noopener noreferrer"
									>
										<svg
											className="w-5 h-5"
											fill="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
										</svg>
									</a>
									<a
										href="https://discord.gg/PZjQH8DVTP"
										className="text-neutral-600 hover:text-neutral-300 transition-colors"
										target="_blank"
										rel="noopener noreferrer"
									>
										<svg
											className="w-5 h-5"
											fill="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
										</svg>
									</a>
									<a
										href="mailto:contact.arlink@gmail.com"
										className="text-neutral-600 hover:text-neutral-300 transition-colors"
									>
										<svg
											className="w-5 h-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
											/>
										</svg>
									</a>
								</div>
							</div>

							{/* Right side - Copyright and version */}
							<div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
								<span className="text-neutral-600 text-xs">
									© {new Date().getFullYear()} Arlink
								</span>
								<span className="text-neutral-700 text-xs font-medium">
									Beta 1.0.8
								</span>
							</div>
						</div>
					</div>
				</footer>
			</div>
		</>
	);
}
