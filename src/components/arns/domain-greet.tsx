import { ExternalLink, Search } from "lucide-react";
import { SetStateAction, useRef, useEffect } from "react";
import { EarthIcon } from "@/components/ui/earth-icon";
import { Input } from "@/components/ui/input";
import { checkArNSAvailability } from "@/actions/arns/arnslater";
import { Link } from "react-router-dom";

const DomainGreet = ({
    active,
    value,
    setActive,
    hanldeOpenDomainCommandPallete,
}: {
    active: boolean;
    value: string;
    setActive: React.Dispatch<SetStateAction<boolean>>;
    hanldeOpenDomainCommandPallete: (value: string) => void;
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!inputRef.current) return;
        inputRef.current.focus();
    }, []);

    const handleArnsValue = (value: string) => {
        checkArNSAvailability(value);
    };

    return (
        <section
            key="search-section"
            className="py-10 container h-[calc(100dvh-200px)] flex mt-[30vh] justify-center"
        >
            <div className="flex flex-col  items-center gap-4 -translate-y-12">
                <h1 className="text-4xl font-semibold text-center tracking-tight">
                    Get Your Smart Domain
                </h1>
                <div
                    className={`flex justify-center items-center ${!active ? "border-neutral-600" : "border-white"} border-b pb-1 group px-24`}
                >
                    <div className="flex items-center relative">
                        {/* Todo: Shrink the input width when user keeps typing */}
                        <Input
                            ref={inputRef}
                            value={value}
                            className="text-center border border-none w-36 focus-visible:ring-offset-0 focus:ring-0 bg-transparent focus-visible:ring-0 placeholder:text-neutral-400"
                            placeholder="Search for Arns..."
                            onClick={() => {
                                setActive(true);
                            }}
                            onChange={(e) =>
                                hanldeOpenDomainCommandPallete(e.target.value)
                            }
                            onBlur={() => setActive(false)}
                        />
                        <Search className="size-4 text-neutral-400 " />
                    </div>
                </div>
                <div className="flex gap-6">
                    <Link
                        to="/arns/dashboard"
                        className="text-center flex justify-center items-center gap-2 text-neutral-500 hover:text-white hover:underline text-sm cursor-pointer"
                    >
                        <EarthIcon className="size-4" />
                        Manage Arns
                    </Link>
                    <div className="text-center flex justify-center items-center gap-2 text-neutral-500 hover:text-white hover:underline text-sm cursor-pointer">
                        Learn more
                        <ExternalLink className="size-4" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DomainGreet;
