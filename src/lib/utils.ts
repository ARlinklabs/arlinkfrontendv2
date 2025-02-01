import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { ANT, ARIO, ArconnectSigner } from "@ar.io/sdk/web";
import Arweave from "arweave";
import { useAoSigner } from "@project-kardeshev/ao-wallet-kit";


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function timeAgo(isoDate: string): string {
    const timestamp = new Date(isoDate); // Convert ISO 8601 string to Date object
    const now = new Date(); // Get current time

    const differenceInSeconds = Math.floor(
        (now.getTime() - timestamp.getTime()) / 1000,
    ); // Difference in seconds

    // Calculate time components
    const minutes = Math.floor(differenceInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `· ${days}d ago`;
    }
    if (hours > 0) {
        return `· ${hours}h ago`;
    }
    if (minutes > 0) {
        return `· ${minutes}m ago`;
    }
    return "· just now";
}

export const BUILDER_BACKEND =
    import.meta.env.VITE_BACKEND_URL ??
    (import.meta.env.VITE_ENV === "test"
        ? "http://localhost:3050"
        : "https://vmi2322729.contaboserver.net");

export const TESTING_FETCH = "https://vmi2322729.contaboserver.net";

export function getTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const date = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

export async function setUndername(
    
    antProcess: string,
    manifestId: string,
    undername: string,
) {
    const ao = connect();
    const msgtags = [
        { name: "Action", value: "Set-Record" },
        { name: "Sub-Domain", value: undername },
        { name: "Transaction-Id", value: manifestId },
        { name: "TTL-Seconds", value: "3600" },
    ];
    try {

        const signer = useAoSigner();
        const result = await ao.message({
            process: antProcess,
            tags: msgtags,
            signer: createDataItemSigner(signer),
            data: "",
        });
        console.log("set arns message officially sent out ", result);
        return result;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getPrimaryname(walletaddy: string) {
    try {

const signer = useAoSigner();
        // Initialize Arweave
        const arweave = Arweave.init({});

        // step 1 init ario
        const ario = ARIO.init({
            signer: new ArconnectSigner(signer),
        });

        // step 2 get primary name from wallet
        const nameResponse = await ario.getPrimaryName({
            address: walletaddy,
        });

        // Check if name exists
        if (!nameResponse?.name) {
            throw new Error("No primary name found");
        }

        const primaryname = nameResponse.name;

        // step 3 get process id from primaryname
        const recordResponse = await ario.getArNSRecord({ name: primaryname });

        // Check if record exists and has processId
        if (!recordResponse?.processId) {
            throw new Error("No process ID found");
        }

        const pid = recordResponse.processId;

        // step 4 get logo from process id
        const ant = ANT.init({
            signer: new ArconnectSigner(signer),
            processId: pid,
        });

        const logoTxId = await ant.getLogo();
        const logo = logoTxId;

        return { primaryname, logo };
    } catch (error) {
        console.error("Error in getPrimaryname:", error);
        throw error;
    }
}
