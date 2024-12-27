import { Link, useLocation } from "react-router-dom";
import {
	useConnection,
	ConnectButton,
	useActiveAddress,
} from "arweave-wallet-kit";
import { useState, useEffect } from "react";
import { getProfileByWalletAddress, type ProfileHeaderType } from "@/lib/Bazar";

export default function Navbar() {
	//@ts-ignore
	const { connected } = useConnection();
	const address = useActiveAddress();

	//@ts-ignore
	const [isNewDeployment, setIsNewDeployment] = useState(false);
	const [profile, setProfile] = useState<ProfileHeaderType | null>(null);

	// nav-links
	const links = [
		{
			name: "Dashboard",
			url: "/dashboard",
		},
		{
			name: "Integration",
			url: "/integration",
		},
		{
			name: "Feedback",
			url: "/feedback",
		},
		{
			name: "Support",
			url: "/support",
		},
		{
			name: "Docs",
			url: "https://arlink.gitbook.io/arlink-docs/getting-started/quickstart",
		},
	];

	const location = useLocation();
	// const isDeployPage = location.pathname === "#/deploy";

	useEffect(() => {
		async function fetchProfile() {
			if (address) {
				try {
					const fetchedProfile = await getProfileByWalletAddress({ address });
					setProfile(fetchedProfile);
					console.log("fetchedprofile is ", fetchedProfile);
				} catch (error) {
					console.error("Error fetching profile:", error);
				}
			}
		}

		fetchProfile();
	}, [address]);

	const displayName =
		profile?.displayName ||
		profile?.username ||
		address?.slice(0, 8) ||
		"anonymous";
	const avatar = profile?.avatar ? `https://arweave.net/${profile.avatar}` : "";

	return (
		<nav className="bg-[#0D0D0D]/80 arlink-navbar z-50 sticky top-0 backdrop-blur-lg border-b-2 border-[#383838] box-border">
			<div className="px-[40px] pt-4 w-full flex items-center justify-between">
				<div className="flex gap-1 items-center">
					<img
						src="/joose.svg"
						alt="Joose logo"
						className="w-[56px] aspect-square rounded-full"
					/>
					<h2 className="bg-gradient-to-r from-neutral-50 to-neutral-300 text-transparent bg-clip-text text-[24px] tracking-tight font-bold pb-2">
						{displayName}
					</h2>
				</div>
				<div className="flex items-center gap-6">
					<ConnectButton accent="#0D0D0D" />
					<div className="w-8 h-8 bg-purple-500 rounded-full">
						{avatar && (
							<img
								src={avatar}
								alt="Profile"
								className="w-full h-full rounded-full object-cover"
							/>
						)}
					</div>
				</div>
			</div>
			<div>
				<div className="flex ml-[50px]">
					{links.map((link) => {
						return (
							<NavLink
								key={link.name}
								name={link.name}
								pathname={location.pathname}
								url={link.url}
							/>
						);
					})}
				</div>
			</div>
		</nav>
	);
}

const NavLink = ({
	name,
	pathname,
	url,
}: { name: string; pathname: string; url: string }) => {
	return (
		<Link
			target={name === "Docs" ? "_blank" : ""}
			to={url}
			className={`px-3 border-b-2 cursor-pointer border-[#0D0D0D] 
						transition-all py-2 text-[14px] 
						${
							pathname === url
								? "border-neutral-50 text-neutral-50 translate-y-[1px]"
								: "text-neutral-500 hover:text-neutral-50"
						}
						`}
		>
			{name}
		</Link>
	);
};
