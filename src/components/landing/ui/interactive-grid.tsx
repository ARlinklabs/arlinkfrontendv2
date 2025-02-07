import Tile from "./tile";

export const InteractiveGrid = () => {
    return (
        <section className="w-full grid grid-cols-20 h-full overflow-y-clip">
            {Array.from(Array(20 * 12), (i) => (
                <Tile key={i} />
            ))}
        </section>
    );
};

