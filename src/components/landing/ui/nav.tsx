import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import { Menu, Copy } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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
        { name: "Community", url: "#community" },
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
                                <button className="bg-white text-black font-semibold px-3 py-1 rounded-md">
                                    {`${address?.slice(
                                        0,
                                        5,
                                    )}...${address?.slice(
                                        address.length - 5,
                                        address.length - 1,
                                    )}`}
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Wallet Options</DialogTitle>
                                    <DialogDescription>
                                        Your connected wallet address: {address}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-between items-center mt-4">
                                    <button
                                        onClick={copyAddress}
                                        className="bg-white text-black font-semibold px-3 py-1 rounded-md flex items-center"
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Address
                                    </button>

                                    <button
                                        onClick={disConnect}
                                        className="bg-red-500 text-white font-semibold px-3 py-1 rounded-md"
                                    >
                                        {disconnecting
                                            ? "Disconnecting..."
                                            : "Disconnect"}
                                    </button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <button
                            onClick={connecting}
                            className="bg-white text-black font-semibold px-3 py-1 rounded-md"
                        >
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
                                <button className="bg-white text-black font-semibold px-3 py-1 rounded-md">
                                    {`${address?.slice(
                                        0,
                                        5,
                                    )}...${address?.slice(
                                        address.length - 5,
                                        address.length - 1,
                                    )}`}
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Wallet Options</DialogTitle>
                                    <DialogDescription>
                                        Your connected wallet address: {address}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-between items-center mt-4">
                                    <button
                                        onClick={copyAddress}
                                        className="bg-white text-black font-semibold px-3 py-1 rounded-md flex items-center"
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Address
                                    </button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button className="bg-red-500 text-white font-semibold px-3 py-1 rounded-md">
                                                Disconnect
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Are you absolutely sure?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action will disconnect
                                                    your wallet from the
                                                    application.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={disConnect}
                                                >
                                                    {disconnecting
                                                        ? "Disconnecting..."
                                                        : "Disconnect"}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <button
                            onClick={connecting}
                            className="bg-white text-black font-semibold px-3 py-1 rounded-md"
                        >
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
