import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { extractRepoName } from "@/pages/utilts";
import { getPrimaryname } from "@/lib/utils";
import { Copy, LogOut, User, UserIcon, Wallet, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useWalletState } from "@/hooks/use-wallet-state";
import WAuthStrategy, { WAuthProviders } from "@wauth/strategy";

export default function Navbar() {
    // Use centralized wallet state hook for consistency
    const { isConnected, address, connect, disconnect, kitConnected, kitAddress, walletAddress } = useWalletState();
    
    // Debug logging to track navbar state
    useEffect(() => {
        console.log('Navbar state:', { 
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

    const [searchParams] = useSearchParams();
    const repo = searchParams.get("repo");

    const connectToWallet = async () => {
        setConnectingToWallet(true);
        await connect();
        setConnectingToWallet(false);
    };
    const disconnectWallet = async () => {
        setDisconnectingToWallet(true);
        await disconnect();
        setDisconnectingToWallet(false);
    };

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            toast("Address copied to clipboard");
        }
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
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="bg-[#131314] text-white border-2 border-[#262626] pr-2 flex items-center font-semibold px-1 gap-2 py-1 rounded-md">
                                        <div className="bg-white relative overflow-hidden border-[#262626] border-2 size-8 flex items-center justify-center text-black rounded-md">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    className="absolute h-full w-full"
                                                />
                                            ) : (
                                                <User className="size-4" />
                                            )}
                                        </div>
                                        <span>{userEmail || `${address?.slice(
                                            0,
                                            5,
                                        )}...${address?.slice(
                                            address.length - 5,
                                            address.length - 1,
                                        )}`}</span>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[400px]  bg-[#09090b] border-neutral-800 border text-white">
                                    <div className="text-lg font-semibold">
                                        Profile
                                    </div>

                                    <div className="flex flex-col items-center gap-2 mb-4">
                                        <div className="size-32 overflow-hidden border-2 border-neutral-800 rounded-full bg-gradient-to-b from-[#18171c] relative to-black flex items-center justify-center">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    className="absolute h-full w-full"
                                                />
                                            ) : (
                                                <User className="size-12" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {userEmail && (
                                            <div className="flex items-center justify-between bg-[#18171c] rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-md flex items-center justify-center border border-[#302e36] ">
                                                        <Mail />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-400">
                                                            Email
                                                        </span>
                                                        <span className="font-medium">{userEmail}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between bg-[#18171c] rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-md flex items-center justify-center border border-[#302e36] ">
                                                    <Wallet />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-400">
                                                        Wallet Address
                                                    </span>
                                                    <span className="font-medium">{`${address?.slice(
                                                        0,
                                                        5,
                                                    )}...${address?.slice(
                                                        address.length - 5,
                                                        address.length - 1,
                                                    )}`}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={copyAddress}
                                                className="text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Copy className="size-5" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={disconnectWallet}
                                            className="flex items-center justify-center gap-2 w-full bg-transparent hover:bg-[#302e36] transition-colors rounded-lg py-2 border border-[#302e36]"
                                        >
                                            <LogOut className="size-5" />
                                            <span className="font-medium">
                                                {disconnectingToWallet
                                                    ? "Disconnecting..."
                                                    : "Disconnect"}
                                            </span>
                                        </button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <button
                                onClick={connectToWallet}
                                className="bg-[#131314] border-[#262626] border-2 text-white pr-2 flex items-center font-semibold px-1 gap-2 py-1 rounded-md"
                            >
                                <div className="bg-white p-2 w-fit text-black rounded-md">
                                    <UserIcon className="size-4" />
                                </div>
                                {connectingToWallet
                                    ? "Connecting..."
                                    : "Connect"}
                            </button>
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
