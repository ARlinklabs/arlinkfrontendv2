import { motion } from "framer-motion";

const Tile = () => {
    return (
        <motion.div
            whileHover={{
                zIndex: 1,
                backgroundColor: "#9898a9",
            }}
            transition={{
                duration: 2,
                ease: "easeOut",
            }}
            className="aspect-square border bg-[#09090B] border-neutral-900"
        />
    );
};
export default Tile;
