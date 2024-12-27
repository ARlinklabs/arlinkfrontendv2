import type React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen ">
			<h1 className="text-6xl font-bold text-neutral-50 mb-4">404</h1>
			<p className="text-xl text-neutral-600 mb-8">Oops! Page not found.</p>
			<Link
				to="/"
				className="px-4 py-2 bg-neutral-900 rounded-md text-white hover:bg-neutral-800 transition-colors"
			>
				Go back to Home
			</Link>
		</div>
	);
};

export default NotFound;