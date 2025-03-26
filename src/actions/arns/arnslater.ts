import {
    ARIO,
    ARIO_MAINNET_PROCESS_ID,
    AOProcess,
    mARIOToken,
} from "@ar.io/sdk";
import { connect } from "@permaweb/aoconnect";

// provide a custom ao infrastructure and process id
const ario = ARIO.init({
    process: new AOProcess({
        processId: ARIO_MAINNET_PROCESS_ID,
        // @ts-ignore
        ao: connect({
            MU_URL: "https://mu-testnet.xyz",
            CU_URL: "https://cu.ardrive.io",
            GRAPHQL_URL: "https://arweave.net/graphql",
            GATEWAY_URL: "https://arweave.net",
        }),
    }),
});

export async function checkArNSAvailability(name: string): Promise<{
    available: boolean;
    processId: string | null;
    errorMessage?: string;
    name: string;
}> {
    console.log(`[ArNS] Checking availability for name: "${name}"`);

    try {
        console.log(`[ArNS] Checking if record exists...`);
        const record = await ario.getArNSRecord({ name });

        if (record && record.processId) {
            console.log(`[ArNS] Name "${name}" is already registered:`, record);
            return {
                processId: record.processId,
                available: false,
                name,
            };
        }

        console.log(`[ArNS] Name "${name}" is available`);
        return {
            processId: null,
            available: true,
            name,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        console.error(`[ArNS] Error checking record:`, errorMessage);

        return {
            available: true,
            processId: null,
            errorMessage: errorMessage,
            name,
        };
    }
}

export async function getArNSPrice(name: string) {
    console.log(`[ArNS] Getting prices for name: "${name}"`);

    try {
        console.log(`[ArNS] Calculating token costs...`);
        const [leasePrice, permabuyPrice] = await Promise.all([
            ario.getTokenCost({
                intent: "Buy-Name",
                name,
                years: 1,
                type: "lease",
            }),
            ario.getTokenCost({
                intent: "Buy-Name",
                name,
                years: 1,
                type: "permabuy",
            }),
        ]);

        console.log(`[ArNS] Prices calculated for "${name}":`, {
            lease: leasePrice,
            permabuy: permabuyPrice,
        });

        return {
            success: true,
            lease: {
                priceInMario: leasePrice,
                priceInArio: new mARIOToken(leasePrice).toARIO(),
            },
            permabuy: {
                priceInMario: permabuyPrice,
                priceInArio: new mARIOToken(permabuyPrice).toARIO(),
            },
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        console.error(
            `[ArNS] Error calculating prices for "${name}":`,
            errorMessage,
        );
        return {
            success: false,
            error: errorMessage,
        };
    }
}
