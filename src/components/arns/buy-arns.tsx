import Layout from "@/layouts/layout";
import { arnsDummyData } from "@/pages/utilts";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from "../ui/card";
import { CardTitle } from "../ui/card-hover-effect";
import { DomainTupleData } from "@/types";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { ChevronLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";

interface BuyArnsProps {
    arnsName: string;
}

const BuyArns = ({ arnsName }: BuyArnsProps) => {
    const arns = useMemo(() => {
        return arnsDummyData.find((data) => data.name === arnsName);
    }, []);

    if (!arns) {
        return <div>This arns is not available</div>;
    }

    return (
        <Layout>
            <div className="container relative flex items-start mt-[20vh] justify-center h-[calc(100dvh-200px)]">
                <Tabs defaultValue="permanent" className="w-[400px] relative">
                    <Link
                        to={"/arns"}
                        className="flex items-center gap-1 group text-xs absolute -top-[30px] left-0"
                    >
                        <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-all" />{" "}
                        Go back
                    </Link>
                    <TabsList className="w-full grid grid-cols-2 bg-black border border-neutral-800 rounded-lg">
                        <TabsTrigger
                            className="data-[state=active]:bg-neutral-800/80 bg-black rounded-md"
                            value="permanent"
                        >
                            Permanent
                        </TabsTrigger>
                        <TabsTrigger
                            className="data-[state=active]:bg-neutral-800/80 bg-black rounded-md"
                            value="lease"
                        >
                            Lease
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value={"permanent"}>
                        <PermanentBuyTabContent {...arns} />
                    </TabsContent>
                    <TabsContent value={"lease"}>
                        <LeaseBuyTabContent {...arns} />
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
};

const PermanentBuyTabContent = ({ name, permaBuy, lease }: DomainTupleData) => {
    return (
        <Card className="p-4 bg-[#0d0d0d]/50 hover:bg-[#0d0d0d]/50  space-y-8 hover:border-neutral-800">
            <CardHeader className="text-center tracking-tighter p-0">
                <CardDescription>Registration method</CardDescription>
                <CardTitle className="text-3xl leading-[0.8] tracking-tighter">
                    Permanent {name}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-0">
                <div className="text-6xl font-semibold flex flex-col items-center gap-1">
                    {permaBuy}
                    <small className="text-sm text-neutral-700">ARIO</small>
                </div>
            </CardContent>
            <CardFooter className="p-0">
                <Button className="w-full font-semibold glow-btn">
                    Buy Now
                </Button>
            </CardFooter>
        </Card>
    );
};

const LeaseBuyTabContent = ({ name, lease }: DomainTupleData) => {
    const [selectedYear, setSelectedYear] = useState<number>(1);
    const date = new Date().getFullYear();
    return (
        <Card className="hover:border-neutral-800 bg-[#0d0d0d]/50 hover:bg-[#0d0d0d]/50  p-4 space-y-8">
            <CardHeader className="text-center tracking-tighter p-0">
                <CardDescription>Registration method</CardDescription>
                <CardTitle className="text-3xl leading-[0.8] tracking-tighter">
                    Lease {name}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col p-0">
                <div className="pb-3 text-sm text-neutral-400">
                    Select a year
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Slider
                        max={4}
                        onValueChange={(value) => {
                            const year = value[0];
                            setSelectedYear(year + 1);
                        }}
                    />
                    <div className="flex w-full px-2">
                        <div
                            className={`${selectedYear === 1 ? "text-white" : "text-neutral-600"}  transition-all text-left flex-1`}
                        >
                            1
                        </div>
                        <div
                            className={`${selectedYear === 2 ? "text-white" : "text-neutral-600"} flex-1 transition-all translate-x-4 -ml-1`}
                        >
                            2
                        </div>
                        <div
                            className={`${selectedYear === 3 ? "text-white" : "text-neutral-600"} transition-all text-center flex-1`}
                        >
                            3
                        </div>
                        <div
                            className={`${selectedYear === 4 ? "text-white" : "text-neutral-600"} transition-all -mr-1 text-right -translate-x-4 flex-1`}
                        >
                            4
                        </div>
                        <div
                            className={`${selectedYear === 5 ? "text-white" : "text-neutral-600"} transition-all text-right flex-1`}
                        >
                            5
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex p-0 justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-sm text-neutral-400">
                        until {date + selectedYear}
                    </span>
                    <div className="text-white text-3xl font-semibold flex items-end">
                        {lease * selectedYear}
                        <span className="text-xs text-neutral-400 ml-2 mb-1">
                            ARIO
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Info className="text-neutral-500 hover:text-white size-5" />
                    <Button size="sm" className="px-6 glow-btn">
                        Buy
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default BuyArns;
