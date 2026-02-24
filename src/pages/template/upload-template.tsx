import { useGlobalState } from "@/store/useGlobalState";
import { Repository, TemplateSubmission } from "@/types";
import { ArrowLeftIcon, GitBranch, GithubIcon, Loader2 } from "lucide-react";
import React, { SetStateAction, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    extractOwnerName,
    extractRepoName,
    fetchRepositories,
} from "../utilts";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { submitTemplate } from "@/actions/github/template";
import { toast } from "sonner";
import { useAoSigner } from "ao-wallet-kit";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { GitHubSignInTemplate } from "@/components/ui/github-sign-in";
const UploadTemplate = () => {
    const [step, setStep] = useState<"import" | "upload" | "code">("import");
    const { githubToken } = useGlobalState();
    const { signer } = useAoSigner();
    const [selectRepoUrl, setSelectRepoUrl] = useState("");
    const [code, setCode] = useState<string>("");

    if (!githubToken) {
        return (
            <div className="flex flex-col mt-8 items-center justify-center min-h-[80vh] px-4">
                <div className="bg-neutral-950 border w-full max-w-[800px] border-neutral-900 hover:border-neutral-800 rounded-lg p-8 mb-6">
                    <div className="flex flex-col items-center text-center w-full gap-8">
                        <div className="w-full h-[300px] bg-neutral-800/50 rounded-lg flex items-center justify-center">
                            <GithubIcon className="w-16 h-16 text-neutral-700" />
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <h2 className="text-2xl font-bold text-white">
                                Connect Your GitHub Account
                            </h2>
                            <p className="text-neutral-400 max-w-md">
                                To upload a template, you'll need to connect
                                your GitHub account first. This allows us to
                                access your repositories.
                            </p>

                            <div className="mt-4">
                                <GitHubSignInTemplate />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="max-w-7xl pt-10 mx-auto px-[16px]">
            <div className="mx-auto max-w-2xl">
                <header>
                    <Link
                        to={step === "upload" ? "#" : "/templates"}
                        onClick={() => step === "upload" && setStep("import")}
                        className="text-sm text-neutral-400 flex items-center gap-2"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Go back
                    </Link>
                    <h1 className="text-2xl font-bold mt-1 tracking-tighter">
                        Upload a template
                    </h1>
                </header>
                <main className="mt-4">
                    <div className="text-sm flex gap-1 my-2 text-neutral-400">
                        Step
                        <span className="font-semibold text-white">{step}</span>
                    </div>
                    {step === "import" && (
                        <RepoSelector
                            setStep={setStep}
                            setSelectRepoUrl={setSelectRepoUrl}
                        />
                    )}
                    {step === "code" && (
                        <CodeAuth
                            setCode={setCode}
                            setStep={setStep}
                            code={code}
                        />
                    )}
                    {step === "upload" && (
                        <Upload selectRepoUrl={selectRepoUrl} code={code} api={api} />
                    )}
                </main>
            </div>
        </section>
    );
};

const CodeAuth = ({
    setCode,
    setStep,
    code,
}: {
    setCode: React.Dispatch<SetStateAction<string>>;
    setStep: (step: "import" | "upload" | "code") => void;
    code: string;
}) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (code.length === 6) {
            setStep("upload");
        } else {
            toast.error("Please enter a valid code");
        }
    };
    return (
        <form
            onSubmit={handleSubmit}
            className="h-[200px] flex-col gap-2 w-full flex items-center justify-center"
        >
            <InputOTP
                maxLength={6}
                onChange={setCode}
                onSubmit={() => {
                    setStep("upload");
                }}
            >
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </InputOTP>
            <Button className="mt-4 text-sm text-black">Submit</Button>
        </form>
    );
};

const RepoSelector = ({
    setStep,
    setSelectRepoUrl,
}: {
    setStep: (step: "import" | "upload" | "code") => void;
    setSelectRepoUrl: (url: string) => void;
}) => {
    const { githubToken } = useGlobalState();
    const [repos, setRepos] = useState<Repository[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (githubToken) {
            setIsLoading(true);
            fetchRepositories({
                githubToken,
                setRepositories: setRepos,
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [githubToken]);

    const filteredRepos = repos.filter((repo) =>
        repo.full_name.toLowerCase().includes(search.toLowerCase()),
    );

    const onSelectRepo = (repo: Repository) => {
        setStep("code");
        setSelectRepoUrl(repo.html_url);
    };

    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setNotFound(false);
    };

    return (
        <div className="w-full border-neutral-800 border bg-arlink-bg-secondary-color p-4 rounded-lg">
            <div className="flex items-center justify-between">
                <h2 className="text-xl tracking-tighter font-semibold">
                    Import from Github
                </h2>
                <input
                    type="text"
                    placeholder="Search repositories..."
                    value={search}
                    onChange={onSearch}
                    className="px-3 py-1.5 text-sm bg-neutral-900 border border-neutral-800 rounded-md text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                />
            </div>
            <ScrollArea className="border-2 mt-3 bg-neutral-950 rounded-md h-[300px] w-full">
                {isLoading && (
                    <div className="flex flex-col gap-1 p-1 pr-[10px]">
                        <Skeleton className="h-[60px] w-full rounded-sm" />
                        <Skeleton className="h-[60px] w-full rounded-sm" />
                        <Skeleton className="h-[60px] w-full rounded-sm" />
                        <Skeleton className="h-[60px] w-full rounded-sm" />
                        <Skeleton className="h-[60px] w-full rounded-sm" />
                        <Skeleton className="h-[60px] w-full rounded-sm" />
                    </div>
                )}

                {!isLoading && filteredRepos.length === 0 && !notFound && (
                    <div className="flex items-center justify-center h-[300px] bg-black">
                        <div className="flex flex-col items-center gap-2">
                            <GithubIcon className="w-8 h-8 text-neutral-500" />
                            <p className="text-sm text-neutral-400">
                                No repositories found
                            </p>
                            <p className="text-xs text-neutral-500">
                                Try adjusting your search
                            </p>
                        </div>
                    </div>
                )}

                {!isLoading && filteredRepos.length > 0 && !notFound && (
                    <div className="flex flex-col gap-1 p-1 pr-[10px] bg-black">
                        {filteredRepos.map((repo) => (
                            <RepositoryItem
                                key={repo.id}
                                fullName={repo.full_name}
                                updatedAt={repo.updated_at}
                                onSelect={() => onSelectRepo(repo)}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

interface RepositoryItemProps {
    fullName: string;
    updatedAt: string;
    onSelect: () => void;
}

const RepositoryItem = ({
    fullName,
    updatedAt,
    onSelect,
}: RepositoryItemProps) => {
    return (
        <div className="px-4 py-3 w-full rounded-sm bg-arlink-bg-secondary-color flex items-center justify-between hover:bg-neutral-900 transition-colors">
            <div className="flex items-center gap-3">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M10 0C8.68678 0 7.38642 0.258658 6.17317 0.761205C4.95991 1.26375 3.85752 2.00035 2.92893 2.92893C1.05357 4.8043 0 7.34784 0 10C0 14.42 2.87 18.17 6.84 19.5C7.34 19.58 7.5 19.27 7.5 19V17.31C4.73 17.91 4.14 15.97 4.14 15.97C3.68 14.81 3.03 14.5 3.03 14.5C2.12 13.88 3.1 13.9 3.1 13.9C4.1 13.97 4.63 14.93 4.63 14.93C5.5 16.45 6.97 16 7.54 15.76C7.63 15.11 7.89 14.67 8.17 14.42C5.95 14.17 3.62 13.31 3.62 9.5C3.62 8.39 4 7.5 4.65 6.79C4.55 6.54 4.2 5.5 4.75 4.15C4.75 4.15 5.59 3.88 7.5 5.17C8.29 4.95 9.15 4.84 10 4.84C10.85 4.84 11.71 4.95 12.5 5.17C14.41 3.88 15.25 4.15 15.25 4.15C15.8 5.5 15.45 6.54 15.35 6.79C16 7.5 16.38 8.39 16.38 9.5C16.38 13.32 14.04 14.16 11.81 14.41C12.17 14.72 12.5 15.33 12.5 16.26V19C12.5 19.27 12.66 19.59 13.17 19.5C17.14 18.16 20 14.42 20 10C20 8.68678 19.7413 7.38642 19.2388 6.17317C18.7362 4.95991 17.9997 3.85752 17.0711 2.92893C16.1425 2.00035 15.0401 1.26375 13.8268 0.761205C12.6136 0.258658 11.3132 0 10 0Z"
                        fill="white"
                    />
                </svg>
                <div className="flex gap-1 flex-col">
                    <p className="text-sm font-medium text-white">{fullName}</p>
                    <p className="text-xs text-neutral-400">
                        Updated {updatedAt}
                    </p>
                </div>
            </div>
            <button
                onClick={onSelect}
                className="px-4 py-1.5 text-sm font-medium text-white bg-neutral-800 rounded-md hover:bg-neutral-700 transition-colors"
            >
                Select
            </button>
        </div>
    );
};

const Upload = ({
    selectRepoUrl,
    code,
    api,
}: {
    selectRepoUrl: string;
    code: string;
    api?: any;
}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<TemplateSubmission>({
        name: extractRepoName(selectRepoUrl),
        description: "",
        repoUrl: selectRepoUrl,
        framework: "",
        useCase: "",
        thumbnailUrl: "",
        creatorName: extractOwnerName(selectRepoUrl),
        demoUrl: "",
        submissionCode: code,
    });
    const [errors, setErrors] = useState({
        name: "",
        description: "",
        framework: "",
        useCase: "",
        thumbnailUrl: "",
        creatorName: "",
        demoUrl: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            name: "",
            description: "",
            framework: "",
            useCase: "",
            thumbnailUrl: "",
            creatorName: "",
            demoUrl: "",
        };

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = "Template name is required";
            isValid = false;
        } else if (formData.name.length < 3) {
            newErrors.name = "Template name must be at least 3 characters";
            isValid = false;
        }

        // Description validation
        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
            isValid = false;
        } else if (formData.description.length < 10) {
            newErrors.description =
                "Description must be at least 10 characters";
            isValid = false;
        }

        // Framework validation
        if (!formData.framework) {
            newErrors.framework = "Please select a framework";
            isValid = false;
        }

        // Use case validation
        if (!formData.useCase.trim()) {
            newErrors.useCase = "Use case is required";
            isValid = false;
        }

        // Thumbnail URL validation
        if (!formData.thumbnailUrl.trim()) {
            newErrors.thumbnailUrl = "Thumbnail URL is required";
            isValid = false;
        } else {
            try {
                new URL(formData.thumbnailUrl);
            } catch (e) {
                newErrors.thumbnailUrl = "Please enter a valid URL";
                isValid = false;
            }
        }

        // Creator name validation
        if (!formData.creatorName.trim()) {
            newErrors.creatorName = "Creator name is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            try {
                const response = await submitTemplate(formData, signer);
                toast.success("Template submitted successfully");
                navigate(`/templates`);
                console.log(response);
            } catch (error) {
                console.error("Failed to submit template:", error);
                toast.error("Failed to submit template");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="w-full rounded-lg pb-40">
            <div className="bg-neutral-950 border w-full max-w-[800px] border-neutral-900 hover:border-neutral-800 rounded-lg p-[14px] mb-6">
                <div className="flex flex-col items-start w-full gap-6">
                    {formData.thumbnailUrl && (
                        <img
                            src={formData.thumbnailUrl}
                            alt="Template preview"
                            className="rounded-md border border-neutral-800 object-cover w-full aspect-video"
                        />
                    )}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold">
                                {formData.name}
                            </h2>
                        </div>
                        <p className="text-sm text-white mb-4">
                            {formData.description}
                        </p>
                        <p className="text-xs text-neutral-400 mb-3">repo</p>
                        <div className="flex items-start flex-col gap-2 text-sm text-white">
                            <div className="flex items-center gap-2">
                                <GithubIcon className="w-5 h-5" />
                                <span className="font-semibold">
                                    {extractOwnerName(selectRepoUrl)}/
                                    {extractRepoName(selectRepoUrl)}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <GitBranch className="w-4 h-4 text-white" />
                                <div className="flex items-center space-x-2 rounded-full bg-neutral-800 px-3 py-1">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                    <span className="text-white">main</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Separator className="my-6" />
            <div className="flex items-center justify-between">
                <h2 className="text-xl tracking-tighter font-semibold">
                    Add template details
                </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 mt-3 rounded-md">
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-white mb-1"
                        >
                            Template Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full p-2 bg-neutral-950 border ${
                                errors.name
                                    ? "border-red-500"
                                    : "border-neutral-800"
                            } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neutral-700`}
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-white mb-1"
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className={`w-full p-2 bg-neutral-950 border ${
                                errors.description
                                    ? "border-red-500"
                                    : "border-neutral-800"
                            } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neutral-700`}
                            required
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.description}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="thumbnailUrl"
                            className="block text-sm font-medium text-white mb-1"
                        >
                            Thumbnail URL
                        </label>
                        <input
                            type="url"
                            id="thumbnailUrl"
                            name="thumbnailUrl"
                            value={formData.thumbnailUrl}
                            onChange={handleChange}
                            className={`w-full p-2 bg-neutral-950 border ${
                                errors.thumbnailUrl
                                    ? "border-red-500"
                                    : "border-neutral-800"
                            } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neutral-700`}
                            required
                        />
                        {errors.thumbnailUrl && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.thumbnailUrl}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="framework"
                            className="block text-sm font-medium text-white mb-1"
                        >
                            Framework
                        </label>
                        <select
                            id="framework"
                            name="framework"
                            value={formData.framework}
                            onChange={handleChange}
                            className={`w-full p-2 bg-neutral-950 border ${
                                errors.framework
                                    ? "border-red-500"
                                    : "border-neutral-800"
                            } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neutral-700`}
                            required
                        >
                            <option value="">Select Framework</option>
                            <option value="react">React</option>
                            <option value="next">Next.js</option>
                            <option value="vue">Vue</option>
                            <option value="angular">Angular</option>
                        </select>
                        {errors.framework && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.framework}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="demoUrl"
                            className="block text-sm font-medium text-white mb-1"
                        >
                            Demo URL
                        </label>
                        <input
                            type="url"
                            id="demoUrl"
                            name="demoUrl"
                            value={formData.demoUrl}
                            onChange={handleChange}
                            className={`w-full p-2 bg-neutral-950 border ${
                                errors.demoUrl
                                    ? "border-red-500"
                                    : "border-neutral-800"
                            } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neutral-700`}
                        />
                        {errors.demoUrl && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.demoUrl}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="useCase"
                            className="block text-sm font-medium text-white mb-1"
                        >
                            Use Case
                        </label>
                        <select
                            id="useCase"
                            name="useCase"
                            value={formData.useCase}
                            onChange={handleChange}
                            className={`w-full p-2 bg-neutral-950 border ${
                                errors.useCase
                                    ? "border-red-500"
                                    : "border-neutral-800"
                            } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neutral-700`}
                            required
                        >
                            <option value="">Select Use Case</option>
                            <option value="solana">Solana</option>
                            <option value="normal">Normal</option>
                            <option value="arweave">Arweave</option>
                            <option value="ethereum">Ethereum</option>
                        </select>
                        {errors.useCase && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.useCase}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="creatorName"
                            className="block text-sm font-medium text-white mb-1"
                        >
                            Creator Name
                        </label>
                        <input
                            type="text"
                            id="creatorName"
                            name="creatorName"
                            value={formData.creatorName}
                            disabled
                            readOnly
                            className={`w-full p-2 bg-neutral-950 border ${
                                errors.creatorName
                                    ? "border-red-500"
                                    : "border-neutral-800"
                            } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neutral-700`}
                            required
                        />
                        {errors.creatorName && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.creatorName}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full p-2 text-sm flex items-center justify-center gap-2 font-medium text-black bg-white border border-neutral-800 rounded-md hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading && <Loader2 className="animate-spin" />}
                    {isLoading ? "Submitting..." : "Submit Template"}
                </button>
            </form>
            {isLoading && (
                <div className="flex flex-col items-center justify-center mt-6 gap-4">
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-sm text-white">
                            Submitting template...
                        </p>
                        <p className="text-xs text-neutral-400">
                            This process usually takes 3-4 seconds
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadTemplate;
