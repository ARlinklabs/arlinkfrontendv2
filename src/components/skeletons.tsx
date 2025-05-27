// shadcn imports
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// icon imports
import {
    Clock,
    GitBranch,
    GitCommit,
    LucideLink,
    MoreVertical,
    Folder,
    GithubIcon,
    Hammer,
    Package,
    AlertTriangle,
    ExternalLink,
    ArrowLeftFromLine,
} from "lucide-react";
import { CardTitle } from "./ui/card-hover-effect";
import { cn } from "@/lib/utils";

export const ProjectCardSkeleton = ({ viewMode }: { viewMode: string }) => (
    <div
        className={`grid ${
            viewMode === "grid"
                ? "md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1"
        } gap-[20px]`}
    >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <Card key={i} className="bg-neutral-950 border-[#383838]">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            <Skeleton className="w-12 h-12 rounded-lg bg-neutral-800/50" />
                            <div className="space-y-1.5">
                                <Skeleton className="h-5 w-40 bg-neutral-800/50" />
                                <Skeleton className="h-4 w-48 bg-neutral-800/50" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="rounded-full p-2 hover:bg-neutral-800/50">
                                <LucideLink className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div className="rounded-full p-2 hover:bg-neutral-800/50">
                                <MoreVertical className="w-4 h-4 text-neutral-400" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-4">
                    <div className="flex justify-between items-center gap-8">
                        <div className="flex justify-between items-center gap-8">
                            <Skeleton className="flex w-40 gap-2 pr-4 p-1 flex-grow h-8 items-center font-light bg-neutral-900 rounded-full"></Skeleton>
                        </div>{" "}
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="flex items-center space-x-2 rounded-full bg-neutral-800/30 px-3 py-1">
                                <GitBranch className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-full bg-neutral-800/30 px-3 py-1">
                                <div className="w-2 h-2 rounded-full bg-neutral-500" />
                                <span className="text-neutral-500">main</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-neutral-400 text-sm">
                            <Clock className="w-4 h-4 text-neutral-500" />
                            <Skeleton className="h-4 w-20 bg-neutral-800/50" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

export const DeploymentCardSkeleton = () => {
    return (
        <Card className="mb-6 flex bg-neutral-950 p-4 md:flex-row flex-col border-neutral-900 rounded-lg gap-8">
            <div className="flex md:flex-row md:w-2/5 w-full flex-col gap-7 h-[335px]">
                <Skeleton className="relative w-full h-full" />
            </div>
            <div className="flex flex-col  py-1 justify-between">
                <div className="flex flex-col gap-4">
                    <div className="w-full">
                        <p className="text-sm text-neutral-400 mb-1">
                            Deployment url
                        </p>
                        <Skeleton className="w-full h-[20px]" />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400 mb-1">Live at</p>
                        <div className="flex text-md items-center space-x-2">
                            <Skeleton className="w-full h-[20px]" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm mb-1 text-neutral-400">Status</p>
                        <div className="flex text-md items-center gap-2">
                            <div className="w-3 h-3 bg-[#00FFEA] rounded-full" />
                            <Skeleton className="w-full h-[20px]" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-sm  text-neutral-400">Branch</p>
                        <div className="flex text-md mt-1 font-medium items-center space-x-2 text-sm">
                            <GitBranch className="w-4 h-4 text-neutral-600" />
                            <Skeleton className="w-full h-[20px]" />
                        </div>
                        <div className="flex text-md mt-1 font-medium items-center space-x-2 text-sm">
                            <GitCommit className="w-4 h-4 text-neutral-600" />
                            <Skeleton className="w-full h-[20px]" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center md:mt-0 mt-8 gap-8">
                    <Skeleton className="flex md:w-64 max-w-40 gap-2 pr-4 p-1 flex-grow h-8 items-center font-light bg-neutral-800 border rounded-full"></Skeleton>
                </div>
            </div>
        </Card>
    );
};

export const ConfigureProjectSkeleton = () => {
    return (
        <div className="w-full mx-auto p-4 md:p-10 rounded-lg border border-neutral-900 bg-neutral-950 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-2">
                <div className="lg:w-2/5 w-full flex-grow flex-shrink-0">
                    <Skeleton className="h-8 w-3/4 bg-neutral-800" />
                    <Skeleton className="h-16 w-[90%] mt-4 bg-neutral-800" />
                    <Skeleton className="h-10 w-36 my-8 bg-neutral-800" />
                </div>
                <div className="w-full space-y-6">
                    <ConfigItemSkeleton
                        icon={
                            <GithubIcon className="w-5 h-5 text-neutral-600" />
                        }
                        label="GitHub Repository"
                    />
                    <ConfigItemSkeleton
                        icon={
                            <GitBranch className="w-5 h-5 text-neutral-600" />
                        }
                        label="Install Command"
                    />
                    <ConfigItemSkeleton
                        icon={<Package className="w-5 h-5 text-neutral-600" />}
                        label="Install Command"
                    />
                    <ConfigItemSkeleton
                        icon={<Hammer className="w-5 h-5 text-neutral-600" />}
                        label="Build Command"
                    />
                    <ConfigItemSkeleton
                        icon={<Folder className="w-5 h-5 text-neutral-600" />}
                        label="Output Directory"
                    />
                </div>
            </div>
        </div>
    );
};

interface ConfigItemSkeletonProps {
    icon: React.ReactNode;
    label: string;
}

export const ConfigItemSkeleton = ({
    icon,
    label,
}: ConfigItemSkeletonProps) => {
    return (
        <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-neutral-600">
                {icon}
                <span className="ml-2">{label}</span>
            </label>
            <Skeleton className="h-10 w-full bg-neutral-800" />
        </div>
    );
};

export const RepoSkeleton = () => {
    return (
        <div className="flex items-center justify-between p-3 border-b animate-pulse">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-neutral-700 rounded-md" />
                <div className="h-4 bg-neutral-700 rounded w-40" />
                <div className="h-4 bg-neutral-700 rounded w-20" />
            </div>
            <div className="w-16 h-8 bg-neutral-700 rounded" />
        </div>
    );
};

export const NextJsProjectWarningCard = () => {
    return (
        <Card className="w-full mb-4 mx-auto bg-yellow-950/30 border-yellow-500/50 shadow-lg shadow-yellow-500/10">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-yellow-300">
                    <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                    Warning
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
                <p className="mb-3 text-yellow-200">
                    You are deploying a Next.js project. Make sure you are using
                    a static export.
                </p>
                <p className="font-medium text-yellow-100 mb-2">
                    Learn how to deploy a Next.js project:
                </p>
                <ul className="space-y-2">
                    <li>
                        <a
                            href="https://arlink.gitbook.io/arlink-docs/getting-started/making-your-website-arweave-compatible#next.js"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center text-yellow-300 hover:text-yellow-100 transition-colors"
                        >
                            Arlink Next.js docs
                            <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://nextjs.org/docs/pages/building-your-application/deploying/static-exports"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center text-yellow-300 hover:text-yellow-100 transition-colors"
                        >
                            Next.js docs
                            <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                    </li>
                </ul>
            </CardContent>
        </Card>
    );
};

export const AnalyticsSkeleton = () => {
    return (
        <div className="container relative mx-auto p-8 space-y-2 text-neutral-200 min-h-screen">
            <div className="fixed inset-0 bg-gradient-to-t z-40 from-black to-transparent pointer-events-none"></div>
            <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <h1 className="text-4xl font-bold text-neutral-100 mb-4">
                    Coming Soon
                </h1>
                <p className="text-lg text-neutral-400 mb-8">
                    Analytics features are currently under development
                </p>
                <a
                    href="/dashboard"
                    className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                >
                    Back to Dashboard
                </a>
            </div>
            <div className="opacity-60">
                <div className="absolute inset-0"></div>
                {/* Main Chart */}
                <Card className="p-4 mb-8 bg-neutral-950 border-neutral-800">
                    <div className="text-xl font-semibold mb-4">
                        Analytics Overview
                    </div>
                    <Skeleton className="h-8 w-40 mb-4 bg-neutral-900" />
                    <Skeleton className="h-[300px] w-full bg-neutral-900" />
                </Card>

                {/* Recent Activity Table */}
                <Card className="p-4  bg-neutral-950 border-neutral-800">
                    <div className="text-xl font-semibold mb-4">
                        Recent Activity
                    </div>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="flex justify-between items-center"
                            >
                                <div className="text-sm text-neutral-400">
                                    Activity {i + 1}
                                </div>
                                <Skeleton className="h-4 w-1/3 bg-neutral-900" />
                                <Skeleton className="h-4 w-1/4 bg-neutral-900" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export const AnalyticsDashboardSkeleton = ({
    pulseAnimation = false,
    className,
}: {
    pulseAnimation?: boolean;
    className?: string;
}) => {
    const barChartsData = [
        {
            title: "Global Traffic",
            description: "Where your visitors are coming from",
            data: [
                { name: "USA", value: 40 },
                { name: "Canada", value: 20 },
                { name: "Germany", value: 15 },
                { name: "Japan", value: 10 },
                { name: "France", value: 9 },
                { name: "Others", value: 6 },
            ],
        },
        {
            title: "Most Used Browser",
            description: "Track the browser used to access your site",
            data: [
                { name: "Chrome", value: 40 },
                { name: "Brave", value: 20 },
                { name: "Zen", value: 15 },
                { name: "Safari", value: 10 },
                { name: "Mozilla", value: 9 },
                { name: "Others", value: 6 },
            ],
        },
        {
            title: "Top Wallets",
            description: "Crypto wallets that your visitors have installed",
            data: [
                { name: "ArConnect", value: 40 },
                { name: "Phantom", value: 20 },
                { name: "Meta mask", value: 15 },
                { name: "Japan", value: 10 }, // Note: This looks like a data error in your original
                { name: "France", value: 9 }, // Note: This looks like a data error in your original
                { name: "Others", value: 6 },
            ],
        },
    ];
    return (
        <div className={cn(`space-y-4`, className)}>
            <div className="grid grid-cols-9 gap-4 h-[175px]">
                <div className="rounded-xl  flex gap-3 p-4 transition-all col-span-3 border hover:border-neutral-600 border-neutral-800 ">
                    <header className="text-sm flex flex-col gap-2">
                        <div className="text-neutral-200 font-semibold text-base">
                            Page Views
                        </div>
                        <div
                            className={`h-full ${pulseAnimation && "animate-pulse"} bg-neutral-900 rounded-md`}
                        ></div>
                    </header>
                    <section
                        className={`flex-1 h-full bg-neutral-900 rounded-md ${pulseAnimation && "animate-pulse"}`}
                    />
                </div>
                <div className="rounded-xl  flex gap-3 p-4 transition-all col-span-3 border hover:border-neutral-600 border-neutral-800 ">
                    <header className="text-sm flex flex-col gap-2">
                        <div className="text-neutral-200 font-semibold text-base">
                            Top Visitors
                        </div>
                        <div
                            className={`h-full ${pulseAnimation && "animate-pulse"} bg-neutral-900 rounded-md`}
                        ></div>
                    </header>
                    <section
                        className={`flex-1 h-full bg-neutral-900 rounded-md ${pulseAnimation && "animate-pulse"}`}
                    />
                </div>
                <div className="rounded-xl  flex gap-3 p-4 transition-all col-span-3 border hover:border-neutral-600 border-neutral-800 ">
                    <header className="text-sm flex flex-col gap-2">
                        <div className="text-neutral-200 font-semibold text-base">
                            Avg Load Time
                        </div>
                        <div
                            className={`h-full ${pulseAnimation && "animate-pulse"} bg-neutral-900 rounded-md`}
                        ></div>
                    </header>
                    <section
                        className={`flex-1 h-full bg-neutral-900 rounded-md ${pulseAnimation && "animate-pulse"}`}
                    />
                </div>
            </div>
            <div className="grid grid-cols-12 h-[400px] gap-4">
                <div className="rounded-xl p-5 flex flex-col gap-4 transition-all col-span-5 border hover:border-neutral-600 border-neutral-800 h-full">
                    <header className="space-y-0.5">
                        <div className="text-xl font-semibold">Page views</div>
                        <p className="text-sm text-neutral-400">
                            Total number of time your page has been accessed
                        </p>
                    </header>
                    <section
                        className={`flex-1 h-full bg-neutral-900 rounded-md ${pulseAnimation && "animate-pulse"}`}
                    />
                </div>
                <div className="rounded-xl p-5 flex flex-col gap-4 transition-all col-span-7 border hover:border-neutral-600 border-neutral-800 h-full">
                    <header className="space-y-0.5">
                        <div className="text-xl font-semibold">
                            Global Traffic
                        </div>
                        <p className="text-sm text-neutral-400">
                            Track visitor distribution with an interactive world
                            map
                        </p>
                    </header>
                    <section
                        className={`flex-1 h-full bg-neutral-900 rounded-md ${pulseAnimation && "animate-pulse"}`}
                    />
                </div>
            </div>
            <div className="grid grid-cols-9 h-[400px] gap-4">
                {barChartsData.map((chart, index) => (
                    <AnalyticsBarChart
                        key={index}
                        title={chart.title}
                        description={chart.description}
                        data={chart.data}
                        pulseAnimation={pulseAnimation}
                    />
                ))}
            </div>
            <div className="grid grid-cols-12 h-[400px] gap-4">
                <div className="rounded-xl p-5 flex flex-col gap-4 transition-all col-span-5 border hover:border-neutral-600 border-neutral-800 h-full">
                    <header className="space-y-0.5">
                        <div className="text-xl font-semibold">Top Pages</div>
                        <p className="text-sm text-neutral-400">
                            See your most visited pages at glance{" "}
                        </p>
                    </header>
                    <section
                        className={`flex-1 h-full bg-neutral-900 rounded-md ${pulseAnimation && "animate-pulse"}`}
                    />
                </div>
                <div className="rounded-xl p-5 flex flex-col gap-4 transition-all col-span-7 border hover:border-neutral-600 border-neutral-800 h-full">
                    <header className="space-y-0.5">
                        <div className="text-xl font-semibold">
                            Recent Activity
                        </div>
                        <p className="text-sm text-neutral-400">
                            Latest visitor interactions
                        </p>
                    </header>
                    <section
                        className={`flex-1 h-full bg-neutral-900 rounded-md ${pulseAnimation && "animate-pulse"}`}
                    />
                </div>
            </div>{" "}
        </div>
    );
};

const AnalyticsBarChart = ({
    title,
    description,
    data,
    pulseAnimation,
}: {
    title: string;
    description: string;
    data: any;
    pulseAnimation?: boolean;
}) => {
    return (
        <div className="rounded-xl justify-between flex flex-col p-5 gap-4 transition-all col-span-3 border hover:border-neutral-600 border-neutral-800 h-full">
            <header className="space-y-0.5">
                <div className="text-xl font-semibold">{title}</div>
                <p className="text-sm text-neutral-400">{description}</p>
            </header>
            <section className="flex flex-col gap-2">
                {data.map((item: { name: string; value: number }) => (
                    <div
                        key={item.name}
                        className="h-[40px] w-full relative rounded-md items-center p-2 flex justify-between"
                    >
                        <div
                            className={`bg-neutral-900 ${pulseAnimation && "animate-pulse"} absolute inset-0 rounded-md`}
                            style={{ width: `${item.value}%` }}
                        ></div>
                    </div>
                ))}
            </section>
        </div>
    );
};

export const BuyArnsSkeleton = () => {
    return (
        <div className="container relative flex items-start mt-[20vh] justify-center h-[calc(100dvh-200px)]">
            <div className="w-[800px] relative">
                <div className="h-4 w-24 bg-neutral-800/60 rounded animate-pulse absolute -top-[30px] left-0"></div>

                <div className="h-10 w-full bg-neutral-800/60 rounded-lg mb-4 animate-pulse"></div>

                <div className="p-8 bg-[#0d0d0d]/50 border border-neutral-800/40 rounded-lg space-y-12">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-5 w-40 bg-neutral-800/60 rounded-md animate-pulse"></div>
                        <div className="h-12 w-64 bg-neutral-800/60 rounded-md animate-pulse"></div>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-20 w-40 bg-neutral-800/60 rounded animate-pulse"></div>
                            <div className="h-5 w-16 bg-neutral-800/40 rounded animate-pulse"></div>
                        </div>
                    </div>

                    <div className="h-12 w-full bg-neutral-800/60 rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export const ArnsTableSkeleton = () => (
    <div className="border h-[calc(100svh-260px)] border-[#373737] rounded-md overflow-hidden bg-[#0d0d0d] text-white">
        <div className="grid grid-cols-6 bg-[#181819] font-semibold border-b border-[#373737] text-sm">
            <div className="p-4">ARNS Name</div>
            <div className="p-4">Role</div>
            <div className="p-4">Process ID</div>
            <div className="p-4">Type</div>
            <div className="p-4">Undernames</div>
            <div className="p-4">Expiry</div>
        </div>
        <div className="max-h-[calc(100svh-310px)] overflow-y-scroll pb-4">
        {[...Array(10)].map((_, idx) => (
    <div key={idx} className="grid grid-cols-6 font-medium border-b border-[#373737] text-sm">
        {[...Array(6)].map((_, i) => (  // Changed from 10 to 6
            <div key={i} className="p-6">
                <div className="h-4 w-full bg-[#383838] rounded animate-pulse" />
            </div>
        ))}
    </div>
))}

 </div>
    </div>
);

export const ArnsDetailsSkeleton = () => {
    return (
        <div className="container">
            <div className="mt-[20px]">
                <div className="flex items-center gap-1 text-neutral-400 text-sm mb-4">
                    <ArrowLeftFromLine className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                </div>
                <div className="flex mt-[60px] justify-between items-center mb-8">
                    <div>
                        <Skeleton className="h-10 w-48 mb-2 bg-neutral-800" />
                        <div className="flex items-center">
                            <Skeleton className="h-4 w-64 bg-neutral-800" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-32 bg-neutral-800" />
                </div>
            </div>

            {/* Stats Section */}
            <header className="bg-[#0d0d0d] border-[#373737] border rounded-lg mb-8 grid grid-cols-3 divide-x divide-[#373737]">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-6">
                        <div className="flex items-center mb-4">
                            <Clock className="w-5 h-5 mr-2 text-neutral-600" />
                            <Skeleton className="h-6 w-24 bg-neutral-800" />
                        </div>
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-20 bg-neutral-800" />
                            <Skeleton className="h-9 w-24 bg-neutral-800" />
                        </div>
                    </div>
                ))}
            </header>

            {/* Details Section */}
            <div className="bg-[#0d0d0d] border-[#373737] border rounded-lg overflow-hidden mb-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="border-b border-[#373737] p-4 flex justify-between items-center">
                        <Skeleton className="h-5 w-24 bg-neutral-800" />
                        <div className="flex items-center flex-1 justify-between">
                            <Skeleton className="h-5 w-48 bg-neutral-800" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 bg-neutral-800" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Information Section */}
            <div className="bg-[#0d0d0d] border-[#373737] border rounded-lg overflow-hidden">
                <h2 className="text-xl font-medium p-4 border-b border-[#373737]">Additional Information</h2>
                <div className="divide-y divide-[#373737]">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="border-b border-[#373737] p-4 flex justify-between items-center">
                            <Skeleton className="h-5 w-24 bg-neutral-800" />
                            <div className="flex items-center flex-1 justify-between">
                                <Skeleton className="h-5 w-48 bg-neutral-800" />
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 bg-neutral-800" />
                                    <Skeleton className="h-5 w-5 bg-neutral-800" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};