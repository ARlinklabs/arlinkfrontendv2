import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function timeAgo(isoDate: string): string {
	const timestamp = new Date(isoDate); // Convert ISO 8601 string to Date object
	const now = new Date(); // Get current time

	const differenceInSeconds = Math.floor(
		(now.getTime() - timestamp.getTime()) / 1000,
	); // Difference in seconds

	// Calculate time components
	const minutes = Math.floor(differenceInSeconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		return `· ${days}d ago`;
	}
	if (hours > 0) {
		return `· ${hours}h ago`;
	}
	if (minutes > 0) {
		return `· ${minutes}m ago`;
	}
	return "· just now";
}

export const BUILDER_BACKEND =
	import.meta.env.VITE_BACKEND_URL ??
	(import.meta.env.VITE_ENV === "test"
		? "http://localhost:3050"
		: "https://vmi1968527.contaboserver.net/backend");
