import { Bolt, ExternalLink, Link2, Lock } from "lucide-react";
import AnimatedDescription from "../effects/animated-description";
import { motion } from "framer-motion";

const Revolutioniaze = () => {
    const headline = ["Ready to Revolutionize Your", "Hosting Experience?"];
    const description = [
        "Step into the decentralized future with Arlink—effortless, secure, and ",
        "permanent hosting for developers, entrepreneurs, and creators.",
    ];

    const badges = [
        { icon: <Bolt size={14} />, text: "Quick Deployment" },
        { icon: <Link2 size={14} />, text: "Custom ARNS for branding" },
        { icon: <Lock size={14} />, text: "Forever online, censorship-free" },
    ];

    return (
        <div className="py-[200px]">
            <header className="flex items-center justify-center flex-col space-y-6">
                <h2 className="md:text-5xl text-3xl leading-[0.9] lg:leading-[0.9] lg:text-6xl text-center font-bold capitalize flex flex-col space-y-2">
                    <AnimatedDescription descriptionString={headline} />
                </h2>

                <div className="text-center text-md text-neutral-400">
                    <AnimatedDescription descriptionString={description} />
                </div>
            </header>
            <div className="flex flex-col items-center space-y-4 p-6">
                <motion.div className="flex space-x-3">
                    {badges.map((badge, index) => (
                        <Badge
                            key={badge.text}
                            icon={badge.icon}
                            text={badge.text}
                            index={index}
                        />
                    ))}
                </motion.div>
                <motion.div
                    className="flex space-x-3"
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.8,
                        delay: badges.length * 0.2, // Ensures buttons animate after badges
                        ease: [0.25, 0.1, 0, 0.9],
                    }}
                >
                    <button className="px-5 py-2 bg-white text-black font-medium rounded-lg shadow">
                        Deploy your first app
                    </button>
                    <a
                        href="#"
                        className="px-5 py-2 bg-neutral-800 text-white font-medium rounded-lg shadow flex items-center space-x-2"
                    >
                        <span>View Docs</span> <ExternalLink size={16} />
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default Revolutioniaze;

function Badge({
    icon,
    text,
    index,
}: {
    icon: React.ReactNode;
    text: string;
    index: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{
                duration: 0.8,
                delay: index * 0.2, // Staggered effect for badges
                ease: [0.25, 0.1, 0, 0.9],
            }}
            className="flex items-center px-4 py-1.5 bg-neutral-900 text-white rounded-full text-sm space-x-2 border border-neutral-700"
        >
            {icon}
            <span>{text}</span>
        </motion.div>
    );
}
