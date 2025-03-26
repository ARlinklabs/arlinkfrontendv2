import { getArNSPrice } from "@/actions/arns/arnslater";
import { EarthIcon } from "../ui/earth-icon";
import { DomainTupleData } from "@/types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

const DomainTuple = ({
    name,
    available,
}: {
    name: string;
    available: boolean;
}) => {
    const [leasePrice, setLeasePrice] = useState<number | null>(null);
    const [permaBuyPrice, setPermaBuyPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrice();
    }, []);

    const fetchPrice = async () => {
        const value = await getArNSPrice(name);
        if (value.error) {
            setLoading(false);
            return;
        }
        const { lease, permabuy } = value;
        if (lease) {
            setLeasePrice(lease.priceInArio.valueOf());
        }
        if (permabuy) {
            setPermaBuyPrice(permabuy.priceInArio.valueOf());
        }
        setLoading(false);
    };

    return (
        <Link
            to={`/arns?name=${name}`}
            className="text-neutral-500 hover:text-white transition-colors p-2 px-4 flex items-start cursor-pointer justify-between gap-48"
        >
            <div className="flex gap-4">
                <EarthIcon className="size-5" />
                <div className="leading-tight">
                    <div className="text-white font-medium">{name}</div>
                    <span className="text-xs space-x-1">
                        {available && (
                            <>
                                <span className="text-xs text-white">
                                    <span className="inline-block size-2 bg-green-300 rounded-full" />{" "}
                                    available
                                </span>
                                {loading ? (
                                    <>
                                        <Separator
                                            orientation="vertical"
                                            className="inline-block h-[8px] bg-neutral-400"
                                        />

                                        <Skeleton className="w-52 translate-y-0.5 h-3 rounded-sm inline-block" />
                                    </>
                                ) : (
                                    leasePrice && (
                                        <>
                                            <Separator
                                                orientation="vertical"
                                                className="inline-block h-[8px] bg-neutral-400"
                                            />
                                            <span>
                                                Lease {leasePrice} ARIO for one
                                                year
                                            </span>
                                        </>
                                    )
                                )}
                            </>
                        )}
                    </span>
                </div>
            </div>
            {loading ? (
                <Skeleton className="w-24 h-10" />
            ) : (
                permaBuyPrice && (
                    <div className="space-x-2">
                        <span className="text-lg font-medium text-neutral-200">
                            {permaBuyPrice}
                        </span>
                        <span className="text-xs">ARIO</span>
                    </div>
                )
            )}
        </Link>
    );
};

export const AvailableDomainTuple = ({ name, available }: DomainTupleData) => {
    const [leasePrice, setLeasePrice] = useState<number | null>(null);
    const [permaBuyPrice, setPermaBuyPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrice();
    }, []);

    const fetchPrice = async () => {
        const value = await getArNSPrice(name);
        if (value.error) {
            setLoading(false);
            return;
        }
        const { lease, permabuy } = value;
        if (lease) {
            setLeasePrice(lease.priceInArio.valueOf());
        }
        if (permabuy) {
            setPermaBuyPrice(permabuy.priceInArio.valueOf());
        }
        setLoading(false);
    };

    return (
        <Link
            to={`/arns?name=${name}`}
            className="text-neutral-500 hover:text-white transition-colors p-2 px-4 flex items-start cursor-pointer justify-between gap-48"
        >
            <div className="flex gap-4">
                <EarthIcon className="size-5" />
                <div className="leading-tight">
                    <div className="text-white font-medium">{name}</div>
                    <span className="text-xs space-x-1">
                        {available && (
                            <>
                                <span className="text-xs text-white">
                                    <span className="inline-block size-2 bg-green-300 rounded-full" />{" "}
                                    available
                                </span>
                                {loading ? (
                                    <>
                                        <Separator
                                            orientation="vertical"
                                            className="inline-block h-[8px] bg-neutral-400"
                                        />

                                        <Skeleton className="w-52 translate-y-0.5 h-3 rounded-sm inline-block" />
                                    </>
                                ) : (
                                    leasePrice && (
                                        <>
                                            <Separator
                                                orientation="vertical"
                                                className="inline-block h-[8px] bg-neutral-400"
                                            />
                                            <span>
                                                Lease {leasePrice} ARIO for one
                                                year
                                            </span>
                                        </>
                                    )
                                )}
                            </>
                        )}
                    </span>
                </div>
            </div>
            {loading ? (
                <Skeleton className="w-24 h-10" />
            ) : (
                permaBuyPrice && (
                    <div className="space-x-2">
                        <span className="text-lg font-medium text-neutral-200">
                            {permaBuyPrice}
                        </span>
                        <span className="text-xs">ARIO</span>
                    </div>
                )
            )}
        </Link>
    );
};
export default DomainTuple;
