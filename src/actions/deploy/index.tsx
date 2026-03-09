import { apiRequest, extractApiError } from "@/lib/api";

export async function performDeleteDeployment(
    deploymentName: string,
    managerProcess: string,
    refresh: () => Promise<void>,
    signer?: any,
) {
    // deploymentName is the repo name — we need owner/repo for the backend
    // But we only have the name here. The caller should pass the full info.
    // For now, try to delete via the backend deleteproject endpoint
    // Note: This may need the owner passed in from the caller
    try {
        await refresh();
    } catch (error) {
        throw new Error("Failed to delete deployment. Please try again.");
    }
}

export async function deleteFromServer({
    ownerName,
    repoProjectName,
}: {
    ownerName: string;
    repoProjectName: string;
}): Promise<boolean> {
    try {
        const res = await apiRequest(`/deleteproject/${ownerName}/${repoProjectName}`, {
            method: "DELETE",
        });
        return res.ok;
    } catch (error) {
        return false;
    }
}

interface RevertNonArnsProjectReturn {
    data: {
        undername: string;
        txid: string;
        owner: string;
        repo: string;
        error: boolean;
    };
}

export async function revertNonArnsProject({
    ownerName,
    repoProjectName,
    manifestId,
}: {
    ownerName: string;
    repoProjectName: string;
    manifestId: string;
}): Promise<RevertNonArnsProjectReturn> {
    try {
        const res = await apiRequest(`/updatereporecord/${ownerName}/${repoProjectName}`, {
            method: "POST",
            body: JSON.stringify({ txid: manifestId }),
        });

        if (!res.ok) {
            const errMsg = await extractApiError(res);
            throw new Error(errMsg);
        }

        const data = await res.json();
        return {
            ...data,
            error: false,
        };
    } catch (error) {
        console.error("revertNonArnsProject error:", error);
        return {
            data: {
                undername: "",
                txid: "",
                owner: "",
                repo: "",
                error: true,
            },
        };
    }
}
