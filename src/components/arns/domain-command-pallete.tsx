import { SetStateAction, useEffect, useMemo, useRef } from "react";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Separator } from "../ui/separator";
import { arnsDummyData } from "@/pages/utilts";
import DomainTuple from "./domain-tuple";

const DomainCommandPallete = ({
    value,
    setValue,
}: {
    value: string;
    setValue: React.Dispatch<SetStateAction<string>>;
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const filteredResults = useMemo(() => {
        const filteredData = arnsDummyData.filter((data) => {
            return data.name.toLowerCase().includes(value.toLowerCase());
        });

        console.log(filteredData);
        return filteredData;
    }, [value]);

    useEffect(() => {
        if (!inputRef.current) return;
        inputRef.current.focus();
    }, []);

    return (
        <div className="relative isolate">
            <div className="felx  flex-col max-w-5xl relative z-40 mx-auto mt-[10vh] overflow-hidden border border-neutral-900 rounded-md">
                <div className="backdrop-blur-[80px] z-20 absolute bg-[#0D0D0D]/50 inset-0" />
                <div className="bg-white w-24 h-2 absolute z-10 top-2 left-2" />
                <div className="bg-white w-24 h-2 absolute z-10 bottom-2 right-2" />
                <header className="relative z-30  flex items-center gap-2 py-2">
                    <Search className="text-neutral-400 ml-4 size-5" />
                    <Input
                        ref={inputRef}
                        value={value}
                        className="border border-none focus-visible:ring-offset-0 focus:ring-0 bg-transparent focus-visible:ring-0"
                        placeholder="Type Arns name"
                        onChange={(e) => setValue(e.target.value)}
                    />
                </header>
                <section className="border-t space-y-4 relative z-30">
                    <div className="w-full max-h-[150px] overflow-y-scroll mt-2">
                        <p className="text-xs ml-4 my-2 text-neutral-500">
                            Matches
                        </p>
                        {filteredResults.map((value) => {
                            return <DomainTuple key={value.name} {...value} />;
                        })}
                    </div>
                    <Separator />
                    <div className="w-full max-h-[230px] overflow-y-scroll mt-2">
                        <p className="text-xs ml-4 mb-2 text-neutral-500">
                            Suggested
                        </p>
                        {arnsDummyData.map((value) => {
                            return (
                                <DomainTuple key={value.permaBuy} {...value} />
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DomainCommandPallete;
