import Layout from "@/layouts/layout";
import { Calendar } from "@phosphor-icons/react";
import { Clock, Copy, Edit, FileUp } from "lucide-react";
import { getWalletOwnedNamesindash } from "@/actions/arns/arnslater";
import { useActiveAddress } from "arweave-wallet-kit";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftFromLine } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SelectedArns = ({ name, arns: arnsProp }: { name: string; arns?: any }) => {
    const activeAddress = useActiveAddress();
    const navigate = useNavigate();
    const [arns, setArns] = useState<any | null>(arnsProp ?? null);
    const [loading, setLoading] = useState(arnsProp ? false : true);

    useEffect(() => {
        if (arnsProp) return; // If arns is provided, skip fetch
        if (!activeAddress) {
            setLoading(false);
            setArns(null);
            return;
        }
        setLoading(true);
        getWalletOwnedNamesindash(activeAddress).then((data) => {
            const found = data.find((item) => item.name === name);
            setArns(found || null);
            setLoading(false);
        });
    }, [activeAddress, name, arnsProp]);

    if (loading) {
        return (
            <Layout className="container">
                <div className="mt-[60px]">
                    <button
                        className="mb-6 flex items-center gap-2 text-neutral-400 hover:text-white transition"
                        onClick={() => navigate('/dashboard')}
                    >
                        <ArrowLeftFromLine className="w-5 h-5" />
                       
                    </button>
                    <Skeleton className="h-10 w-1/3 mb-4" />
                    <Skeleton className="h-6 w-1/2 mb-8" />
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <Skeleton className="h-96 w-full" />
                </div>
            </Layout>
        );
    }
    if (!loading && !arns) {
        return (
            <Layout className="container">
                <div className="mt-[60px] text-center text-neutral-400">
                    <button
                        className="mb-6 flex items-center gap-2 text-neutral-400 hover:text-white transition"
                        onClick={() => navigate('/dashboard')}
                    >
                        <ArrowLeftFromLine className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </button>
                    ArNS name not found.
                </div>
            </Layout>
        );
    }

    return (
        <Layout className="container relative">
            <button
                className="absolute left-0 top-[56px] flex items-center gap-1 text-neutral-400 hover:text-white transition text-xs px-2 py-1 z-10 bg-transparent"
                style={{ minHeight: 0, minWidth: 0 }}
                onClick={() => navigate('/dashboard')}
            >
                <ArrowLeftFromLine className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
            </button>
            <div className="pt-2" />
            <ArnsHeader anrsAddres={arns.processId} arnsName={arns.name} />
            <ArnsStats arns={arns} />
        </Layout>
    );
};

const ArnsHeader = ({
    arnsName,
    anrsAddres,
}: {
    arnsName: string;
    anrsAddres: string;
}) => {
    return (
        <div className="flex mt-[60px] justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">{arnsName}</h1>
                <div className="flex items-center">
                    <span className="text-sm text-neutral-400">
                        {anrsAddres}
                    </span>
                    <button className="ml-2">
                        <Copy className="w-4 h-4 text-neutral-400" />
                    </button>
                </div>
            </div>
            <button className="bg-white text-black rounded-md px-4 py-2 text-sm font-medium">
                Make Primary
            </button>
        </div>
    );
};

const ArnsStats = ({ arns }: { arns: any }) => {
    return (
        <>
            <header className="bg-[#0d0d0d] border-[#373737] border rounded-lg mb-8 grid grid-cols-3 divide-x divide-[#373737]">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <Calendar className="w-5 h-5 mr-2" />
                        <h2 className="text-xl font-medium">Undernames</h2>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg">
                            {arns.undernameLimit ?? "N/A"}
                        </span>
                        <button className="bg-white text-black rounded-md px-4 py-2 text-sm font-medium">
                            Manage
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <Clock className="w-5 h-5 mr-2" />
                        <h2 className="text-xl font-medium">Expiry</h2>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg">
                            {arns.endTimestamp
                                ? new Date(arns.endTimestamp).toLocaleDateString()
                                : "N/A"}
                        </span>
                        <button className="bg-white text-black rounded-md px-4 py-2 text-sm font-medium">
                            Extend Lease
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <FileUp className="w-5 h-5 mr-2" />
                        <h2 className="text-xl font-medium">
                            Upload Arns Image
                        </h2>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg">-</span>
                        <button className="bg-white text-black rounded-md px-4 py-2 text-sm font-medium">
                            Upload
                        </button>
                    </div>
                </div>
            </header>

            {/* Details Section */}
            <div className="bg-[#0d0d0d] border-[#373737] border rounded-lg overflow-hidden">
                <TableRow label="Target ID" value={arns.targetId ?? arns.processId ?? "N/A"} copy />
                <TableRow
                    label="Expiry Date"
                    value={
                        arns.endTimestamp
                            ? new Date(arns.endTimestamp).toLocaleDateString()
                            : "N/A"
                    }
                />
                <TableRow
                    label="Lease Duration"
                    value={
                        arns.startTimestamp && arns.endTimestamp
                            ? `${new Date(arns.startTimestamp).toLocaleDateString()} - ${new Date(arns.endTimestamp).toLocaleDateString()}`
                            : "N/A"
                    }
                />
                <TableRow
                    label="Description"
                    value={arns.description ?? "No description"}
                    editable
                />
            </div>
        </>
    );
};

const TableRow = ({
    label,
    value,
    copy,
    editable,
}: {
    label: string;
    value: string;
    copy?: boolean;
    editable?: boolean;
}) => (
    <div className="border-b border-[#373737] p-4 flex justify-between items-center">
        <span className="font-medium w-1/4">{label}</span>
        <div className="flex items-center flex-1 justify-between">
            <span className="text-neutral-400">{value}</span>
            <div className="flex items-center gap-2">
                {copy && (
                    <button
                        className="ml-2"
                        onClick={() => {
                            navigator.clipboard.writeText(value);
                        }}
                    >
                        <Copy className="w-4 h-4 text-neutral-400" />
                    </button>
                )}
                {editable && (
                    <button>
                        <Edit className="w-4 h-4 text-neutral-400" />
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default SelectedArns;