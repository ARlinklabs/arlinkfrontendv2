import { getAllTemplates } from "@/actions/github/template";
import { Card } from "@/components/ui/card";
import { extractRepoName } from "@/pages/utilts";
import { extractOwnerName } from "@/pages/utilts";
import { useTemplateStore } from "@/store/use-template-store";
import { TemplateDashboard } from "@/types";
import { ChevronRightIcon, GithubIcon } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export function TemplateSelection() {
    const { templates } = useTemplateStore();
    const { setTemplates } = useTemplateStore();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoading(true);
            const response = await getAllTemplates();
            setTemplates(response.templates);
            setIsLoading(false);
        };
        fetchTemplates();
    }, []);

    return (
        <Card className="mx-auto py-4 flex-1 border-neutral-900 bg-arlink-bg-secondary-color lg:w-auto w-full overflow-hidden relative px-6  rounded-lg flex flex-col">
            <h2 className="text-2xl tracking-tight font-semibold mb-4">
                Start with a template
            </h2>
            <div className="grid grid-cols-2 relative z-10 flex-grow gap-4">
                {isLoading ? (
                    <>
                        <div className="col-span-2 animate-pulse">
                            <div className="bg-neutral-800 rounded-md h-[144px] w-full" />
                            <div className="py-2 flex gap-2 border-t border-neutral-800">
                                <div className="flex px-2 items-center gap-2">
                                    <div className="bg-neutral-900 p-2 rounded-full">
                                        <div className="w-4 h-4 bg-neutral-800 rounded-full" />
                                    </div>
                                    <div className="h-4 w-24 bg-neutral-800 rounded" />
                                </div>
                            </div>
                        </div>
                        <div className="animate-pulse">
                            <div className="bg-neutral-800 rounded-md h-[144px] w-full" />
                            <div className="py-2 flex gap-2 border-t border-neutral-800">
                                <div className="flex px-2 items-center gap-2">
                                    <div className="bg-neutral-900 p-2 rounded-full">
                                        <div className="w-4 h-4 bg-neutral-800 rounded-full" />
                                    </div>
                                    <div className="h-4 w-24 bg-neutral-800 rounded" />
                                </div>
                            </div>
                        </div>
                        <div className="animate-pulse">
                            <div className="bg-neutral-800 rounded-md h-[144px] w-full" />
                            <div className="py-2 flex gap-2 border-t border-neutral-800">
                                <div className="flex px-2 items-center gap-2">
                                    <div className="bg-neutral-900 p-2 rounded-full">
                                        <div className="w-4 h-4 bg-neutral-800 rounded-full" />
                                    </div>
                                    <div className="h-4 w-24 bg-neutral-800 rounded" />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <TemplateCard
                            template={templates[2]}
                            className="col-span-2"
                        />
                        <TemplateCard template={templates[1]} />
                        <TemplateCard template={templates[0]} />
                    </>
                )}
            </div>

            <Link
                to="/templates"
                className="pt-3 hover:text-white text-sm text-neutral-400 flex items-center gap-2"
            >
                browse all the templates
                <ChevronRightIcon className="w-4 h-4" />
            </Link>
        </Card>
    );
}

function TemplateCard({
    template,
    className,
}: {
    template: TemplateDashboard | undefined;
    className?: string;
}) {
    return (
        <Link
            to={`/templates/${template?.Framework}/${template?.Name}/${template?.ID}`}
            className={className}
        >
            <Card
                className={`bg-arlink-bg-secondary-color hover:border-neutral-600 group rounded-md overflow-hidden flex flex-col ${className}`}
            >
                <div className="relative z-0 flex-grow w-full">
                    <img
                        className="w-full max-w-full object-cover h-[144px]"
                        src={template?.ThumbnailUrl || "/placeholder-clone.jpg"}
                        onError={(e) => {
                            e.currentTarget.src = "/placeholder-clone.jpg";
                        }}
                    />
                </div>
                <div className="py-2 flex gap-2 border-t group-hover:border-neutral-600">
                    <div className="flex px-2 items-center gap-2">
                        <div className="bg-neutral-900 border-neutral-600 p-2 rounded-full group-hover:border-neutral-400">
                            <GithubIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold">
                            {template?.Name || "Template Name"}
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
