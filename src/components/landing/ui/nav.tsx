import { Menu, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WAuthStrategy, { WAuthProviders } from "@wauth/strategy";
import { getPrimaryname } from "@/lib/utils";
import { useWalletState } from "@/hooks/use-wallet-state";
import ProfileModal from "@/components/shared/profile-modal";
import LoginModal from "@/components/shared/login-modal";
type NavLink = {
    name: string;
    url: string;
};

export const Nav = () => {
    const { isConnected: connected, connect, disconnect, address } = useWalletState();
    const [openSideBar, setOpenSideBar] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [disconnecting, setDisconnecting] = useState<boolean>(false);
    const [primaryLogo, setPrimaryLogo] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

    const links: NavLink[] = [
        { name: "Home", url: "#home" },
        { name: "Features", url: "#features" },
        { name: "How it works", url: "#how-it-works" },
        { name: "Projects", url: "#projects" },
        { name: "Testimonials", url: "#testimonials" },
        { name: "FAQ's", url: "#faq" },
        {
            name: "Docs",
            url: "https://arlink.gitbook.io/arlink-docs/getting-started/quickstart",
        },
        { name: "Templates", url: "/templates" },
    ];

    const handleGithubLogin = async () => {
        setLoading(true);
        try {
            // The connect() from useWalletState uses the current strategy
            // which defaults to GitHub, so this will work correctly
            await connect();
        } finally {
            setLoading(false);
        }
    };

    const disConnect = async () => {
        setDisconnecting(true);
        await disconnect();
        setDisconnecting(false);
    };

    useEffect(() => {
        let isCancelled = false;

        async function fetchUserData() {
            if (address && connected) {
                try {
                    // Add a small delay to ensure wallet is fully ready
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    if (isCancelled) return;
                    
                    // Fetch primary name data
                    const primaryNameData = await getPrimaryname(address);
                    
                    if (isCancelled) return;
                    
                    if (primaryNameData) {
                        // @ts-ignore - primaryNameData is verified to exist
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
                    console.error("Error fetching user data:", error);
                    // Don't block UI on error - just continue without data
                }
            } else {
                // Clear all user data if not connected
                setPrimaryLogo(null);
                setUserEmail(null);
            }
        }

        fetchUserData();

        return () => {
            isCancelled = true;
        };
    }, [address, connected]);

    const avatarUrl = primaryLogo ? `https://arweave.net/${primaryLogo}` : "";

    return (
        <>
            {/* Desktop Navbar (lg and above) */}
            <nav className="lg:flex hidden z-[500] items-center justify-center gap-10 fixed top-4 w-full">
                <div className="first_column flex items-center gap-1">
                    <img className="size-12" src="/joose.svg" alt="Logo" />
                    <span className="-translate-x-2 font-semibold">Arlink</span>
                </div>
                <div className="second_column text-sm space-x-6 bg-[#151516] rounded-md p-2 px-4">
                    {links.map((link) =>
                        link.name === "Docs" ? (
                            <a
                                key={link.url}
                                rel="noopener noreferrer"
                                target="_blank"
                                href={link.url}
                            >
                                {link.name}
                            </a>
                        ) : (
                            <a key={link.url} href={link.url}>
                                {link.name}
                            </a>
                        ),
                    )}
                </div>
                <div className="third_column">
                    {connected && address ? (
                        <ProfileModal
                            address={address}
                            avatarUrl={avatarUrl}
                            userEmail={userEmail}
                            onDisconnect={disConnect}
                            disconnecting={disconnecting}
                        />
                    ) : (
                        <>
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="bg-white text-black pr-2 flex items-center font-semibold px-1 gap-2 py-1 rounded-md"
                            >
                                <div className="bg-[#151516] p-2 w-fit text-white rounded-md">
                                    <UserIcon className="size-4" />
                                </div>
                                Log in
                            </button>
                            <LoginModal
                                open={showLoginModal}
                                onOpenChange={setShowLoginModal}
                                onGithubLogin={handleGithubLogin}
                                loading={loading}
                            />
                        </>
                    )}
                </div>
            </nav>

            {/* Mobile Navbar */}
            <nav className="lg:hidden flex z-[500] items-center justify-between p-[16px] fixed top-0 w-full">
                <div className="flex items-center gap-1">
                    <button onClick={() => setOpenSideBar((prev) => !prev)}>
                        <Menu />
                    </button>
                    <div className="first_column flex items-center gap-1">
                        <img className="size-12" src="/joose.svg" alt="Logo" />
                        <span className="-translate-x-2 font-semibold">
                            Arlink
                        </span>
                    </div>
                </div>
                <div className="third_column">
                    {connected && address ? (
                        <ProfileModal
                            address={address}
                            avatarUrl={avatarUrl}
                            userEmail={userEmail}
                            onDisconnect={disConnect}
                            disconnecting={disconnecting}
                        />
                    ) : (
                        <>
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="bg-white text-black pr-2 flex items-center font-semibold px-1 gap-2 py-1 rounded-md"
                            >
                                <div className="bg-[#151516] p-2 w-fit text-white rounded-md">
                                    <UserIcon className="size-4" />
                                </div>
                                Log in
                            </button>
                            <LoginModal
                                open={showLoginModal}
                                onOpenChange={setShowLoginModal}
                                onGithubLogin={handleGithubLogin}
                                loading={loading}
                            />
                        </>
                    )}
                </div>
            </nav>

            <div
                className={`fixed top-0 left-0 h-full z-40 pt-[100px] w-full bg-neutral-900/50 backdrop-blur-md p-4 transform transition-transform duration-300 ease-in-out lg:hidden ${
                    openSideBar ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex flex-col tracking-tighter font-semibold text-3xl">
                    {links.map((link, index) => (
                        <Link
                            key={link.url}
                            to={link.url}
                            onClick={() => setOpenSideBar(false)}
                            className={`py-4 text-white border-neutral-500 border-b ${
                                index === links.length - 1 && "border-none"
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
};
