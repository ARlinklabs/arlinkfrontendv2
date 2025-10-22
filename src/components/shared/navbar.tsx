import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { extractRepoName } from "@/pages/utilts";
import { getPrimaryname } from "@/lib/utils";
import { UserIcon } from "lucide-react";
import { useWalletState } from "@/hooks/use-wallet-state";
import WAuthStrategy, { WAuthProviders } from "@wauth/strategy";
import ProfileModal from "@/components/shared/profile-modal";
import LoginModal from "@/components/shared/login-modal";

// Debug logging - enable by setting localStorage.WALLET_DEBUG = 'true'
const DEBUG = import.meta.env.DEV && localStorage.getItem('WALLET_DEBUG') === 'true';
const log = (...args: any[]) => DEBUG && console.log('[Navbar]', ...args);

export default function Navbar() {
    // Use centralized wallet state hook for consistency
    const { isConnected, address, connect, disconnect, kitConnected, kitAddress, walletAddress } = useWalletState();
    
    // Debug logging to track navbar state
    useEffect(() => {
        log('State:', { 
            isConnected, 
            address, 
            kitConnected, 
            kitAddress, 
            walletAddress 
        });
    }, [isConnected, address, kitConnected, kitAddress, walletAddress]);

    //@ts-ignore
    const [isNewDeployment, setIsNewDeployment] = useState(false);
    const [primaryName, setPrimaryName] = useState<string | null>(null);
    const [primaryLogo, setPrimaryLogo] = useState<string | null>(null);
    const [connectingToWallet, setConnectingToWallet] = useState(false);
    const [disconnectingToWallet, setDisconnectingToWallet] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

    const [searchParams] = useSearchParams();
    const repo = searchParams.get("repo");

    const handleGithubLogin = async () => {
        setConnectingToWallet(true);
        try {
            await connect();
        } finally {
            setConnectingToWallet(false);
        }
    };
    const disconnectWallet = async () => {
        setDisconnectingToWallet(true);
        await disconnect();
        setDisconnectingToWallet(false);
    };

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
            name: "Templates",
            url: "/templates",
        },
        {
            name: "ArNS",
            url: "/arns/dashboard",
        },
        {
            name: "Discord",
            url: "https://discord.gg/PZjQH8DVTP",
        },
        {
            name: "Docs",
            url: "https://arlink.gitbook.io/arlink-docs/getting-started/quickstart",
        },
    ];

    const deployPageNavlinks = [
        {
            name: "Overview",
            url: `/deployment?repo=${extractRepoName(repo || "")}`,
        },
        {
            name: "Analytics",
            url: `/deployment/Analytics?repo=${extractRepoName(repo || "")}`,

        },{
            name : "Branch Previews",
            url : `/deployment/branch-previews?repo=${extractRepoName(repo || "")}`,
        },{
            name: "History",
            url: `/deployment/history?repo=${extractRepoName(repo || "")}`,
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
        let isCancelled = false;
        let timeoutId: NodeJS.Timeout;

        async function fetchPrimaryName() {
            if (address && isConnected) {
                try {
                    // Add a longer delay to prevent blocking other operations
                    // and ensure wallet is fully ready
                    timeoutId = setTimeout(async () => {
                        if (isCancelled) return;
                        
                        try {
                            const primaryNameData = await getPrimaryname(address);
                            
                            if (isCancelled) return;
                            
                            if (primaryNameData) {
                                //@ts-ignore
                                setPrimaryName(primaryNameData.primaryname);
                                //@ts-ignore
                                setPrimaryLogo(primaryNameData.logo);
                            }

                            // Fetch user email from GitHub authentication
                            try {
                                const wauth = new WAuthStrategy({ provider: WAuthProviders.Github });
                                const emailData = await wauth.getEmail();
                                if (!isCancelled && emailData && emailData.email) {
                                    setUserEmail(emailData.email);
                                }
                            } catch (emailError) {
                                console.error("Error fetching email:", emailError);
                                // Continue without email if fetch fails
                            }
                        } catch (error) {
                            console.error("Error fetching primary name:", error);
                            // Don't block UI on error - just continue without primary name
                        }
                    }, 2000); // 2 second delay to prevent blocking critical operations
                } catch (error) {
                    console.error("Error setting up primary name fetch:", error);
                }
            } else {
                // Clear primary name if not connected
                setPrimaryName(null);
                setPrimaryLogo(null);
                setUserEmail(null);
            }
        }

        fetchPrimaryName();

        return () => {
            isCancelled = true;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [address, isConnected]);

    const displayName = primaryName || address?.slice(0, 8) || "anonymous";

    const avatarUrl = primaryLogo ? `https://arweave.net/${primaryLogo}` : "";

    return (
        <nav className="bg-[#0D0D0D]/80 arlink-navbar z-50 sticky top-0 backdrop-blur-lg border-b-2 border-neutral-800  box-border">
            <div className="md:px-[40px] px-[16px] pt-4 w-full flex items-center justify-between">
                <div className="flex gap-2  items-center">
                    <Link to="/dashboard">
                        <img
                            src="/joose.svg"
                            alt="Joose logo"
                            className="md:w-[36px] w-[20px] aspect-square rounded-full"
                        />
                    </Link>
                    <h2 className="bg-gradient-to-r from-neutral-50 to-neutral-300 text-transparent bg-clip-text md:text-[24px] text-[18px] tracking-tight font-bold pb-2">
                        {displayName}
                    </h2>
                </div>
                <div className="flex items-center gap-1">
                    <div className="third_column">
                        {isConnected && address ? (
                            <ProfileModal
                                address={address}
                                avatarUrl={avatarUrl}
                                userEmail={userEmail}
                                onDisconnect={disconnectWallet}
                                disconnecting={disconnectingToWallet}
                                triggerClassName="bg-[#131314] text-white border-2 border-[#262626] pr-2 flex items-center font-semibold px-1 gap-2 py-1 rounded-md"
                            />
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="bg-[#131314] border-[#262626] border-2 text-white pr-2 flex items-center font-semibold px-1 gap-2 py-1 rounded-md"
                                >
                                    <div className="bg-white p-2 w-fit text-black rounded-md">
                                        <UserIcon className="size-4" />
                                    </div>
                                    Log in
                                </button>
                                <LoginModal
                                    open={showLoginModal}
                                    onOpenChange={setShowLoginModal}
                                    onGithubLogin={handleGithubLogin}
                                    loading={connectingToWallet}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <div className="flex overflow-x-auto overflow-y-hidden md:ml-[50px] ml-[16px]">
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
            target={name === "Docs" || name === "Discord" ? "_blank" : ""}
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
