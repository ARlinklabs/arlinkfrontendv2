import { Link } from "react-router-dom";

type NavLink = {
    name: string;
    url: string;
};

export const Nav = () => {
    const links: NavLink[] = [
        {
            name: "Home",
            url: "#home",
        },
        {
            name: "Features",
            url: "#features",
        },
        {
            name: "How it works",
            url: "#how-it-works",
        },
        {
            name: "Projects",
            url: "#projects",
        },
        {
            name: "Testimonials",
            url: "#home",
        },
        {
            name: "FAQ's",
            url: "#faq",
        },
        {
            name: "Docs",
            url: "#docs",
        },
    ];
    return (
        <nav className="flex z-50 items-center justify-center gap-10 fixed top-4 w-full">
            <div className="first_column flex items-center gap-1">
                <img
                    className="size-12"
                    src="/joose.svg"
                />
                <span className="-translate-x-2 font-semibold">Arlink</span>
            </div>
            <div className="second_column text-sm space-x-6 bg-neutral-900 rounded-md p-2 px-4">
                {links.map((link) => {
                    return <Link to={link.url}>{link.name}</Link>;
                })}
            </div>
            <div className="third_column">
                <button className="bg-white text-black font-semibold px-3 py-1 rounded-md">
                    Connect
                </button>
            </div>
        </nav>
    );
};
