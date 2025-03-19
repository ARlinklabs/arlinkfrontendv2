import { type ChartConfig } from "@/components/ui/chart";
import { lazy, Suspense } from "react";
const WorldMap = lazy(() => import("../components/ui/world-map.tsx"));

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChartDetailInterface } from "@/types";

const WorldMapCard = ({
    chartDetail,
}: {
    chartDetail: ChartDetailInterface;
    chartConfig: ChartConfig;
}) => {
    const processData = chartDetail.data.map((item: any) => {
        const countryKey =
            Object.keys(item).find(
                (key) => key !== "visitors" && key !== "percentage",
            ) || "";

        return {
            visitors: item.visitors,
            country: item[countryKey as keyof typeof item] as string,
            percentange: item.percentage,
        };
    });

    return (
        <Card className="py-0">
            <div className="">
                <CardHeader>
                    <CardTitle className="text-xl text-white">
                        {chartDetail.name}
                    </CardTitle>
                    <CardDescription className="flex text-sm flex-col space-y-2">
                        {chartDetail?.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                    <Suspense fallback={<div></div>}>
                        <WorldMap dots={processData} />
                    </Suspense>
                </CardContent>
            </div>
        </Card>
    );
};

export default WorldMapCard;
