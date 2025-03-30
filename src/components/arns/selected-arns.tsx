import Layout from "@/layouts/layout";
import { tableData } from "@/pages/arns/dashboard";
import { Calendar } from "@phosphor-icons/react";
import { Clock, Copy, Edit, FileUp } from "lucide-react";

const SelectedArns = ({ name }: { name: string }) => {
    const arns = tableData.find((data) => data.name === name);
    if (!arns) return;

    return (
        <Layout className="container">
            <ArnsHeader anrsAddres={arns.processId} arnsName={arns.name} />
            <ArnsStats />
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

const ArnsStats = () => {
    return (
        <>
            <header className="bg-[#0d0d0d] border-[#373737] border rounded-lg mb-8 grid grid-cols-3 divide-x divide-[#373737]">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <Calendar className="w-5 h-5 mr-2" />
                        <h2 className="text-xl font-medium">Undernames</h2>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg">2,140 / 4,278</span>
                        <button className="bg-white text-black rounded-md px-4 py-2 text-sm font-medium">
                            Manage
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <Clock className="w-5 h-5 mr-2" />
                        <h2 className="text-xl font-medium">TTL</h2>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg">990</span>
                        <button className="bg-white text-black rounded-md px-4 py-2 text-sm font-medium">
                            Manage
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
                        <span className="text-lg">990</span>
                        <button className="bg-white text-black rounded-md px-4 py-2 text-sm font-medium">
                            Upload
                        </button>
                    </div>
                </div>
            </header>

            {/* Details Section */}
            <div className="bg-[#0d0d0d] border-[#373737] border  h-[calc(100svh-420px)] rounded-lg overflow-hidden">
                <div className="border-b border-[#373737] p-4 flex justify-between items-center">
                    <span className="font-medium w-1/4">Target ID</span>
                    <div className="flex items-center flex-1">
                        <span className="text-neutral-400">
                            QDVqcX_mm_rDwj_EGP9lQjo0UQDaFhWwpjWLaFPGueE
                        </span>
                        <button className="ml-2">
                            <Copy className="w-4 h-4 text-neutral-400" />
                        </button>
                    </div>
                </div>

                <div className="border-b border-[#373737] p-4 flex justify-between items-center">
                    <span className="font-medium w-1/4">Expiry Date</span>
                    <span className="flex-1">2026-10-23</span>
                </div>

                <div className="border-b border-[#373737] p-4 flex justify-between items-center">
                    <span className="font-medium w-1/4">Lease Duration</span>
                    <div className="flex items-center justify-between flex-1">
                        <span>2026-10-23</span>
                        <button className="bg-white text-black rounded-md px-4 py-2 text-sm font-medium">
                            Extend Lease
                        </button>
                    </div>
                </div>

                <div className="p-4 flex justify-between items-center">
                    <span className="font-medium w-1/4">Description</span>
                    <div className="flex items-center justify-between flex-1">
                        <span>This is a description</span>
                        <button>
                            <Edit className="w-4 h-4 text-neutral-400" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SelectedArns;
