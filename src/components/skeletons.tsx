// shadcn imports
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
} from "lucide-react";

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
        <div
            className="flex items-center justify-between p-3 border-b animate-pulse"
        >
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-neutral-700 rounded-md" />
                <div className="h-4 bg-neutral-700 rounded w-40" />
                <div className="h-4 bg-neutral-700 rounded w-20" />
            </div>
            <div className="w-16 h-8 bg-neutral-700 rounded" />
        </div>
    );
};
