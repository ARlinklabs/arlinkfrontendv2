import { EarthIcon } from "../ui/earth-icon";
import { DomainTupleData } from "@/types";
import { Separator } from "../ui/separator";
import { Link } from "react-router-dom";

const DomainTuple = ({ name, available, lease, permaBuy }: DomainTupleData) => {
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
                                <Separator
                                    orientation="vertical"
                                    className="inline-block h-[8px] bg-neutral-400"
                                />
                            </>
                        )}
                        <span>Lease {lease} ARIO for one year</span>
                    </span>
                </div>
            </div>
            <div className="space-x-2">
                <span className="text-lg font-medium text-neutral-200">
                    {permaBuy}
                </span>
                <span className="text-xs">ARIO</span>
            </div>
        </Link>
    );
};
export default DomainTuple;
