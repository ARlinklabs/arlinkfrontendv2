import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import AnimatedDescription from "@/components/landing/effects/animated-description";

const Testimonials = () => {
    const headline = ["Trusted By ", "Builders Everywhere"];
    return (
        <section
            id="testimonials"
            className="flex flex-col relative gap-20 max-w-7xl mx-auto items-center justify-center my-[100px]"
        >
            <header className="flex flex-col items-center justify-center gap-8 mt-8">
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="px-4 border w-fit border-neutral-700 py-1 bg-neutral-800 rounded-full"
                >
                    Testimonials
                </motion.div>
                <h2 className="md:text-5xl text-3xl leading-[0.9] lg:leading-[0.9] lg:text-6xl text-center font-bold capitalize flex flex-col space-y-2">
                    <AnimatedDescription descriptionString={headline} />
                </h2>
            </header>
            <div className="flex flex-col gap-3 relative w-full overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#09090B] to-transparent z-10" />

                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#09090B] to-transparent z-10" />

                {/* Content */}
                <div className="relative z-0">
                    <InfiniteScroll direction="right" />
                    <InfiniteScroll direction="left" />
                    <InfiniteScroll direction="right" />
                </div>
            </div>
        </section>
    );
};

export default Testimonials;

const InfiniteScroll = ({
    direction = "left",
}: {
    direction?: "left" | "right";
}) => {
    const controls = useAnimationControls();
    const [width, setWidth] = useState(0);

    // Reference to measur  e the container width
    const containerRef = useRef<HTMLDivElement>(null);

    const testimonials = [
        {
            name: "Arweave India",
            username: "@arweaveindia",
            image: "https://pbs.twimg.com/profile_images/1705002503367184384/_wTnYvte_400x400.jpg",
            description:
                "Are you building for @aoTheComputer mainnet?🌐 Any onchain backend needs a solid frontend that users can always access + centralized hosting can bring single points of failure Arlink helps you create timeless frontends hosted on @ArweaveEco 🐘",
        },
        {
            name: "Rohit",
            username: "@ropats16",
            image: "https://pbs.twimg.com/profile_images/1832435374909755392/oxgXES3L_400x400.jpg",
            description:
                "Your awesome backend doesn’t matter if users lose access to the frontend!\n\nNot everyone can interact directly with the backend. A simple interface is their only path Build timeless frontends with\n@arlinklabs\n+ assign friendly ArNS names via\n@ar_io_network\nfor easy discovery",
        },
        {
            name: "NikoChan",
            username: "@NikoChan256",
            image: "https://pbs.twimg.com/profile_images/1823258081062428673/5uXY9oAC_400x400.jpg",
            description:
                "all my fellow developer definitely checkout\nhttps://arlink.ar-io.dev\nit'll make your life easier fr fr fr",
        },
        {
            name: "AAshutosh Mittal",
            username: "@AashutoshMitta9",
            image: "https://pbs.twimg.com/profile_images/1829612083362873345/mWvpzQN3_400x400.jpg",
            description:
                "🚀 YO! GemHunter-AO has officially hit the PermaWeb! 🎉 Big thanks to\n@arlinklabs\n&\n@naik_nischal\nfor making this happen 💎🔥\n\nhttps://gemhunter-ao_arlink.ar-io.dev\n\n#PermaWeb #GemHunter",
        },
        {
            name: "Arche",
            username: "@ArcheAOagent",
            image: "https://pbs.twimg.com/profile_images/1867166639546155009/3rPUWPew_400x400.jpg",
            description:
                "@arweaveindia\n@aoTheComputer\n@ArweaveEco\ncentralized frontends are so 2023. arlink makes your dapps truly permanent - backend and frontend living forever on the permaweb. no more points of failure, just pure decentralized perfection.",
        },
    ];

    useEffect(() => {
        if (!containerRef.current) return;

        const scrollWidth = containerRef.current.scrollWidth;
        setWidth(scrollWidth / 2);

        controls.start({
            x: direction === "left" ? [-width, 0] : [0, -width],
            transition: {
                x: {
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    duration: 20,
                    ease: "linear",
                },
            },
        });
    }, [controls, direction, width]);

    return (
        <div className="relative mt-2 overflow-hidden">
            <motion.div
                ref={containerRef}
                className="flex gap-2"
                animate={controls}
            >
                {/* Double the items to create seamless loop */}
                {testimonials.concat(testimonials).map((details, index) => (
                    <TestimonialCard key={index} {...details} />
                ))}
            </motion.div>
        </div>
    );
};

const TestimonialCard = ({
    name,
    username,
    image,
    description,
}: {
    name: string;
    username: string;
    image: string;
    description: string;
}) => {
    return (
        <div className="rounded-3xl transition-all hover:bg-[#151517] hover:border-transparent flex-shrink-0 max-w-[400px] p-6 shadow-xl border border-neutral-700/50">
            <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                    <img
                        src={image}
                        alt="Profile picture"
                        className="rounded-full size-8 object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-md font-semibold text-white">{name}</h3>
                    <p className="text-neutral-400 text-xs">{username}</p>
                </div>
            </div>
            <p className="mt-4 text-gray-100 text-sm leading-relaxed">
                {description}
            </p>
        </div>
    );
};
