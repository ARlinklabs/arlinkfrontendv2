import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Settings } from "lucide-react";
import { ArnsTableProps } from "@/types";
import { Link, useNavigate } from "react-router-dom";

export default function ArnsTable({ data }: ArnsTableProps) {
    const [copiedProcessId, setCopiedProcessId] = useState<string | null>(null);
    const [copiedTargetId, setCopiedTargetId] = useState<string | null>(null);
    const navigate = useNavigate();

    const copyToClipboard = async (
        text: string,
        type: "process" | "type",
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
        <div className="border h-[calc(100svh-260px)] border-[#373737] rounded-md overflow-hidden bg-black ">
            <div className="grid grid-cols-6 bg-[#181819] font-semibold border-b border-[#373737] text-sm text-neutral-200">
                <div className="p-3">ARNS Name</div>
                <div className="p-3">Role</div>
                <div className="p-3">Process ID</div>
                <div className="p-3">Type</div>
                <div className="p-3">Undernames</div>
                <div className="p-3">Expiry</div>
            </div>

            <div className="max-h-[calc(100svh-310px)] overflow-y-scroll pb-4 text-slate-300 ">
                {data.map((row, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        key={index}
                        className={`grid grid-cols-6 font-normal border-b border-[#373737] text-sm hover:bg-[#121212] transition-colors`}
                    >
                        <Link
                            to={`?name=${row.name}`}
                            className="p-3 hover:underline"
                        >
                            {row.name}
                        </Link>
                        <div className="p-3">{row.role}</div>
                        <div className="p-3 flex items-center">
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
                        <div className="p-3 flex items-center">
                            <span>{row.targetId}</span>
                        </div>
                        <div className="p-3">{row.undernameLimit ?? "-"}</div>
                        <div className="p-3 flex items-center justify-between">
                            <span>{row.expiry}</span>
                            <button
                                onClick={() => navigate(`?name=${row.name}`)}
                                className="hover:bg-[#232323] rounded-full p-1 transition ml-2"
                                aria-label="View details"
                            >
                                <Settings className="w-4 h-4 text-neutral-500 hover:text-neutral-300 cursor-pointer" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
