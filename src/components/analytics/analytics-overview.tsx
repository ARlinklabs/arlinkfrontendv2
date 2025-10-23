import { fetchAnalytics } from "@/actions/analytics";
import { lazy, Suspense } from "react";
import { useSigner } from "@/lib/wallet-strategies";
const WorldMapCard = lazy(() => import("../world-map-card.tsx"));
import {
    AnalyticsData,
    ChartDetailInterface,
    MostUsedBrowserInterface,
    MostVisitedPagesDataInterface,
    TopCountriesDataItem,
} from "@/types";
import { useEffect, useState } from "react";
import TopCountries from "./top-countries";
import MostUsedBrowser from "./most-used-browsers";
import TopPages from "./top-pages";
import MostUsedWallets from "./most-used-wallets";
import RecentActivityTable from "./recent-activity";
import { VerticalChartCard } from "./vertical-chart-card";
import { HorizontalChartCard } from "./horizontal-chart-card";
import { AnalyticsDashboardSkeleton } from "../skeletons.tsx";

const AnalyticsOverview = ({ processId }: { processId: string }) => {
    const { signer, isLoading: signerLoading } = useSigner();
    const [analyticsData, setAnaalyticsData] = useState<AnalyticsData | null>(
        null,
    );

    const [, setFetchingAnalytics] = useState<boolean>(false);
    ``;

    useEffect(() => {
        // Don't fetch if signer is still loading or not available
        if (signerLoading || !signer) {
            console.log('Waiting for signer to be ready...', { signerLoading, hasSigner: !!signer });
            return;
        }

        setFetchingAnalytics(true);
        const data = async () => {
            try {
                console.log("fetching analytics...");
                const data = await fetchAnalytics(processId, signer);
                setAnaalyticsData(data);
                console.log(data);
            } catch (error) {
                console.log("An error occured while fetching analytics..");
                console.log(error);
            } finally {
                setFetchingAnalytics(false);
            }
        };
        data();
    }, [processId, signer, signerLoading]);

    const firstRow: ChartDetailInterface[] = [
        {
            name: "Page Views",
            value: String(analyticsData?.analyticsMetrics.pageViews.value ?? 0),
            volatility: {
                type: analyticsData?.analyticsMetrics.pageViews.trend ?? "up",
                value: analyticsData?.analyticsMetrics.pageViews.change ?? 0,
            },
            data: analyticsData?.analyticsMetrics.pageViews.chartData ?? [],
        },
        {
            name: "Visitors",
            value: String(analyticsData?.analyticsMetrics.visitors.value ?? 0),
            volatility: {
                type: analyticsData?.analyticsMetrics.visitors.trend ?? "up",
                value: analyticsData?.analyticsMetrics.visitors.change ?? 0,
            },
            data: analyticsData?.analyticsMetrics.visitors.chartData ?? [],
        },
        {
            name: "Avg Load Time",
            value: String(
                analyticsData?.analyticsMetrics.avgLoadTime.value ?? 0,
            ),
            volatility: {
                type: analyticsData?.analyticsMetrics.avgLoadTime.trend ?? "up",
                value: analyticsData?.analyticsMetrics.avgLoadTime.change ?? 0,
            },
            data: analyticsData?.analyticsMetrics.avgLoadTime.chartData ?? [],
        },
    ];

    const secondRow: ChartDetailInterface[] = [
        {
            name: "Page Views",
            value: "50",
            volatility: {
                type: analyticsData?.analyticsMetrics.pageViews.trend ?? "up",
                value: analyticsData?.analyticsMetrics.pageViews.change ?? 0,
            },
            description: "Total number of time your pages has been accessed",
            data: analyticsData?.analyticsMetrics.pageViews.chartData || [],
        },
        {
            name: "Global Traffic",
            value: "0",
            description:
                "Track visitor distribution with an interactive world map",
            volatility: {
                type: "up",
                value: 0,
            },
            data: analyticsData?.analyticsMetrics.globalTraffic.regions || [],
        },
    ];

    const fourthRow: ChartDetailInterface[] = [
        {
            name: "Most Visited Pages",
            description: "See your most visited page at glance",
            value: String(
                analyticsData?.topPages.reduce(
                    (acc, page) => acc + page.visitors,
                    0,
                ) ?? 0,
            ),
            volatility: {
                type: "up",
                value: 0,
            },
            data: [
                { country: "/", visitors: 650 },
                { country: "/about", visitors: 1200 },
                { country: "/product", visitors: 950 },
                { country: "/faq", visitors: 700 },
                { country: "/cart", visitors: 500 },
                { country: "/services", visitors: 500 },
                { country: "/pay", visitors: 500 },
            ],
        },
        {
            name: "Recent Activity",
            value: String(analyticsData?.recentActivity.length ?? 0),
            volatility: {
                type: "up",
                value: 0,
            },
            data: analyticsData?.recentActivity ?? [],
        },
    ];

    const topCountriesData: TopCountriesDataItem = {
        name: "Top Countries",
        description: "Where your visitors are coming from",
        value: "0",
        volatility: {
            type: "up",
            value: 0,
        },
        data: analyticsData?.analyticsMetrics.topCountries || [],
    };

    const mostUsedBrowserData: MostUsedBrowserInterface = {
        name: "Most used browser",
        description: "Track the browser used to access your siteD",
        data: analyticsData?.browsers || [],
    };

    const mostVistedPagesData: MostVisitedPagesDataInterface = {
        name: "Top pages",
        description: "See your most visited pages at glance",
        data: analyticsData?.topPages || [],
    };

    const mostUsedWalletsData: MostUsedBrowserInterface = {
        name: "Wallets",
        description: "Crypto wallets that your visitors have installed",
        data: analyticsData?.wallets || [],
    };

    return (
        <div>
            <div>
                {analyticsData ? (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {firstRow.map((chart) => (
                                <HorizontalChartCard
                                    key={chart.name}
                                    chartDetail={chart}
                                    chartConfig={{
                                        primary: {
                                            label: chart.name,
                                            color: "hsl(var(--primary))",
                                        },
                                    }}
                                />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-6 mt-6">
                            <div className="col-span-3">
                                <VerticalChartCard
                                    key={secondRow[0].name}
                                    chartDetail={secondRow[0]}
                                    chartConfig={{
                                        primary: {
                                            label: secondRow[0].name,
                                            color: "hsl(var(--primary))",
                                        },
                                    }}
                                />
                            </div>
                            <div className="col-span-5">
                                <Suspense
                                    fallback={
                                        <div className="h-[473px] bg-neutral-900 animate-pulse" />
                                    }
                                >
                                    <WorldMapCard
                                        chartDetail={secondRow[1]}
                                        chartConfig={{
                                            primary: {
                                                label: secondRow[0].name,
                                                color: "hsl(var(--primary))",
                                            },
                                        }}
                                    />
                                </Suspense>{" "}
                            </div>
                        </div>
                        <div className="grid grid-cols-9 gap-6 mt-6">
                            <div className="col-span-3">
                                <TopCountries data={topCountriesData} />
                            </div>
                            <div className="col-span-3">
                                <MostUsedBrowser data={mostUsedBrowserData} />
                            </div>
                            <div className="col-span-3">
                                <MostUsedWallets data={mostUsedWalletsData} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-6 mt-6">
                            <div className="col-span-3">
                                <TopPages data={mostVistedPagesData} />
                            </div>
                            <div className="col-span-5">
                                <RecentActivityTable
                                    recentActivity={fourthRow[1].data}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <AnalyticsDashboardSkeleton pulseAnimation />
                    </>
                )}
            </div>
        </div>
    );
};

export default AnalyticsOverview;
