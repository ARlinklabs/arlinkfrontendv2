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
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    const lineAnimation = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <section id="home" className="h-[800px] md:h-[800px] w-full relative">
            <div className="inset-0 lg:block hidden absolute max-w-[1536px] h-[800px] mx-auto">
                <div className="radial_gradient_overlay pointer-events-none md:scale-x-150 scale-x-100 z-10 absolute inset-0 w-full h-full" />
                <InteractiveGrid />
            </div>
            <div className="relative pointer-events-none z-30 w-full px-4 sm:px-6">
                <div className="mt-[120px] md:mt-[200px] flex flex-col gap-4 md:gap-8">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 20,
                            delay: 0.3,
                        }}
                        className="p-1 font-medium items-center gap-2 flex tracking-tight bg-[#222225] border-2 border-[#72727f] rounded-full w-fit mx-auto text-sm md:text-base"
                    >
                        <div className="w-[28px] md:w-[32px] h-[20px] md:h-[24px] flex items-center justify-center bg-[#72727f] rounded-xl">
                            <svg
                                width="17"
                                height="16"
                                className="md:size-5 size-3"
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g clip-path="url(#clip0_2320_1961)">
                                    <path
                                        d="M8.50016 6.80135L6.70216 8.00002L8.50016 9.19868L10.2982 8.00002L8.50016 6.80135ZM11.5002 7.19869L13.2982 6.00002L9.16683 3.24602V5.64335L11.5002 7.19869ZM13.8335 7.24535L12.7022 8.00002L13.8335 8.75402V7.24668V7.24535ZM11.5002 8.80135L9.16683 10.3567V12.754L13.2982 10L11.5002 8.80135ZM7.8335 5.64335V3.24602L3.70216 6.00002L5.50016 7.19869L7.8335 5.64335ZM3.70216 10L7.8335 12.754V10.3567L5.50016 8.80135L3.70216 10ZM4.29816 8.00002L3.16683 7.24602V8.75402L4.29816 8.00002ZM1.8335 6.00002C1.83348 5.89029 1.86055 5.78225 1.9123 5.6855C1.96405 5.58874 2.03889 5.50625 2.13016 5.44535L8.13016 1.44535C8.23972 1.37226 8.36846 1.33325 8.50016 1.33325C8.63186 1.33325 8.76061 1.37226 8.87016 1.44535L14.8702 5.44535C14.9614 5.50625 15.0363 5.58874 15.088 5.6855C15.1398 5.78225 15.1668 5.89029 15.1668 6.00002V10C15.1668 10.1097 15.1398 10.2178 15.088 10.3145C15.0363 10.4113 14.9614 10.4938 14.8702 10.5547L8.87016 14.5547C8.76061 14.6278 8.63186 14.6668 8.50016 14.6668C8.36846 14.6668 8.23972 14.6278 8.13016 14.5547L2.13016 10.5547C2.03889 10.4938 1.96405 10.4113 1.9123 10.3145C1.86055 10.2178 1.83348 10.1097 1.8335 10V6.00002Z"
                                        fill="white"
                                    />
                                </g>
                                <defs>
                                    <clipPath id="clip0_2320_1961">
                                        <rect
                                            width="16"
                                            height="16"
                                            fill="white"
                                            transform="translate(0.5)"
                                        />
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                        <span className="pr-1 md:pr-2 md:text-base text-xs">
                            Built for the PermaWeb
                        </span>
                    </motion.div>

                    <h1 className="md:text-5xl sm:text-3xl text-2xl lg:text-6xl text-center font-bold capitalize flex flex-col">
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

                <p className="text-center leading-tight mt-4 md:mt-[30px] text-neutral-300 flex flex-col text-sm md:text-base">
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
                    <div className="bg-gradient-to-b from-transparent to-black via-black/80 z-40 inset-0 rounded-xl absolute" />
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
