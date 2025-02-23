import MarkdownRender from "@/components/markdown-render";
import { useTemplateStore } from "@/store/use-template-store";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { extractRepoName } from "../utilts";
import { extractOwnerName } from "../utilts";
import { Template } from "@/types";
import { getRepoReadme, getTemplateDetails } from "@/actions/github/template";
import {
    ReadmeSkeleton,
    SelectedTemplateSkeleton,
} from "@/components/skeletons";
import { Helmet } from "react-helmet-async";
import useDeploymentManager from "@/hooks/use-deployment-manager";

interface TemplateDetails extends Template {
    stats?: {
        reviews: string;
        rating: string;
        stars: string;
    };
}

const SelectedTemplate = () => {
    const { id, name, framework } = useParams();
    const { templates } = useTemplateStore();
    const [fetchingReadme, setFetchingReadme] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const { managerProcess } = useDeploymentManager();
    const [readmeContent, setReadmeContent] = useState<string>("");
    const [currentTemplate, setCurrentTemplate] =
        useState<TemplateDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!id || !name || !framework) return;
        const getTemplate = async () => {
            setIsLoading(true);
            const template = await getTemplateDetails({
                framework,
                templateName: name,
                templateId: id,
            });
            if (template.error) {
                setError(template.error);
            } else if (template.template) {
                setCurrentTemplate(template.template);
            }
            setIsLoading(false);
        };
        getTemplate();
    }, [templates, id]);

    useEffect(() => {
        if (!currentTemplate) return;
        const fetchReadmeContent = async () => {
            setFetchingReadme(true);
            const data = await getRepoReadme(
                extractOwnerName(currentTemplate.repoUrl),
                extractRepoName(currentTemplate.repoUrl),
            );
            if (data.error) {
                setFetchingReadme(false);
                setError("failed to fetch readme");
                setTimeout(() => {
                    setError("");
                }, 300);
            } else if (data.content) {
                setReadmeContent(data.content);
            }
            setFetchingReadme(false);
        };
        fetchReadmeContent();
    }, [currentTemplate]);

    if (isLoading) {
        return <SelectedTemplateSkeleton />;
    }

    if (!currentTemplate) {
        return <div>Template not found</div>;
    }

    // Construct meta description using template details
    const metaDescription = `${currentTemplate.description} - A ${
        currentTemplate.framework
    } template for ${currentTemplate.useCase}. Created by ${extractOwnerName(
        currentTemplate.repoUrl,
    )}.`;

    // Construct keywords using template information
    const keywords = `${currentTemplate.framework}, ${
        currentTemplate.useCase
    }, web template, ${currentTemplate.name}, ${extractOwnerName(
        currentTemplate.repoUrl,
    )}`;

    return (
        <>
            <Helmet>
                <title>{`${currentTemplate.name} - ${currentTemplate.framework} Template | Arlink`}</title>
                <meta name="description" content={metaDescription} />
                <meta name="keywords" content={keywords} />

                <meta
                    property="og:title"
                    content={`${currentTemplate.name} - ${currentTemplate.framework} Template`}
                />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:type" content="website" />
                <meta
                    property="og:image"
                    content={currentTemplate.thumbnailUrl}
                />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:site_name" content="Arlink Templates" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content={`${currentTemplate.name} - ${currentTemplate.framework} Template`}
                />
                <meta name="twitter:description" content={metaDescription} />
                <meta
                    name="twitter:image"
                    content={currentTemplate.thumbnailUrl}
                />

                <meta
                    name="author"
                    content={extractOwnerName(currentTemplate.repoUrl)}
                />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={window.location.href} />

                <meta
                    name="template:framework"
                    content={currentTemplate.framework}
                />
                <meta
                    name="template:useCase"
                    content={currentTemplate.useCase}
                />
                {currentTemplate.stats && (
                    <>
                        <meta
                            name="template:rating"
                            content={currentTemplate.stats.rating}
                        />
                        <meta
                            name="template:reviews"
                            content={currentTemplate.stats.reviews}
                        />
                        <meta
                            name="template:stars"
                            content={currentTemplate.stats.stars}
                        />
                    </>
                )}
            </Helmet>

            <div className="max-w-7xl mx-auto text-white px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:min-h-screen gap-8">
                    <div className="w-full lg:w-[40%] p-4 lg:p-8 lg:top-[115px] flex-shrink-0 lg:sticky lg:h-fit">
                        <div className="space-y-6 lg:space-y-8">
                            <Link
                                to="/templates"
                                className="inline-flex items-center text-sm text-neutral-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Template
                            </Link>

                            <div className="space-y-2">
                                <a
                                    href={`https://github.com/${extractOwnerName(
                                        currentTemplate?.repoUrl || "",
                                    )}/${extractRepoName(
                                        currentTemplate?.repoUrl,
                                    )}`}
                                    target="_blank"
                                    className="flex items-center gap-2 text-sm"
                                >
                                    {extractOwnerName(currentTemplate?.repoUrl)}
                                    /{extractRepoName(currentTemplate?.repoUrl)}
                                </a>
                                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight lg:leading-[1.2]">
                                    {currentTemplate?.name}
                                </h1>
                            </div>

                            <p className="text-lg lg:text-xl text-neutral-400">
                                {currentTemplate?.description}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-2">
                                {!managerProcess ? (
                                    <div className="flex justify-center items-center px-3 py-1 rounded-md font-semibold sm:w-auto bg-neutral-800 animate-pulse text-black h-[40px] min-w-[100px] "></div>
                                ) : (
                                    <Link
                                        to={`/templates/clone/${currentTemplate?.framework}/${currentTemplate?.name}/${currentTemplate?.id}`}
                                        className="w-full flex justify-center items-center px-3 py-1 rounded-md font-semibold sm:w-auto bg-white text-black hover:bg-neutral-200"
                                    >
                                        Deploy
                                    </Link>
                                )}
                                <Link
                                    to={currentTemplate.demoUrl}
                                    target="_blank"
                                    className="w-full flex justify-center items-center px-3 py-2 rounded-md font-semibold sm:w-auto bg-neutral-900 text-white hover:bg-neutral-800"
                                >
                                    View Demo
                                </Link>
                            </div>

                            <div className="grid gap-4 pt-6 lg:pt-8 border-t border-neutral-800">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">
                                        Framework
                                    </span>
                                    <span>{currentTemplate.framework}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">
                                        Use Case
                                    </span>
                                    <span>{currentTemplate.useCase}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-[60%] p-4 lg:p-8">
                        <div className="rounded-lg text-white">
                            <img
                                src={currentTemplate.thumbnailUrl}
                                alt="Next.js Logo"
                                className="mb-6 lg:mb-8 w-full h-[200px] sm:h-[250px] lg:h-[300px] object-cover rounded-lg"
                                onError={(e) => {
                                    e.currentTarget.src =
                                        "/placeholder-clone.jpg";
                                }}
                            />
                        </div>

                        <div className="mt-6 lg:mt-8 pb-[60px] lg:pb-[100px]">
                            {fetchingReadme ? (
                                <ReadmeSkeleton />
                            ) : (
                                <MarkdownRender
                                    title={`Documentation for ${currentTemplate.name}`}
                                    content={readmeContent}
                                    isLoading={fetchingReadme}
                                    error={error}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SelectedTemplate;
