"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Wallet,
    EclipseIcon,
    Briefcase,
    FileCode,
    ChevronUp,
    ChevronDown,
    ChevronRight,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useTemplateStore } from "@/store/use-template-store";
import { Link } from "react-router-dom";
import { TemplateDashboard } from "@/types";
import { extractOwnerName, extractRepoName } from "@/pages/utilts";
import { Separator } from "@/components/ui/separator";
import {
    ReactIcon,
    NextJs,
    ViteIcon,
    SolidJsIcon,
    AngularIcon,
    Svelte,
    Gatsby,
} from "@/components/ui/icons";

interface Category {
    id: string;
    label: string;
    icon: React.ReactNode;
}

const frameworks: Category[] = [
    {
        id: "nextjs",
        icon: <NextJs className="w-4 h-4" />,
        label: "Next.js",
    },
    {
        id: "react",
        icon: <ReactIcon className="w-4 h-4" />,
        label: "React",
    },
    {
        id: "vite",
        icon: <ViteIcon className="w-4 h-4" />,
        label: "Vite",
    },
    {
        id: "solidjs",
        icon: <SolidJsIcon className="w-4 h-4" />,
        label: "Solid.js",
    },
    {
        id: "angular",
        icon: <AngularIcon className="w-4 h-4" />,
        label: "Angular",
    },
    {
        id: "svelte",
        icon: <Svelte className="w-4 h-4" />,
        label: "Svelte",
    },
    {
        id: "gatsby",
        icon: <Gatsby className="w-4 h-4" />,
        label: "Gatsby",
    },
];

const useCases: Category[] = [
    { id: "solana", icon: <Wallet className="w-4 h-4" />, label: "Solana Dev" },
    {
        id: "ethereum",
        icon: <EclipseIcon className="w-4 h-4" />,
        label: "Eth dev",
    },
    {
        id: "arweave",
        icon: <Briefcase className="w-4 h-4" />,
        label: "Arweave",
    },
];

/** Normalize a template Framework string to a framework id for matching */
function normalizeFrameworkId(framework: string): string {
    const lower = framework.toLowerCase().trim();
    // Direct matches
    if (lower === "next.js" || lower === "nextjs") return "nextjs";
    if (lower === "gatsby") return "gatsby";
    if (lower === "svelte") return "svelte";
    if (lower === "angular") return "angular";
    if (lower === "solid.js" || lower === "solidjs") return "solidjs";
    // "React + Vite", "React", "react" → react
    if (lower.startsWith("react")) return "react";
    // "vite" (standalone, not "React + Vite" which was caught above)
    if (lower === "vite") return "vite";
    // "static" or anything else
    return lower.replace(/[^a-z0-9]/g, "");
}

export default function TemplateSelector({
    isLoading,
}: {
    isLoading: boolean;
}) {
    const { templates } = useTemplateStore();
    const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
    const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredTemplates, setFilteredTemplates] =
        useState<TemplateDashboard[]>(templates);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [openSections, setOpenSections] = useState<string[]>([]);

    useEffect(() => {
        const filtered = templates.filter((template) => {
            const matchesFramework =
                selectedFrameworks.length === 0 ||
                selectedFrameworks.includes(
                    normalizeFrameworkId(template.Framework),
                );
            const matchesUseCase =
                selectedUseCases.length === 0 ||
                selectedUseCases.includes(template.UseCase.toLowerCase());
            const matchesSearch =
                template.Name.toLowerCase().includes(
                    searchQuery.toLowerCase(),
                ) ||
                template.Description.toLowerCase().includes(
                    searchQuery.toLowerCase(),
                );
            return matchesFramework && matchesUseCase && matchesSearch;
        });
        console.log(templates);
        setFilteredTemplates(filtered);
    }, [selectedFrameworks, selectedUseCases, searchQuery, templates]);

    const toggleCategory = (
        category: string,
        type: "framework" | "useCase",
    ) => {
        const updateSelected =
            type === "framework" ? setSelectedFrameworks : setSelectedUseCases;
        const currentSelected =
            type === "framework" ? selectedFrameworks : selectedUseCases;
        updateSelected(
            currentSelected.includes(category)
                ? currentSelected.filter((item) => item !== category)
                : [...currentSelected, category],
        );
    };

    const toggleSection = (section: string) => {
        setOpenSections((prev) =>
            prev.includes(section)
                ? prev.filter((s) => s !== section)
                : [...prev, section],
        );
    };

    const renderCategoryCheckboxes = (
        categories: Category[],
        type: "framework" | "useCase",
    ) => (
        <div
            className={`space-y-1 pt-0 overflow-hidden transition-all duration-200 ${
                openSections.includes(type) ? "max-h-[500px]" : "max-h-0"
            }`}
        >
            {categories.map((category) => (
                <label
                    key={category.id}
                    className="flex items-center space-x-2 text-sm hover:bg-neutral-900 transition-colors duration-200 rounded-lg p-2"
                >
                    <Checkbox
                        checked={
                            type === "framework"
                                ? selectedFrameworks.includes(category.id)
                                : selectedUseCases.includes(category.id)
                        }
                        onCheckedChange={() =>
                            toggleCategory(category.id, type)
                        }
                    />
                    <span className="w-6 flex items-center justify-center">
                        {category.icon}
                    </span>
                    <span>{category.label}</span>
                </label>
            ))}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="lg:hidden">
                <Button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    variant="outline"
                    className="w-full justify-between"
                >
                    Filter templates
                    {isFilterOpen ? (
                        <ChevronUp size={16} />
                    ) : (
                        <ChevronDown size={16} />
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[250px,1fr] gap-8">
                <aside
                    className={`space-y-3 lg:block ${
                        isFilterOpen ? "block" : "hidden"
                    }`}
                >
                    <div className="text-xl"> Filter tempaltes </div>
                    <div className="flex items-center gap-2 justify-between">
                        <div className="relative flex-1">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300"
                            />
                            <Input
                                className="w-full placeholder:text-neutral-500 bg-neutral-950 border-neutral-800 pl-10"
                                placeholder="search for a template"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <Separator className="mt-4 bg-neutral-900" />
                    <div>
                        <div className="flex flex-col">
                            <div className="">
                                <button
                                    onClick={() => toggleSection("framework")}
                                    className="w-full flex items-center justify-between p-2 hover:bg-neutral-900 rounded-lg transition-colors"
                                >
                                    <span className="text-sm font-medium">
                                        Framework
                                    </span>
                                    <ChevronRight
                                        className={`w-4 h-4 transition-transform duration-200 ${
                                            openSections.includes("framework")
                                                ? "rotate-90"
                                                : ""
                                        }`}
                                    />
                                </button>
                                {renderCategoryCheckboxes(
                                    frameworks,
                                    "framework",
                                )}
                            </div>
                            <Separator className="my-2 bg-neutral-900" />
                            <div className="">
                                <button
                                    onClick={() => toggleSection("useCase")}
                                    className="w-full flex items-center justify-between p-2 hover:bg-neutral-900 rounded-lg transition-colors"
                                >
                                    <span className="text-sm font-medium">
                                        Use case
                                    </span>
                                    <ChevronRight
                                        className={`w-4 h-4 transition-transform duration-200 ${
                                            openSections.includes("useCase")
                                                ? "rotate-90"
                                                : ""
                                        }`}
                                    />
                                </button>
                                {renderCategoryCheckboxes(useCases, "useCase")}
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading
                        ? [...Array(6)].map((_, i) => (
                              <div
                                  key={i}
                                  className="block h-fit rounded-lg overflow-hidden border border-neutral-900 bg-arlink-bg-secondary-color animate-pulse"
                              >
                                  <div className="aspect-video pt-1 px-1 relative overflow-hidden">
                                      <div className="w-full h-full bg-neutral-800 rounded-md" />
                                  </div>
                                  <div className="p-2 flex flex-col gap-2">
                                      <div className="px-1">
                                          <div className="flex items-center space-x-2">
                                              <div className="bg-neutral-800 w-8 h-8 rounded-full" />
                                              <div className="h-4 bg-neutral-800 rounded w-24" />
                                          </div>
                                          <div className="h-3 bg-neutral-800 rounded w-32 mt-2 ml-10" />
                                      </div>
                                      <div className="p-2 flex gap-2 items-start justify-between">
                                          <div className="h-3 bg-neutral-800 rounded w-24" />
                                          <div className="h-3 bg-neutral-800 rounded w-12" />
                                      </div>
                                  </div>
                              </div>
                          ))
                        : filteredTemplates.map((template) => (
                              <TemplateCard
                                  key={template.ID}
                                  template={template}
                              />
                          ))}
                </div>
            </div>
        </div>
    );
}
const TemplateCard = ({ template }: { template: TemplateDashboard }) => {
    return (
        <div
            key={template.ID}
            className="block h-fit rounded-lg overflow-hidden border bg-arlink-bg-secondary-color border-neutral-800 hover:border-neutral-700 transition-colors"
        >
            <div className="aspect-video pt-1 px-1 relative">
                <img
                    src={template.ThumbnailUrl || "/placeholder-clone.jpg"}
                    alt={template.Name}
                    className="object-cover object-center w-full h-full border rounded-md border-neutral-900"
                    onError={(e) => {
                        e.currentTarget.src = "/placeholder-clone.jpg";
                    }}
                />
                <span className="bg-neutral-900 border absolute bottom-3 left-3 border-neutral-800 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                    {
                        frameworks.find(
                            (f) =>
                                f.id ===
                                normalizeFrameworkId(template.Framework || ""),
                        )?.icon || <FileCode className="w-4 h-4 text-neutral-400" />
                    }
                </span>
            </div>

            <div className="p-2 flex flex-col gap-2">
                <Link
                    to={`/templates/${template.Framework}/${template.Name}/${template.ID}`}
                >
                    <div className="px-1">
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold">
                                {template.Name}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-400 line-clamp-2">
                            {template.Description}
                        </p>
                    </div>
                </Link>

                <div className="p-2 flex gap-2 items-center justify-between">
                    <Link
                        to={`https://github.com/${extractOwnerName(
                            template.RepoUrl || "",
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-neutral-500"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="-translate-y-0.2"
                        >
                            <path
                                d="M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21V19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26V21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2Z"
                                fill="gray"
                            />
                        </svg>
                        {template.CreatorName}
                    </Link>
                    <Link
                        to={template.DemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:underline text-sm gap-2 font-semibold rounded-sm"
                    >
                        <ExternalLink size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};
