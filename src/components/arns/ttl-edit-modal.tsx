import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { setTtl } from "@/actions/arns/arnslater";

interface TtlEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    processId: string;
    currentTtl: number;
    transactionId: string;
    onSuccess: () => void;
}

const TTL_PRESETS = [
    { label: "15 minutes", value: 900 }, // 15 * 60
    { label: "1 hour", value: 3600 }, // 60 * 60
    { label: "24 hours", value: 86400 }, // 24 * 60 * 60
];

export function TtlEditModal({
    isOpen,
    onClose,
    processId,
    currentTtl,
    transactionId,
    onSuccess
}: TtlEditModalProps) {
    const [ttlValue, setTtlValue] = useState(currentTtl);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setTtlValue(currentTtl);
    }, [currentTtl]);

    const formatTtl = (seconds: number) => {
        if (seconds < 60) return `${seconds} seconds`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
        return `${Math.floor(seconds / 86400)} days`;
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await setTtl(processId, transactionId, ttlValue);
            if (!result.success) {
                throw new Error(result.error);
            }
            toast({
                title: "TTL Updated",
                description: `The TTL has been successfully updated to ${formatTtl(ttlValue)}.`,
                variant: "default",
            });
            onSuccess();
            onClose();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit TTL</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-400">Current TTL: {formatTtl(ttlValue)}</span>
                        </div>
                        <Slider
                            value={[ttlValue]}
                            onValueChange={([value]) => setTtlValue(value)}
                            min={900}
                            max={86400}
                            step={60}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-neutral-400">
                            <span>15 min</span>
                            <span>24 hours</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {TTL_PRESETS.map((preset) => (
                            <Button
                                key={preset.value}
                                variant="outline"
                                onClick={() => setTtlValue(preset.value)}
                                className={ttlValue === preset.value ? "border-primary" : ""}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 