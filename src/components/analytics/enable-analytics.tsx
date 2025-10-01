import { enableAnalytics } from "@/actions/analytics";
import { useState } from "react";
import { useApi } from "@arweave-wallet-kit/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Check, ClipboardCopy, ExternalLink, UnlockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackAnalyticsEnabled } from "@/lib/posthog";
import { Link, useSearchParams } from "react-router-dom";
import { AnalyticsDashboardSkeleton } from "../skeletons";
import { GlowingOutlineButton } from "../ui/glowing-outline-button";
import AnimatedDots from "../ui/animation-dots";

interface EnableAnalyticsProps {
    walletAddress: string;
    handleProcessId: (value: string) => void;
    processId: string | null;
}

const EnableAnalytics = ({
    walletAddress,
    handleProcessId,
    processId,
}: EnableAnalyticsProps) => {
    const api = useApi();
    const [enablingAnalytics, setEnablingAnalytics] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const repoName = searchParams.get("repo") || "Default Project";
    const [innerProcessId, setInnerProcessId] = useState<string | null>(
        processId,
    );

    const scriptTag = `<script>
    // Analytics initialization - just copy this entire script tag to any project
    (function() {
      // Configuration
      const ANALYTICS_CONFIG = {
        src: 'https://analytics_arlink.ar.io/browser.js',
        processId: '${innerProcessId}',
        trackUrlHashes: true,
        debug: false
      };

      // Wait for DOM to be ready
      function init() {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = ANALYTICS_CONFIG.src;
        script.setAttribute('data-process-id', ANALYTICS_CONFIG.processId);
        script.setAttribute('data-track-url-hashes', ANALYTICS_CONFIG.trackUrlHashes);
        script.setAttribute('data-debug', ANALYTICS_CONFIG.debug);
        document.body.appendChild(script);
      }

      // Handle different loading states
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    })();
  </script>`;

    const activateAnalytics = async (projectName: string) => {
        if (!walletAddress) return;
        setEnablingAnalytics(true);
        try {
            const result = await enableAnalytics(projectName, walletAddress, api?.getAoSigner?.());
            if (result) {
                setInnerProcessId(result);
                // Track analytics enabled event
                trackAnalyticsEnabled(projectName);
            }
        } catch (error) {
            console.log(error);
            console.error("Failed to enable analytics:", error);
        } finally {
            setEnablingAnalytics(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(scriptTag);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const scriptLines = scriptTag
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    return (
        <div className="space-y-6">
            {innerProcessId ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative isolate"
                >
                    <div className="absolute top-0 bg-gradient-to-b from-black/80 via-black/70 to-black h-full w-full z-10">
                        <div className="w-full h-1/2 flex  items-center flex-col gap-4 backdrop-blur-sm mx-auto">
                            <div className="flex flex-col mt-8 p-4  h-2/3 max-w-5xl w-full ">
                                <div className="space-y-2">
                                    <header className="text-3xl font-semibold">
                                        Get Started
                                    </header>
                                    <p className="text-lg text-neutral-400 font-medium">
                                        To get analytics up and running, follow
                                        the steps below
                                    </p>
                                </div>
                                <motion.div
                                    className="flex gap-4 mt-8"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 20,
                                        mass: 1,
                                    }}
                                >
                                    <div className="flex-1 bg-neutral-800 flex items-center justify-center border border-neutral-600 font-medium h-8 aspect-square rounded-full text-nowrap">
                                        1
                                    </div>
                                    <Card className="w-full">
                                        <CardHeader className="p-4 w-full ">
                                            <CardTitle className="text-lg">
                                                Copy the below script
                                            </CardTitle>
                                            <CardDescription className="w-full ">
                                                Drop this script into
                                                index.html—make it the last one
                                                if you have others, otherwise
                                                place it right before{" "}
                                                <pre className="inline p-1 bg-neutral-800 rounded-md">
                                                    {"</html>"}
                                                </pre>{" "}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6 relative bg-neutral-900/50 border-t border-neutral-800">
                                            <motion.div
                                                className="absolute top-3 right-3"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className={cn(
                                                        "h-8 w-8 rounded-md bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200",
                                                        copied &&
                                                            "bg-green-900/20 text-green-500 hover:bg-green-900/30 hover:text-green-400",
                                                    )}
                                                    onClick={copyToClipboard}
                                                >
                                                    {copied ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <ClipboardCopy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </motion.div>

                                            <motion.div
                                                onHoverStart={() =>
                                                    setIsHovered(true)
                                                }
                                                onHoverEnd={() =>
                                                    setIsHovered(false)
                                                }
                                            >
                                                <div className="flex">
                                                    <div className="pr-4 space-y-1 text-neutral-500 select-none border-r border-neutral-800 mr-4">
                                                        {scriptLines.map(
                                                            (_, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="text-xs font-mono"
                                                                >
                                                                    {index + 1}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>

                                                    <pre className="text-xs sm:text-sm font-mono text-neutral-300 overflow-x-auto w-full">
                                                        <code className="language-markup">
                                                            {scriptTag}
                                                        </code>
                                                    </pre>
                                                </div>
                                            </motion.div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                                <motion.div
                                    className="flex gap-4 mt-4"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 20,
                                        mass: 1,
                                        delay: 0.2,
                                    }}
                                >
                                    <div className="flex-1 bg-neutral-800 flex items-center justify-center border border-neutral-600 font-medium h-8 aspect-square rounded-full text-nowrap">
                                        2
                                    </div>
                                    <Card className="w-full">
                                        <CardHeader className="p-4">
                                            <CardTitle className="text-lg">
                                                Deploy and visit your site
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 bg-neutral-900/50 border-t border-neutral-800">
                                            Deploy your changes and visit the
                                            deployment to collect your page
                                            views. If you don't see data after
                                            30 seconds, please check for content
                                            blockers and try to navigate between
                                            pages on your site.
                                        </CardContent>
                                        <CardFooter className="py-4 space-x-2">
                                            <Button
                                                size={"sm"}
                                                onClick={() =>
                                                    handleProcessId(
                                                        innerProcessId,
                                                    )
                                                }
                                                variant={"secondary"}
                                                className="text-sm font-semibold px-6"
                                            >
                                                Done
                                            </Button>
                                            <p className="text-xs text-neutral-500">
                                                Before clicking "done" make sure
                                                you have copy pasted the script
                                                tag in your index html file
                                            </p>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <AnalyticsDashboardSkeleton className="z-10" />
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative isolate"
                >
                    <div className="absolute top-0 bg-gradient-to-b from-black/80 via-black/70 to-black h-full w-full z-50">
                        <div className="w-full h-1/3 flex items-center justify-center flex-col gap-4  max-w-3xl mx-auto">
                            <div className="space-y-4">
                                <h2 className="text-6xl font-bold text-center">
                                    Web analytics
                                </h2>
                                <p className="text-balance text-xl text-center leading-tight">
                                    Collect valuable insights on user behaviour
                                    and site performance with detailed page view
                                    metrics. Gain knowledge on top pages
                                </p>
                            </div>
                            <div className="flex items-center gap-2 pt-4">
                                <GlowingOutlineButton
                                    disabled={enablingAnalytics}
                                    className={`${enablingAnalytics ? "glow-btn-default-active glowing_button-default " : "glow-btn  opacity-100"} font-semibold`}
                                    onClick={() =>
                                        activateAnalytics(repoName || "default")
                                    }
                                >
                                    <div className="flex justify-center gap-2 items-center">
                                        <UnlockIcon size={16} strokeWidth={2} />
                                        {enablingAnalytics ? (
                                            <AnimatedDots>
                                                Unlocking
                                            </AnimatedDots>
                                        ) : (
                                            "Unlock"
                                        )}
                                    </div>
                                </GlowingOutlineButton>
                                <Link
                                    to="/hello"
                                    className="text-sm transition-all flex items-center gap-1 px-4 rounded-md py-3 hover:bg-neutral-800"
                                >
                                    Learn More
                                    <ExternalLink
                                        size={15}
                                        className="-translate-y-[0.3]"
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                    <AnalyticsDashboardSkeleton className="z-10" />
                </motion.div>
            )}
        </div>
    );
};

export default EnableAnalytics;
