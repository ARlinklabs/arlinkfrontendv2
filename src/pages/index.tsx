import { Suspense, lazy } from "react";
import { Nav } from "@/components/landing/ui";
import Hero from "@/components/landing/hero";

const LazyHowItWorks = lazy(() => import("@/components/landing/how-it-works"));
const LazyProjects = lazy(() => import("@/components/landing/projects"));
const LazyTestimonials = lazy(
    () => import("@/components/landing/testimonials"),
);
const LazyCommunity = lazy(() => import("@/components/landing/community"));
const LazyFAQSection = lazy(() => import("@/components/landing/faq"));
const LazyFeatures = lazy(() => import("@/components/landing/features"));
const LazyFooter = lazy(() => import("@/components/landing/footer"));

function LazySuspenseLandingPage() {
    return (
        <Suspense fallback={<div className="h-dvh bg-[#09090b]"></div>}>
            <LazyFeatures />
            <LazyHowItWorks />
            <LazyProjects />
            <LazyTestimonials />
            <LazyCommunity />
            <LazyFAQSection />
            <LazyFooter />
        </Suspense>
    );
}

import { useConnection } from "@arweave-wallet-kit/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function Home() {
    const { connect } = useConnection();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        connect();
        console.log(import.meta.env.VITE_ENV);

        // Check if we're not supposed to be on the home page
        if (location.pathname !== "/") {
            navigate(location.pathname + location.search);
        }
    }, [navigate, location]);

    // Only render the home page content if we're actually on the home page
    if (location.pathname !== "/") {
        return null; // or a loading spinner
    }

    return (
        <main className="bg-[#09090B] ">
            <Nav />
            <Hero />
            <LazySuspenseLandingPage />
        </main>
    );
}
