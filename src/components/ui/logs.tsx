import { Copy } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function Logs({ logs }: { logs: string[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [logs]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(logs.join("\n"));
            toast.success("Successfully copied to clipboard");
        } catch (err) {
            console.error("Failed to copy text: ", err);
            toast.error("Faield to copy to clipboard");
        }
    };

    return (
        <div className="w-full">
            <div className="w-full relative border-t border-neutral-800 mx-auto bg-neutral-950 overflow-hidden">
                <div
                    ref={scrollRef}
                    className="h-96  overflow-y-scroll overflow-x-hidden"
                >
                    <div className="font-mono  py-4 text-sm leading-6 cursor-default">
                        {logs
                            .filter((line) => (line.length !== 0 ? line : null))
                            .map((line, index) => (
                                <div
                                    key={`${index}-${line}`}
                                    className={`flex ${
                                        line.toLowerCase().includes("error")
                                            ? "bg-red-900/50 hover:bg-red-900/80"
                                            : line
                                                  .toLowerCase()
                                                  .includes("warning")
                                            ? "bg-yellow-500/20 hover:bg-yellow-500/30"
                                            : "hover:bg-neutral-800"
                                    }  py-0.25  `}
                                >
                                    <span className="text-neutral-500 w-12 flex-shrink-0 text-right pr-4">
                                        {index + 1}
                                    </span>
                                    <span
                                        className={` ${
                                            line.toLowerCase().includes("error")
                                                ? "text-red-400"
                                                : line
                                                      .toLowerCase()
                                                      .includes("warning")
                                                ? "text-yellow-400"
                                                : "text-white"
                                        } flex-1`}
                                    >
                                        {line}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
                <Copy
                    className="top-4 cursor-pointer right-2 absolute z-50"
                    size={15}
                    onClick={() => handleCopy()}
                />
                <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-neutral-950 to-transparent pointer-events-none" />
            </div>
        </div>
    );
}
