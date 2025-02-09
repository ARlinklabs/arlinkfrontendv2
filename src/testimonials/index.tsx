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

    const testimonials = Array(5).fill(null);

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
                {testimonials.concat(testimonials).map((_, index) => (
                    <TestimonialCard key={index} />
                ))}
            </motion.div>
        </div>
    );
};

const TestimonialCard = () => {
    return (
        <div className="rounded-3xl transition-all hover:bg-[#151517] hover:border-transparent flex-shrink-0 max-w-[400px] p-6 shadow-xl border border-neutral-700/50">
            <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                    <img
                        src="sentio.png"
                        alt="Profile picture"
                        className="rounded-full size-8 object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-md font-semibold text-white">
                        Aarav Patel
                    </h3>
                    <p className="text-neutral-400 text-xs">
                        Software Developer
                    </p>
                </div>
            </div>
            <p className="mt-4 text-gray-100 text-sm leading-relaxed">
                Arlink has completely transformed how I deploy my projects. The
                process is so smooth, and the CI/CD integration saves me hours
                of manual work!
            </p>
        </div>
    );
};
