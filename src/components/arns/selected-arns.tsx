import Layout from "@/layouts/layout";
import { Calendar } from "@phosphor-icons/react";
import { Clock, Copy, Edit, ArrowLeftFromLine } from "lucide-react";
import { getWalletOwnedNamesindash, getArNSRecordInfo, getArNSstate } from "@/actions/arns/arnslater";
import { useActiveAddress } from "@arweave-wallet-kit/react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArnsDetailsSkeleton } from "@/components/skeletons";
import { ArnsState } from "@/types";
import { EditArnsModal } from "./edit-arns-modal";
import { TtlEditModal } from "./ttl-edit-modal";
import { toast } from "@/components/ui/use-toast";
import { makePrimaryNameRequest } from "@/actions/arns/arnslater";
import { IncreaseUndernamesModal } from "./increase-undernames-modal";
import { ExtendLeaseModal } from "./extend-lease-modal";


const SelectedArns = ({ name: nameProp, arns: arnsProp }: { name: string; arns?: any }) => {
    const activeAddress = useActiveAddress();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const nameFromUrl = searchParams.get("name");
    const name = nameProp || nameFromUrl;
    const [arns, setArns] = useState<any | null>(arnsProp ?? null);
    const [arnsState, setArnsState] = useState<ArnsState | null>(null);
    const [loading, setLoading] = useState(arnsProp ? false : true);
    const [stateLoading, setStateLoading] = useState(false);
    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        field: "Ticker" | "Description" | "Logo";
        value: string;
    } | null>(null);
    const [ttlModal, setTtlModal] = useState<{
        isOpen: boolean;
        currentTtl: number;
        transactionId: string;
    } | null>(null);

    useEffect(() => {
        if (!name) {
            setLoading(false);
            setArns(null);
            return;
        }

        const fetchArnsData = async () => {
            setLoading(true);
            try {
                // First try to get from dashboard data
                if (activeAddress) {
                    const dashboardData = await getWalletOwnedNamesindash(activeAddress);
                    const found = dashboardData.find((item) => item.name === name);
                    if (found) {
                        setArns(found);
                        setLoading(false);
                        return;
                    }
                }

                // If not found in dashboard data, fetch from ArNS record
                const recordInfo = await getArNSRecordInfo(name);
                if (recordInfo) {
                    setArns({
                        name: name,
                        processId: recordInfo.processId,
                        startTimestamp: recordInfo.startTimestamp,
                        // @ts-ignore
                        endTimestamp: recordInfo.endTimestamp,
                        type: recordInfo.type,
                        undernameLimit: recordInfo.undernameLimit,
                    });
                } else {
                    setArns(null);
                }
            } catch (error) {
                console.error("Error fetching ArNS data:", error);
                setArns(null);
            } finally {
                setLoading(false);
            }
        };

        fetchArnsData();
    }, [activeAddress, name, arnsProp]);

    // Fetch ArNS state when processId is available
    useEffect(() => {
        const fetchArnsState = async () => {
            if (!arns?.processId) return;
            
            setStateLoading(true);
            try {
                const state = await getArNSstate(arns.processId);
                setArnsState(state);
            } catch (error) {
                console.error("Error fetching ArNS state:", error);
            } finally {
                setStateLoading(false);
            }
        };

        fetchArnsState();
    }, [arns?.processId]);

    const handleEditClick = (field: "Ticker" | "Description" | "Logo", value: string) => {
        setEditModal({
            isOpen: true,
            field,
            value
        });
    };

    const handleEditSuccess = () => {
        // Refresh the ArNS state data
        if (arns?.processId) {
            getArNSstate(arns.processId).then(setArnsState);
        }
    };

    const handleTtlEdit = (currentTtl: number, transactionId: string) => {
        setTtlModal({
            isOpen: true,
            currentTtl,
            transactionId
        });
    };

    const handleTtlSuccess = () => {
        // Refresh the ArNS state data
        if (arns?.processId) {
            getArNSstate(arns.processId).then(setArnsState);
        }
    };

    if (loading || stateLoading) {
        return <ArnsDetailsSkeleton />;
    }

    if (!arns) {
        return (
            <Layout className="container">
                <div className="mt-[10px]">
                    <button
                        className="flex items-center gap-1 text-neutral-400 hover:text-white transition text-sm mb-4"
                        onClick={() => navigate('/arns/dashboard')}
                    >
                        <ArrowLeftFromLine className="w-4 h-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                </div>
                <div className="text-center py-12">
                    <h2 className="text-xl font-medium mb-2">ArNS Record Not Found</h2>
                    <p className="text-neutral-400">The requested ArNS record could not be found.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout className="container">
            <div className="mt-[10px] ">
                <button
                    className="flex items-center gap-1 text-neutral-400 hover:text-white transition text-sm mb-4"
                    onClick={() => navigate('/arns/dashboard')}
                >
                    <ArrowLeftFromLine className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                </button>
                {arns && <ArnsHeader anrsAddres={arns.processId} arnsName={arns.name} arns={arns} />}
            </div>
            <ArnsStats 
                arns={arns} 
                arnsState={arnsState} 
                setArnsState={setArnsState}
            />
            
            {/* Additional ArNS State Information */}
            <div className="mt-8 bg-[#0d0d0d] border-[#373737] border rounded-lg overflow-hidden">
                <h2 className="text-xl font-medium p-4 border-b border-[#373737]">Additional Information</h2>
                {stateLoading ? (
                    <div className="p-4 space-y-4">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[300px]" />
                    </div>
                ) : arnsState ? (
                    <div className="divide-y divide-[#373737]">
                        <TableRow 
                            label="Ticker" 
                            value={arnsState.Ticker || "N/A"} 
                            editable 
                            onEdit={() => handleEditClick("Ticker", arnsState.Ticker || "")}
                        />
                        <TableRow 
                            label="Description" 
                            value={arnsState.Description || "No description"} 
                            editable 
                            onEdit={() => handleEditClick("Description", arnsState.Description || "")}
                        />
                        {arnsState.Logo && (
                            <TableRow 
                                label="Logo" 
                                value={arnsState.Logo} 
                                copy 
                                editable
                                onEdit={() => handleEditClick("Logo", arnsState.Logo || "")}
                            />
                        )}
                    </div>
                ) : (
                    <div className="p-4 text-neutral-400">No additional information available</div>
                )}
            </div>

            {editModal && (
                <EditArnsModal
                    isOpen={editModal.isOpen}
                    onClose={() => setEditModal(null)}
                    field={editModal.field}
                    currentValue={editModal.value}
                    processId={arns?.processId}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* TTL Modal */}
            {ttlModal && (
                <TtlEditModal
                    isOpen={ttlModal.isOpen}
                    onClose={() => setTtlModal(null)}
                    processId={arns?.processId}
                    currentTtl={ttlModal.currentTtl}
                    transactionId={ttlModal.transactionId}
                    onSuccess={handleTtlSuccess}
                />
            )}
        </Layout>
    );
};

const ArnsHeader = ({
    arnsName,
    anrsAddres,
    arns,
   
       
}: {
    arnsName: string;
    anrsAddres: string;
    arns: any;
    
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleMakePrimary = async () => {
        try {
            setIsLoading(true);
            const result = await makePrimaryNameRequest(arnsName , arns.processId );
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Primary name request submitted successfully",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to make primary name request",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex mt-[30px] justify-between items-center mb-8">
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
            <button 
                className="bg-white text-black rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleMakePrimary}
                disabled={isLoading}
            >
                {isLoading ? "Processing..." : "Make Primary"}
            </button>
        </div>
    );
};

const ArnsStats = ({ 
    arns, 
    arnsState,
    setArnsState 
}: { 
    arns: any; 
    arnsState: ArnsState | null;
    setArnsState: (state: ArnsState | null) => void;
}) => {
    const [ttlModal, setTtlModal] = useState<{
        isOpen: boolean;
        currentTtl: number;
        transactionId: string;
    } | null>(null);

    const [undernamesModal, setUndernamesModal] = useState(false);
    const [extendLeaseModal, setExtendLeaseModal] = useState(false);

    const handleTtlEdit = (currentTtl: number, transactionId: string) => {
        setTtlModal({
            isOpen: true,
            currentTtl,
            transactionId
        });
    };

    const handleTtlSuccess = () => {
        // Refresh the ArNS state data
        if (arns?.processId) {
            getArNSstate(arns.processId).then(setArnsState);
        }
    };

    const handleUndernamesSuccess = () => {
        // Refresh the ArNS state data
        if (arns?.processId) {
            getArNSstate(arns.processId).then(setArnsState);
        }
    };

    const handleExtendLeaseSuccess = () => {
        // Refresh the ArNS state data
        if (arns?.processId) {
            getArNSstate(arns.processId).then(setArnsState);
        }
    };

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
                        <button 
                            className="bg-white text-black rounded-md px-4 py-2 text-sm font-medium"
                            onClick={() => setUndernamesModal(true)}
                        >
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
                                ? new Date(Number(arns.endTimestamp)).toLocaleDateString('en-GB')
                                : "N/A"}
                        </span>
                        <button 
                            className="bg-white text-black rounded-md px-4 py-2 text-sm font-medium"
                            onClick={() => setExtendLeaseModal(true)}
                        >
                            Extend Lease
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <Clock className="w-5 h-5 mr-2" />
                        <h2 className="text-xl font-medium">TTL</h2>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg">
                            {arnsState?.Records?.["@"]?.ttlSeconds 
                                ? `${Math.floor(arnsState.Records["@"].ttlSeconds / 60)} minutes`
                                : "N/A"}
                        </span>
                        <button 
                            className="bg-white text-black rounded-md px-4 py-2 text-sm font-medium"
                            onClick={() => {
                                if (arnsState?.Records?.["@"]?.ttlSeconds && arnsState?.Records?.["@"]?.transactionId) {
                                    handleTtlEdit(
                                        arnsState.Records["@"].ttlSeconds,
                                        arnsState.Records["@"].transactionId
                                    );
                                }
                            }}
                        >
                            Update
                        </button>
                    </div>
                </div>
            </header>

            {/* Details Section */}
            <div className="bg-[#0d0d0d] border-[#373737] border rounded-lg overflow-hidden">
                <TableRow 
                    label="Target ID" 
                    value={arnsState?.Records?.["@"]?.transactionId ?? "N/A"} 
                    copy 
                />
                <TableRow
                    label="Expiry Date"
                    value={
                        arns.endTimestamp
                            ? new Date(Number(arns.endTimestamp)).toLocaleDateString('en-GB')
                            : "N/A"
                    }
                />
                <TableRow
                    label="Lease Duration"
                    value={
                        arns.startTimestamp && arns.endTimestamp
                            ? `${Math.round((Number(arns.endTimestamp) - Number(arns.startTimestamp)) / (1000 * 60 * 60 * 24 * 365))} years`
                            : "N/A"
                    }
                />
            </div>

            {/* TTL Modal */}
            {ttlModal && (
                <TtlEditModal
                    isOpen={ttlModal.isOpen}
                    onClose={() => setTtlModal(null)}
                    processId={arns?.processId}
                    currentTtl={ttlModal.currentTtl}
                    transactionId={ttlModal.transactionId}
                    onSuccess={handleTtlSuccess}
                />
            )}

            {/* Undernames Modal */}
            <IncreaseUndernamesModal
                isOpen={undernamesModal}
                onClose={() => setUndernamesModal(false)}
                arnsName={arns.name}
                onSuccess={handleUndernamesSuccess}
            />

            {/* Extend Lease Modal */}
            <ExtendLeaseModal
                isOpen={extendLeaseModal}
                onClose={() => setExtendLeaseModal(false)}
                arnsName={arns.name}
                onSuccess={handleExtendLeaseSuccess}
            />
        </>
    );
};

const TableRow = ({
    label,
    value,
    copy,
    editable,
    onEdit,
}: {
    label: string;
    value: string;
    copy?: boolean;
    editable?: boolean;
    onEdit?: () => void;
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
                {editable && onEdit && (
                    <button onClick={onEdit}>
                        <Edit className="w-4 h-4 text-neutral-400" />
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default SelectedArns;