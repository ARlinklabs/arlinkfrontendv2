import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import { Menu, Copy, UserIcon, User, LogOut, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { toast } from "sonner";
import { getPrimaryname } from "@/lib/utils";

type NavLink = {
    name: string;
    url: string;
};

export const Nav = () => {
    const { connected, connect, disconnect } = useConnection();
    const [openSideBar, setOpenSideBar] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [disconnecting, setDisconnecting] = useState<boolean>(false);
    const address = useActiveAddress();
    const [, setPrimaryName] = useState<string | null>(null);
    const [primaryLogo, setPrimaryLogo] = useState<string | null>(null);

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

    const connecting = async () => {
        setLoading(true);
        await connect();
        setLoading(false);
    };

    const disConnect = async () => {
        setDisconnecting(true);
        await disconnect();
        setDisconnecting(false);
    };

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            toast("Address copied to clipboard");
        }
    };

    useEffect(() => {
        async function fetchPrimaryName() {
            if (address) {
                try {
                    const primaryNameData = await getPrimaryname(address);
                    if (primaryNameData) {
                        setPrimaryName(primaryNameData.primaryname);
                        setPrimaryLogo(primaryNameData.logo);
                    }
                } catch (error) {
                    console.error("Error fetching primary name:", error);
                }
            }
        }

        fetchPrimaryName();
    }, [address]);

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
                    {connected ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="bg-white text-black pr-2 flex items-center font-semibold px-1 gap-2 py-1 rounded-md">
                                    <div className="bg-[#151516] size-8 flex items-center justify-center text-white rounded-md">
                                        <User className="size-4" />
                                    </div>
                                    <span>{`${address?.slice(
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
                                    <div className="size-32 overflow-hidden border-2 border-neutral-700 rounded-full bg-gradient-to-b from-[#18171c] relative to-black flex items-center justify-center">
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
                                        onClick={disConnect}
                                        className="flex items-center justify-center gap-2 w-full bg-transparent hover:bg-[#302e36] transition-colors rounded-lg py-2 border border-[#302e36]"
                                    >
                                        <LogOut className="size-5" />
                                        <span className="font-medium">
                                            {disconnecting
                                                ? "Disconnecting..."
                                                : "Disconnect"}
                                        </span>
                                    </button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <button
                            onClick={connecting}
                            className="bg-white text-black pr-2 flex items-center font-semibold px-1 gap-2 py-1 rounded-md"
                        >
                            <div className="bg-[#151516] p-2 w-fit text-white rounded-md">
                                <UserIcon className="size-4" />
                            </div>
                            {loading ? "Connecting..." : "Connect"}
                        </button>
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
                    {connected ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="bg-white text-black pr-2 flex items-center font-semibold px-1 gap-2 py-1 rounded-md">
                                    <div className="bg-[#151516] size-8 flex items-center justify-center text-white rounded-md">
                                        <User className="size-4" />
                                    </div>
                                    <span>{`${address?.slice(
                                        0,
                                        5,
                                    )}...${address?.slice(
                                        address.length - 5,
                                        address.length - 1,
                                    )}`}</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[400px] rounded-xl  bg-[#09090b] border-neutral-800 border text-white">
                                <div className="text-lg font-semibold">
                                    Profile
                                </div>

                                <div className="flex flex-col items-center gap-2 mb-4">
                                    <div className="size-32 overflow-hidden border-2 border-neutral-700 rounded-full bg-gradient-to-b from-[#18171c] relative to-black flex items-center justify-center">
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
                                        onClick={disConnect}
                                        className="flex items-center justify-center gap-2 w-full bg-transparent hover:bg-[#302e36] transition-colors rounded-lg py-2 border border-[#302e36]"
                                    >
                                        <LogOut className="size-5" />
                                        <span className="font-medium">
                                            {disconnecting
                                                ? "Disconnecting..."
                                                : "Disconnect"}
                                        </span>
                                    </button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <button
                            onClick={connecting}
                            className="bg-white text-black pr-2 flex items-center font-semibold px-1 gap-2 py-1 rounded-md"
                        >
                            <div className="bg-[#151516] p-2 w-fit text-white rounded-md">
                                <UserIcon className="size-4" />
                            </div>
                            {loading ? "Connecting..." : "Connect"}
                        </button>
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
