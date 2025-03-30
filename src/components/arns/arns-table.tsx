import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { ArnsTableProps } from "@/types";
import { Link, useSearchParams } from "react-router-dom";

export default function ArnsTable({ data }: ArnsTableProps) {
    const [copiedProcessId, setCopiedProcessId] = useState<string | null>(null);
    const [copiedTargetId, setCopiedTargetId] = useState<string | null>(null);

    const copyToClipboard = async (
        text: string,
        type: "process" | "target",
        id: string,
    ) => {
        await navigator.clipboard.writeText(text);

        if (type === "process") {
            setCopiedProcessId(id);
            setTimeout(() => setCopiedProcessId(null), 2000);
        } else {
            setCopiedTargetId(id);
            setTimeout(() => setCopiedTargetId(null), 2000);
        }
    };

    return (
        <div className="border h-[calc(100svh-260px)] border-[#373737] rounded-md overflow-hidden bg-[#0d0d0d] text-white">
            <div className="grid grid-cols-5 bg-[#181819]  font-semibold border-b border-[#373737] text-sm">
                <div className="p-4">Arns Name</div>
                <div className="p-4">Role</div>
                <div className="p-4">Process ID</div>
                <div className="p-4">Target ID</div>
                <div className="p-4">Expiry</div>
            </div>

            <div className="max-h-[calc(100svh-310px)] overflow-y-scroll pb-4">
                {data.map((row, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        key={index}
                        className={`grid grid-cols-5 font-medium ${index !== data.length - 1 && "border-b"} border-[#373737] text-sm hover:bg-[#121212] transition-colors`}
                    >
                        <Link
                            to={`?name=${row.name}`}
                            className="p-4 hover:underline"
                        >
                            {row.name}
                        </Link>
                        <div className="p-4">{row.role}</div>
                        <div className="p-4 flex items-center">
                            <span>{row.processId}</span>
                            <button
                                className="ml-2 p-1 hover:bg-[#212121] rounded-md transition-colors"
                                onClick={() =>
                                    copyToClipboard(
                                        row.processId,
                                        "process",
                                        row.name,
                                    )
                                }
                                aria-label="Copy process ID"
                            >
                                {copiedProcessId === row.name ? (
                                    <Check
                                        size={14}
                                        className="text-green-500"
                                    />
                                ) : (
                                    <Copy
                                        size={14}
                                        className="text-[#818181]"
                                    />
                                )}
                            </button>
                        </div>
                        <div className="p-4 flex items-center">
                            <span>{row.targetId}</span>
                            <button
                                className="ml-2 p-1 hover:bg-[#212121] rounded-md transition-colors"
                                onClick={() =>
                                    copyToClipboard(
                                        row.targetId,
                                        "target",
                                        row.name,
                                    )
                                }
                                aria-label="Copy target ID"
                            >
                                {copiedTargetId === row.name ? (
                                    <Check
                                        size={14}
                                        className="text-green-500"
                                    />
                                ) : (
                                    <Copy
                                        size={14}
                                        className="text-[#818181]"
                                    />
                                )}
                            </button>
                        </div>
                        <div className="p-4">{row.expiry}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
