import { motion } from "framer-motion";

const AnimatedDescription = ({
    descriptionString,
}: {
    descriptionString: string[];
}) => {
    return (
        <>
            {descriptionString.map((item, index) => (
                <motion.p
                    key={item}
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.8,
                        delay: index * 0.2,
                        ease: [0.25, 0.1, 0, 0.9],
                    }}
                >
                    {item}
                </motion.p>
            ))}
        </>
    );
};

export default AnimatedDescription;
