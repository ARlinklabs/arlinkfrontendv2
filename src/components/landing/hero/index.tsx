import { InteractiveGrid } from "../ui";
import { motion } from "framer-motion";
import { ArIo } from "@/components/ui/icons/ario";

const Hero = () => {
    const headingLines = [
        "Deployments on Arweave",
        "made as simple as one click",
    ];

    const descriptionLines = [
        "Arlink allows you to permanently deploy and",
        "manage your web apps on the PermaWeb with ease.",
    ];

    const wordAnimation = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    const lineAnimation = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <section
            id="home"
            className="sm:h-[800px] z-0 bg-[#09090b] border border-transparent  md:h-[1200px] w-full relative"
        >
            <div className="inset-0 lg:block hidden -mt-[200px] absolute max-w-[1536px] h-[800px] mx-auto">
                <div className="radial_gradient_overlay  pointer-events-none md:scale-x-150 scale-x-100 z-10 absolute inset-0 w-full h-full" />
                <InteractiveGrid />
            </div>
            <div className="mt-[100px] absolute z-50 left-1/2 -translate-x-1/2 md:mt-[180px] ">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        delay: 0.1,
                    }}
                >
                    <a
                        className="px-3 py-2 font-medium items-center gap-2 flex tracking-tight transition-all hover:border-transparent  hover:bg-[#2f2f33] bg-[#222225] border-2 border-[#52525b] rounded-xl w-fit mx-auto text-sm md:text-base"
                        href="https://ar.io/?utm_campaign=poweredbyario&utm_medium=affiliate&utm_source=metalinks"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="pr-1 md:pr-2 md:text-base text-xs">
                            <ArIo />
                        </span>
                        Powered By ar.io
                    </a>
                </motion.div>
            </div>
            <div className="relative pointer-events-none z-30 w-full px-4 sm:px-6">
                <div className="mt-[150px] md:mt-[250px] flex flex-col gap-4 md:gap-8">
                    <h1 className="md:text-5xl  pointer-events-none sm:text-3xl text-3xl lg:text-6xl text-center font-bold capitalize flex flex-col">
                        {headingLines.map((line, lineIdx) => (
                            <span key={lineIdx} className="block">
                                {line.split(" ").map((word, idx) => (
                                    <motion.span
                                        key={idx}
                                        className="inline-block mr-1 md:mr-2"
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

                <p className="text-center pointer-events-none leading-tight mt-4 md:mt-[30px] text-neutral-300 flex flex-col text-md md:text-base">
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
                    className="w-full flex justify-center mt-6 md:mt-[30px] relative z-30"
                >
                    <button className="px-4 py-2 mx-auto bg-white rounded-lg text-black font-semibold text-center pointer-events-auto text-sm md:text-base">
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
                    className="max-w-7xl mx-auto mt-8 md:mt-[80px] relative z-30 w-full bg-gradient-to-b from-neutral-500 to-black p-1 md:p-2 rounded-xl"
                >
                    <div className="bg-gradient-to-b from-transparent to-[#09090b] via-[#09090b]/80 z-40 inset-0 rounded-xl absolute" />
                    <img
                        src="/dashboard.png"
                        className="rounded-md w-full h-auto"
                        alt="Dashboard preview"
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
