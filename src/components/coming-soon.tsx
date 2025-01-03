import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ComingSoon = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center  text-neutral-50">
            <h1 className="text-6xl font-bold mb-4 text-neutral-100">
                Coming Soon
            </h1>
            <p className="text-xl mb-8 text-neutral-400">
                We're working hard to bring you something amazing!
            </p>

            <Button
                onClick={() => navigate("/dashboard")}
                className="bg-arlink-bg-secondary-color text-neutral-50 border-neutral-800 border hover:bg-neutral-800"
            >
                Go to Dashboard
            </Button>
        </div>
    );
};

export default ComingSoon;
