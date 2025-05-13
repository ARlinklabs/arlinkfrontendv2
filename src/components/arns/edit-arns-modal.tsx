import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { setLogo, setDescription, setTicker } from "@/actions/arns/arnslater";
import { useToast } from "@/components/ui/use-toast";

interface EditArnsModalProps {
    isOpen: boolean;
    onClose: () => void;
    field: "Ticker" | "Description" | "Logo";
    currentValue: string;
    processId: string;
    onSuccess: () => void;
}

export function EditArnsModal({
    isOpen,
    onClose,
    field,
    currentValue,
    processId,
    onSuccess
}: EditArnsModalProps) {
    const [value, setValue] = useState(currentValue);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            if (field === "Logo") {
                const result = await setLogo(processId, value);
                if (!result.success) {
                    throw new Error(result.error);
                }
                toast({
                    title: "Logo Updated",
                    description: "The logo has been successfully updated.",
                    variant: "default",
                });
            } else if (field === "Description") {
                const result = await setDescription(processId, value);
                if (!result.success) {
                    throw new Error(result.error);
                }
                toast({
                    title: "Description Updated",
                    description: "The description has been successfully updated.",
                    variant: "default",
                });
            } else if (field === "Ticker") {
                const result = await setTicker(processId, value);
                if (!result.success) {
                    throw new Error(result.error);
                }
                toast({
                    title: "Ticker Updated",
                    description: "The ticker has been successfully updated.",
                    variant: "default",
                });
            }
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
                    <DialogTitle>Edit {field}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {field === "Description" ? (
                        <Textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={`Enter ${field.toLowerCase()}`}
                            className="min-h-[100px]"
                        />
                    ) : (
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={`Enter ${field.toLowerCase()}`}
                        />
                    )}
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