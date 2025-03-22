"use client";

import DomainCommandPallete from "@/components/arns/domain-command-pallete";
import { Input } from "@/components/ui/input";
import Layout from "@/layouts/layout";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLinkIcon, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Arns() {
    const [active, setActive] = useState<boolean>(false);
    const [value, setValue] = useState<string>("");
    const [openDomainCommandPallete, setOpenDomainCommandPallete] =
        useState<boolean>(false);

    const hanldeOpenDomainCommandPallete = (value: string) => {
        setValue(value);
        if (value.length > 2) {
            setOpenDomainCommandPallete(true);
        }
    };

    return (
        <Layout>
            <AnimatePresence mode="wait">
                {openDomainCommandPallete ? (
                    <motion.div
                        key="domain-command-palette"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.1 }}
                    >
                        <DomainCommandPallete
                            value={value}
                            setValue={setValue}
                        />
                    </motion.div>
                ) : (
                    <motion.section
                        key="search-section"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="py-10 container h-[calc(100dvh-200px)] flex items-center justify-center"
                    >
                        <div className="flex flex-col justify-center items-center gap-8 -translate-y-12">
                            <h1 className="text-5xl font-semibold text-center tracking-tight">
                                Get Your Smart Domain
                            </h1>
                            <div
                                className={`flex justify-center items-center ${!active ? "border-neutral-500" : "border-white"} transition-all border-b pb-2 group px-24`}
                            >
                                <div className="flex items-center relative">
                                    {/* Todo: Shrink the input width when user keeps typing */}
                                    <Input
                                        value={value}
                                        className="text-center border border-none focus-visible:ring-offset-0 focus:ring-0 bg-transparent focus-visible:ring-0"
                                        placeholder="Search for an Arns"
                                        onClick={() => {
                                            setActive(true);
                                        }}
                                        onChange={(e) =>
                                            hanldeOpenDomainCommandPallete(
                                                e.target.value,
                                            )
                                        }
                                        onBlur={() => setActive(false)}
                                    />
                                    <Search className="size-5 text-neutral-500 absolute left-4" />
                                </div>
                            </div>
                            <Link
                                to="/learn-more"
                                className="flex items-center gap-2 text-neutral-500 hover:text-white transition-all text-sm"
                            >
                                Learn more <ExternalLinkIcon size={16} />
                            </Link>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
        </Layout>
    );
}
