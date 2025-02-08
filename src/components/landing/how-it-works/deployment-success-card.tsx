import { useState } from "react";
import Confetti from "react-confetti";

const DeploySuccessCard = () => {
    const [showConfetti, setShowConfetti] = useState(false);

    return (
        <div
            className="h-[536px] p-4 rounded-2xl border border-[#27272a] flex flex-col relative"
            onMouseEnter={() => setShowConfetti(true)}
            onMouseLeave={() => setShowConfetti(false)}
        >
            {showConfetti && (
                <div className="absolute inset-0">
                    <Confetti
                        width={400}
                        height={536}
                        numberOfPieces={100}
                        recycle={false}
                        gravity={0.2}
                    />
                </div>
            )}
            <div className="h-[325px] flex items-center justify-between">
                <img src="/deploy.png" alt="Deployment illustration" />
            </div>
            <div className="border flex flex-col gap-2 border-[#27272a] p-4 rounded-lg">
                <div className="px-2 border border-[#27272a] py-1 rounded-xl w-fit bg-[#18181b]">
                    Step 3
                </div>
                <h3 className="text-2xl font-bold">Your Project Is Live</h3>
                <p className="text-sm text-neutral-400">
                    Your Project is now live. Track its performance and monitor
                    progress in the dashboard.
                </p>
            </div>
        </div>
    );
};

export default DeploySuccessCard;
