import { generateSubmissionCode } from "@/actions/github/template";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSigner } from "@/lib/wallet-strategies";

const Generate = () => {
    const signer = useSigner();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [generatedCode, setGeneratedCode] = useState<string>("");
    const [copied, setCopied] = useState<boolean>(false);

    const generateCode = async () => {
        setError("");
        setCopied(false);
        setLoading(true);
        const token = await generateSubmissionCode(signer);
        if (token.error) {
            setError(token.error);
        } else if (!token.code) {
            setError("token was not received");
        } else if (token.code) {
            setGeneratedCode(token.code);
        }
        setLoading(false);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
        } catch (err) {
            setError("Failed to copy to clipboard");
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-12 p-8 space-y-6 rounded-xl bg-neutral-900/50 border border-neutral-800">
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">
                    Generate Submission Code
                </h2>
                <p className="text-sm text-neutral-400 mt-2">
                    Get a unique code to submit your template
                </p>
            </div>

            <Button
                onClick={generateCode}
                disabled={loading}
                className="w-full text-white py-6 text-lg font-medium bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-t-2 border-neutral-200 rounded-full animate-spin" />
                        <span>Generating...</span>
                    </div>
                ) : (
                    "Generate New Code"
                )}
            </Button>

            {error && (
                <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4">
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
            )}

            {generatedCode && (
                <div className="bg-neutral-800/50 p-6 rounded-lg border border-neutral-800">
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <span className="text-sm font-medium text-neutral-400">
                            Your Code:
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-neutral-800"
                            onClick={copyToClipboard}
                        >
                            {copied ? (
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <span>Copied</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span>Copy</span>
                                </div>
                            )}
                        </Button>
                    </div>
                    <p className="font-mono text-lg break-all bg-neutral-800 p-4 rounded-lg text-neutral-200">
                        {generatedCode}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Generate;
