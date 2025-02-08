import Community from "@/components/landing/community";
import FAQSection from "@/components/landing/faq";
import Features from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import HowItWorks from "@/components/landing/how-it-works";
import Revolutioniaze from "@/components/landing/revolutionize";
import { Nav } from "@/components/landing/ui";
import { useConnection } from "arweave-wallet-kit";
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
            <Features />
            <HowItWorks />
            <Community />
            <FAQSection />
            <Revolutioniaze />
        </main>
    );
}
