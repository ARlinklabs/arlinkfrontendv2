import { SetStateAction, useEffect, useMemo, useRef } from "react";
import { Input } from "../ui/input";
import { ChevronLeft, Search } from "lucide-react";
import { EarthIcon } from "../ui/earth-icon";
import { Separator } from "../ui/separator";

type DomainTupleData = {
    name: string;
    availbale: boolean;
    lease: number;
    permaBuy: number;
};

const dummyData: DomainTupleData[] = [
    {
        name: "Arlink",
        permaBuy: 18240,
        lease: 5000,
        availbale: true,
    },
    {
        name: "zynthix",
        permaBuy: 17500,
        lease: 4800,
        availbale: true,
    },
    {
        name: "velorium",
        permaBuy: 20000,
        lease: 5500,
        availbale: false,
    },
    {
        name: "quantara",
        permaBuy: 19000,
        lease: 5200,
        availbale: true,
    },
    {
        name: "solvify",
        permaBuy: 18500,
        lease: 5100,
        availbale: true,
    },
    {
        name: "aetheris",
        permaBuy: 19500,
        lease: 5300,
        availbale: false,
    },
    {
        name: "novastra",
        permaBuy: 18000,
        lease: 4900,
        availbale: true,
    },
    {
        name: "fluxora",
        permaBuy: 21000,
        lease: 6000,
        availbale: true,
    },
    {
        name: "luminara",
        permaBuy: 22000,
        lease: 6200,
        availbale: false,
    },
    {
        name: "cryostar",
        permaBuy: 23000,
        lease: 6500,
        availbale: true,
    },
    {
        name: "orbique",
        permaBuy: 24000,
        lease: 6700,
        availbale: true,
    },
    {
        name: "vireon",
        permaBuy: 25000,
        lease: 7000,
        availbale: false,
    },
    {
        name: "xenithra",
        permaBuy: 26000,
        lease: 7200,
        availbale: true,
    },
    {
        name: "astrava",
        permaBuy: 27000,
        lease: 7500,
        availbale: true,
    },
];

const DomainCommandPallete = ({
    value,
    setValue,
}: {
    value: string;
    setValue: React.Dispatch<SetStateAction<string>>;
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const filteredResults = useMemo(() => {
        return dummyData.filter((data) => {
            return data.name.toLowerCase().includes(value.toLowerCase());
        });
    }, [value]);

    useEffect(() => {
        if (!inputRef.current) return;
        inputRef.current.focus();
    }, []);

    return (
        <>
            <div className="felx flex-col max-w-5xl mx-auto mt-[60px] bg-[#0D0D0D] border border-neutral-900 rounded-xl">
                <header className="relative flex items-center gap-2 py-4">
                    <Search className="text-neutral-400 ml-4" />
                    <Input
                        ref={inputRef}
                        value={value}
                        className="border border-none focus-visible:ring-offset-0 focus:ring-0 bg-transparent focus-visible:ring-0"
                        placeholder="Type Arns name"
                        onChange={(e) => setValue(e.target.value)}
                    />
                </header>
                <section className="border-t space-y-4">
                    <div className="w-full max-h-[150px] overflow-y-scroll mt-2">
                        <p className="text-xs ml-4 my-2 text-neutral-500">
                            Matches
                        </p>
                        {filteredResults.map((value) => {
                            return <DomainTuple {...value} />;
                        })}
                    </div>
                    <Separator />
                    <div className="w-full max-h-[300px] overflow-y-scroll mt-2">
                        <p className="text-xs ml-4 mb-2 text-neutral-500">
                            Suggested
                        </p>
                        {dummyData.map((value) => {
                            return <DomainTuple {...value} />;
                        })}
                    </div>
                </section>
            </div>
        </>
    );
};

const DomainTuple = ({ name, availbale, lease, permaBuy }: DomainTupleData) => {
    return (
        <div className="text-neutral-500 hover:text-white transition-colors p-2 px-4 flex items-start cursor-pointer justify-between gap-48">
            <div className="flex gap-4">
                <EarthIcon className="size-5" />
                <div className="leading-tight">
                    <div className="text-white font-medium">{name}</div>
                    <span className="text-xs space-x-1">
                        {availbale && (
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
        </div>
    );
};

export default DomainCommandPallete;
