import { SetStateAction, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Loader2, Search, EarthIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import DomainTuple, { AvailableDomainTuple } from "./domain-tuple";
import { useDebouncedCallback } from "use-debounce";
import { checkArNSAvailability } from "@/actions/arns/arnslater";
import { generateWordSuggestions } from "@/lib/utils";
import { Link } from "react-router-dom";

const DomainCommandPallete = ({
    value,
    setValue,
}: {
    value: string;
    setValue: React.Dispatch<SetStateAction<string>>;
}) => {
    const [checking, setChecking] = useState<boolean>(true);
    const [available, setAvailable] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [suggestedDomains, setSuggestedDomains] = useState<
        { name: string; available: boolean }[]
    >([]);
    const handleArnsValueChange = (value: string) => {
        setChecking(true);
        setValue(value);
    };
    const [suggestedDomainsLoader, setSuggestedDomainsLoader] =
        useState<boolean>(false);

    const debouncedArnsCheck = useDebouncedCallback(async (value: string) => {
        setChecking(true);
        await checkingArNSAvailability();
    }, 500);

    const checkingArNSAvailability = async () => {
        const { available, errorMessage } = await checkArNSAvailability(value);
        console.log({ available, errorMessage });
        setAvailable(available);
        setChecking(false);
        if (!available) {
            console.log("Calling the suggested domains function..");
            handleUnavailableCase();
        }
        if (errorMessage) {
            setError(errorMessage);
            return;
        }
    };

    useEffect(() => {
        if (!inputRef.current) return;
        inputRef.current.focus();
    }, []);

    const handleUnavailableCase = async () => {
        setSuggestedDomainsLoader(true);
        setSuggestedDomains([]);
        try {
            const data = generateWordSuggestions(value);
            const promiseArray = data.map((arns) => {
                return checkArNSAvailability(arns);
            });
            const resolvedPromiseArnsArray = await Promise.all(promiseArray);

            const suggestedArnsArray = resolvedPromiseArnsArray
                .filter((arns) => arns.available)
                .map((arns) => ({
                    name: arns.name,
                    available: true,
                }));
            setSuggestedDomains(suggestedArnsArray);
        } catch (error) {
            console.error(error);
        } finally {
            setSuggestedDomainsLoader(false);
        }
    };

    // Skeleton for matching the Tuple structure
    const DomainSkeleton = () => (
        <Link
            to="#"
            className="text-neutral-500 hover:text-white transition-colors p-2 px-4 flex items-start cursor-pointer justify-between gap-48"
        >
            <div className="flex gap-4">
                <Skeleton className="size-5 rounded-full" />
                <div className="leading-tight">
                    <Skeleton className="w-36 h-4 mb-1 rounded-sm" />
                    <div className="text-xs space-x-1">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-24 h-3 rounded-sm" />
                        </div>
                    </div>
                </div>
            </div>
            <Skeleton className="w-24 h-10 rounded-sm" />
        </Link>
    );

    return (
        <div className="relative isolate">
            <div className="felx  flex-col max-w-5xl relative z-40 mx-auto mt-[15vh] overflow-hidden border border-neutral-900 rounded-md">
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
                        onChange={(e) => {
                            handleArnsValueChange(e.target.value);
                            debouncedArnsCheck(e.target.value);
                        }}
                    />
                </header>
                <section className="border-t pb-4 space-y-4 relative z-30">
                    <div className="w-full max-h-[150px] overflow-y-scroll mt-2">
                        <p className="text-xs ml-4 my-2 text-neutral-500">
                            Matches
                        </p>
                        {checking ? (
                            <DomainSkeleton />
                        ) : available ? (
                            <AvailableDomainTuple
                                name={value}
                                available
                                permaBuy={1020}
                                lease={1020}
                            />
                        ) : (
                            <div className="text-white transition-colors p-2 px-4 flex items-start cursor-pointer justify-between gap-48">
                                ARNS not available. Please choose from these suggested alternatives
                            </div>
                        )}
                    </div>
                    {!available && !checking && (
                        <>
                            <Separator />
                            <div className="w-full max-h-[230px] overflow-y-scroll mt-2">
                                <p className="text-xs ml-4 mb-2 text-neutral-500">
                                    Suggested
                                </p>
                                {suggestedDomainsLoader ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((item) => (
                                            <DomainSkeleton key={item} />
                                        ))}
                                    </div>
                                ) : (
                                    suggestedDomains.map((value) => {
                                        return (
                                            <DomainTuple
                                                key={value.name}
                                                {...value}
                                            />
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default DomainCommandPallete;
