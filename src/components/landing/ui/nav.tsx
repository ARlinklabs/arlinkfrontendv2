import { Menu } from "lucide-react"; // Using X for a close icon
import { useState } from "react";
import { Link } from "react-router-dom";

type NavLink = {
    name: string;
    url: string;
};

export const Nav = () => {
    const [openSideBar, setOpenSideBar] = useState<boolean>(false);
    const links: NavLink[] = [
        { name: "Home", url: "#home" },
        { name: "Features", url: "#features" },
        { name: "How it works", url: "#how-it-works" },
        { name: "Projects", url: "#projects" },
        { name: "Testimonials", url: "#home" },
        { name: "FAQ's", url: "#faq" },
        { name: "Docs", url: "#docs" },
    ];

    return (
        <>
            {/* Desktop Navbar (lg and above) */}
            <nav className="lg:flex hidden z-50 items-center justify-center gap-10 fixed top-4 w-full">
                <div className="first_column flex items-center gap-1">
                    <img className="size-12" src="/joose.svg" alt="Logo" />
                    <span className="-translate-x-2 font-semibold">Arlink</span>
                </div>
                <div className="second_column text-sm space-x-6 bg-[#151516] rounded-md p-2 px-4">
                    {links.map((link) => (
                        <Link key={link.url} to={link.url}>
                            {link.name}
                        </Link>
                    ))}
                </div>
                <div className="third_column">
                    <button className="bg-white text-black font-semibold px-3 py-1 rounded-md">
                        Connect
                    </button>
                </div>
            </nav>

            {/* Mobile Navbar */}
            <nav className="lg:hidden flex z-[500] items-center justify-between p-[16px] fixed top-0 w-full">
                <div className="flex items-center gap-1">
                    {/* Toggle Sidebar */}
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
                    <button className="bg-white text-black font-semibold px-3 py-1 rounded-md">
                        Connect
                    </button>
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
