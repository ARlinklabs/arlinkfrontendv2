import { Input } from "@/components/ui/input";
import Layout from "@/layouts/layout";
import { Search, Plus } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

import { ArnsTableRow } from "@/types";
import ArnsTable from "@/components/arns/arns-table";
import { useSearchParams } from "react-router-dom";
import SelectedArns from "@/components/arns/selected-arns";
import { getWalletOwnedNamesindash } from "@/actions/arns/arnslater";
import { useActiveAddress } from "@/lib/wallet-strategies";
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
                    role: "Owner", // Adjust if you have role info
                    processId: shorten(item.processId),
                    targetId: item.type ?? "", // Ensure string
                    expiry: item.endTimestamp
                        ? new Date(item.endTimestamp).toLocaleDateString()
                        : "",
                    undernameLimit: typeof item.undernameLimit === 'number' ? item.undernameLimit : undefined,
                }));
                setArnsData(mapped);
                setError(null); // Clear error if fetch succeeds
                setLoading(false);
            })
            .catch(() => {
                // setError("Failed to fetch data");
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
        // Find the already-fetched arns data for this name
        const selectedArns = arnsData.find((row) => row.name === name);
        return <SelectedArns name={name} arns={selectedArns} />;
    }

 
    return (
        <Layout className="container">
            <header className="mt-[60px] flex items-center justify-between gap-4">
                <div className="relative w-full md:max-w-[600px]">
                    <Search className="absolute left-3 top-1/2 h-[18px] md:h-[20px] w-[18px] md:w-[20px] transform -translate-y-1/2 text-neutral-600" />
                    <Input
                        className="pl-10 w-full rounded-md bg-arlink-bg-secondary-color hover:border-neutral-600 transition-colors placeholder:text-neutral-400 font-light border-[#383838] focus:ring-neutral-700 focus-visible:ring-neutral-700 text-sm md:text-base"
                        placeholder="Search your ArNS names..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
            <div className="w-full mt-[50px]">
                {!activeAddress ? (
                    <div>Please connect your wallet to manage your ArNS names.</div>
                ) : loading ? (
                    <ArnsTableSkeleton />
                ) : error ? (
                    <div>{error}</div>
                ) : arnsData.length === 0 ? (
                    <div className="text-center text-neutral-400 py-12">
                        <div className="mb-2">It looks like you do not own any ArNS names yet...</div>
                        <a href="/arns" className="text-blue-400 underline">Buy your first ArNS name</a>
                    </div>
                ) : (
                    <ArnsTable data={filteredData} />
                )}
            </div>
        </Layout>
    );
};

export default ArnsDashboard;