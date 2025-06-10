import { Input } from "@/components/ui/input";
import Layout from "@/layouts/layout";
import { Search, Plus } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

import { ArnsTableRow } from "@/types";
import ArnsTable from "@/components/arns/arns-table";
import { useSearchParams } from "react-router-dom";
import SelectedArns from "@/components/arns/selected-arns";
import { getWalletOwnedNamesindash } from "@/actions/arns/arnslater";
import { useActiveAddress } from "arweave-wallet-kit";
import { ArnsTableSkeleton } from "@/components/skeletons";
import { Link } from "react-router-dom";

const shorten = (str: string, chars = 3) =>
    str && str.length > chars * 2 + 3
        ? `${str.slice(0, chars)}...${str.slice(-chars)}`
        : str;

const ArnsDashboard = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [arnsData, setArnsData] = useState<ArnsTableRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const activeAddress = useActiveAddress();

    useEffect(() => {
        if (!activeAddress) {
            setLoading(false);
            setArnsData([]);
            return;
        }

        setLoading(true);
        getWalletOwnedNamesindash(activeAddress)
            .then((data) => {
                const mapped = data.map((item) => ({
                    name: item.name,
                    role: "Owner",
                    processId: shorten(item.processId),
                    targetId: item.type ?? "",
                    expiry: item.endTimestamp
                        ? new Date(item.endTimestamp).toLocaleDateString()
                        : "",
                    undernameLimit:
                        typeof item.undernameLimit === "number"
                            ? item.undernameLimit
                            : undefined,
                }));
                setArnsData(mapped);
                setError(null);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch ArNS data.");
                setLoading(false);
            });
    }, [activeAddress]);

    const filteredData = useMemo(() => {
        return arnsData.filter((row) =>
            row.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [searchTerm, arnsData]);

    const [searchParams] = useSearchParams();
    const name = searchParams.get("name");
    if (name) {
        const selectedArns = arnsData.find((row) => row.name === name);
        return <SelectedArns name={name} arns={selectedArns} />;
    }

    return (
        <Layout className="container">
            <header className="mt-[40px] flex items-center justify-between gap-4">
                <div className="relative w-full md:max-w-[600px] group">
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-800/20 to-neutral-700/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <h1 className="text-4xl tracking-tight font-bold mb-6">
                        ArNS Dashboard
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-[18px] md:h-[20px] w-[18px] md:w-[20px] transform -translate-y-1/2 text-neutral-500 group-focus-within:text-neutral-400 transition-colors duration-200 z-10" />
                        <Input
                            className="pl-12 pr-4 py-3 w-full rounded-lg bg-arlink-bg-secondary-color hover:border-neutral-500 focus:border-neutral-400 transition-all duration-200 placeholder:text-neutral-500 font-light border-[#383838] focus:ring-2 focus:ring-neutral-600/30 focus-visible:ring-2 focus-visible:ring-neutral-600/30 text-sm md:text-base shadow-sm hover:shadow-md focus:shadow-lg backdrop-blur-sm relative z-0"
                            placeholder="Search your ArNS names..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {arnsData.length > 0 && (
                    <Link
                        to="/arns"
                        className="flex items-center gap-2 bg-white text-black rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Buy ArNS
                    </Link>
                )}
            </header>
            <div className="w-full mt-[24px]">
                {!activeAddress ? (
                    <div>
                        Please connect your wallet to manage your ArNS names.
                    </div>
                ) : loading ? (
                    <ArnsTableSkeleton />
                ) : error ? (
                    <div>{error}</div>
                ) : arnsData.length === 0 ? (
                    <div className="text-center text-neutral-400 py-28">
                        <div className="mb-2 text-xl italic tracking-tight">
                            It looks like you do not own any ArNS names yet...
                        </div>
                        <a href="/arns" className="text-blue-400 underline">
                            Buy your first ArNS name
                        </a>
                    </div>
                ) : (
                    <ArnsTable data={filteredData} />
                )}
            </div>
        </Layout>
    );
};

export default ArnsDashboard;
