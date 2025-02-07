import { InteractiveGrid } from "../ui";
import { motion } from "framer-motion";

export const Hero = () => {
    const headingLines = [
        "Deployments on Arweave",
        "made as simple as one click",
    ];

    const descriptionLines = [
        "Arlink allows you to permanently deploy and",
        "manage your web apps on the PermaWeb with ease.",
    ];

    const wordAnimation = {
        hidden: {
            y: 20,
            opacity: 0,
        },
        visible: {
            y: 0,
            opacity: 1,
        },
    };

    const lineAnimation = {
        hidden: {
            y: 20,
            opacity: 0,
        },
        visible: {
            y: 0,
            opacity: 1,
        },
    };

    return (
        <section id="home" className="h-[800px] w-full relative">
            <div className="inset-0 absolute max-w-[1536px] h-[800px] mx-auto">
                <div className="radial_gradient_overlay pointer-events-none scale-x-150 z-10 absolute inset-0 w-full h-full" />
                <InteractiveGrid />
            </div>
            <div className="relative pointer-events-none z-30 w-full">
                <div className="mt-[200px] flex flex-col gap-8">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 20,
                            delay: 0.3,
                        }}
                        className="p-1 font-medium items-center gap-2 flex tracking-tight bg-[#222225] border-2 border-[#72727f] rounded-full w-fit mx-auto"
                    >
                        <div className="w-[32px] h-[24px] bg-[#72727f] rounded-xl"></div>
                        <span className="pr-2">Built for the PermaWeb</span>
                    </motion.div>
                    <h1 className="text-6xl text-center font-bold capitalize flex flex-col">
                        {headingLines.map((line, lineIdx) => (
                            <span key={lineIdx} className="block">
                                {line.split(" ").map((word, idx) => (
                                    <motion.span
                                        key={idx}
                                        className="inline-block mr-2"
                                        variants={wordAnimation}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 20,
                                            delay:
                                                (lineIdx *
                                                    line.split(" ").length +
                                                    idx) *
                                                    0.08 +
                                                0.5,
                                        }}
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </h1>
                </div>
                <p className="text-center leading-tight mt-[30px] text-neutral-300 flex flex-col">
                    {descriptionLines.map((line, lineIdx) => (
                        <motion.span
                            key={lineIdx}
                            className="block"
                            variants={lineAnimation}
                            initial="hidden"
                            animate="visible"
                            transition={{
                                type: "spring",
                                stiffness: 100,
                                damping: 20,
                                delay: lineIdx * 0.15 + 1.2,
                            }}
                        >
                            {line}
                        </motion.span>
                    ))}
                </p>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        delay: 1.5,
                    }}
                    className="w-full flex justify-center mt-[30px] relative z-30"
                >
                    <button className="px-4 py-2 mx-auto bg-white rounded-lg text-black font-semibold text-center pointer-events-auto">
                        Deploy Now
                    </button>
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        delay: 1.8,
                    }}
                    className="max-w-7xl mx-auto mt-[80px] relative z-30 w-full bg-gradient-to-b from-neutral-500 to-black p-2 rounded-xl"
                >
                    <div className="bg-gradient-to-b from-transparent to-black via-black/80 z-40 inset-0 rounded-xl absolute" />
                    <img src="/dashboard.png" className="rounded-md" />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
