import { runLua } from "@/lib/ao-vars";
import { TESTING_FETCH } from "@/lib/utils";
import axios from "axios";

export async function performDeleteDeployment(
    deploymentName: string,
    managerProcess: string,
    refresh: () => Promise<void>,
) {
    const query = `local res = db:exec[[
          DELETE FROM Deployments
          WHERE Name = '${deploymentName}'
        ]]`;

    try {
        const res = await runLua(query, managerProcess);
        if (res.Error) {
            throw new Error(res.Error);
        }
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
        // this will delete the project from the server
        await axios.delete(
            `${TESTING_FETCH}/deleteproject/${ownerName}/${repoProjectName}`,
        );

        return true;
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
        // this will delete the project from the server
        const revertResponse = await axios.post(
            `${TESTING_FETCH}/updatereporecord/${ownerName}/${repoProjectName}`,
            {
                txid: manifestId,
            },
        );

    
        return {
            ...revertResponse.data,
            error: false,
        };
    } catch (error) {
        console.log(error);
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
