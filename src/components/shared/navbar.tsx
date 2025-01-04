import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
    useConnection,
    ConnectButton,
    useActiveAddress,
} from "arweave-wallet-kit";
import { useState, useEffect } from "react";
import { getProfileByWalletAddress, type ProfileHeaderType } from "@/lib/Bazar";
import { extractRepoName } from "@/pages/depoly/utilts";

export default function Navbar() {
    //@ts-ignore
    const { connected } = useConnection();
    const address = useActiveAddress();

    //@ts-ignore
    const [isNewDeployment, setIsNewDeployment] = useState(false);
    const [profile, setProfile] = useState<ProfileHeaderType | null>(null);
    const [searchParams] = useSearchParams();
    const repo = searchParams.get("repo");

    // nav-links
    const links = [
        {
            name: "Dashboard",
            url: "/dashboard",
        },
        {
            name: "Deploy",
            url: "/deploy",
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

    const deployPageNavlinks = [
        {
            name: "Deployment",
            url: `/deployment?repo=${extractRepoName(repo || "")}`,
        },
        {
            name: "Logs",
            url: `/deployment/logs?repo=${extractRepoName(repo || "")}`,
        },
        {
            name: "Settings",
            url: `/deployment/settings?repo=${extractRepoName(repo || "")}`,
        },
    ];

    const location = useLocation();
    // const isDeployPage = location.pathname === "#/deploy";

    useEffect(() => {
        async function fetchProfile() {
            if (address) {
                try {
                    const fetchedProfile = await getProfileByWalletAddress({
                        address,
                    });
                    setProfile(fetchedProfile);
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
    const avatar = profile?.avatar
        ? `https://arweave.net/${profile.avatar}`
        : "";

    return (
        <nav className="bg-[#0D0D0D]/80 arlink-navbar z-50 sticky top-0 backdrop-blur-lg border-b-2 border-neutral-800  box-border">
            <div className="md:px-[40px] px-[16px] pt-4 w-full flex items-center justify-between">
                <div className="flex gap-1 items-center">
                    <Link to="/dashboard">
                        <img
                            src="/joose.svg"
                            alt="Joose logo"
                            className="w-[56px] aspect-square rounded-full"
                        />
                    </Link>
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
                <div className="flex md:ml-[50px] ml-[16px]">
                    {repo
                        ? deployPageNavlinks.map((link) => {
                              return (
                                  <NavLink
                                      key={link.name}
                                      name={link.name}
                                      pathname={location.pathname}
                                      url={link.url}
                                      repoName={repo}
                                  />
                              );
                          })
                        : links.map((link) => {
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
    repoName,
}: {
    name: string;
    pathname: string;
    url: string;
    repoName?: string;
}) => {
    const isActive = () => {
        if (repoName) {
            // For deployment pages, check exact pathname match with the URL
            return pathname === url.split("?")[0];
        }
        // For regular pages
        if (name === "Dashboard" && pathname === "/") {
            return true;
        }
        return pathname.startsWith(url) && url !== "/";
    };

    return (
        <Link
            target={name === "Docs" ? "_blank" : ""}
            to={url}
            className={`px-3 border-b-2 cursor-pointer
					transition-all py-2 text-[14px] 
					${
                        isActive()
                            ? "border-neutral-50 text-neutral-50 translate-y-[1px]"
                            : "border-[#0D0D0D] text-neutral-500 hover:text-neutral-50"
                    }`}
        >
            {name}
        </Link>
    );
};
