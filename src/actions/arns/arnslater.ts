import {
    ARIO,
    AOProcess,
    mARIOToken,
    ARIO_TESTNET_PROCESS_ID,
    ArconnectSigner,
    type AoARIOWrite,
} from "@ar.io/sdk";
import { connect } from "@permaweb/aoconnect";
import Arweave from "arweave";

// Create separate instances for read and write operations
const arioRead = ARIO.init({
    process: new AOProcess({
        processId: ARIO_TESTNET_PROCESS_ID,
        // @ts-ignore
        ao: connect({
            MU_URL: "https://mu-testnet.xyz",
            CU_URL: "https://cu.ardrive.io",
            GRAPHQL_URL: "https://arweave.net/graphql",
            GATEWAY_URL: "https://arweave.net",
        }),
    }),
});

const arioWrite = ARIO.init({
    process: new AOProcess({
        processId: ARIO_TESTNET_PROCESS_ID,
        // @ts-ignore
        ao: connect({
            MU_URL: "https://mu-testnet.xyz",
            CU_URL: "https://cu.ardrive.io",
            GRAPHQL_URL: "https://arweave.net/graphql",
            GATEWAY_URL: "https://arweave.net",
        }),
        // @ts-ignore
        signer: new ArconnectSigner(window.arweaveWallet, Arweave.init({})),
    }),
}) as AoARIOWrite;

export async function checkArNSAvailability(name: string) {
    try {
        const record = await arioRead.getArNSRecord({ name });
        return {
            available: !record,
            name,
            errorMessage: null,
        };
    } catch (error) {
        return {
            available: false,
            name: null,
            errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}

export async function getArNSPrice(name: string) {
    try {
        const [leasePrice, permabuyPrice] = await Promise.all([
            arioRead.getTokenCost({
                intent: "Buy-Name",
                name,
                years: 1,
                type: "lease",
            }),
            arioRead.getTokenCost({
                intent: "Buy-Name",
                name,
                years: 1,
                type: "permabuy",
            }),
        ]);

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
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Add write operations
export async function buyArNS(name: string, type: "lease" | "permabuy", years?: number) {
    try {
        // @ts-ignore
        const ario = ARIO.testnet({ signer: new ArconnectSigner(window.arweaveWallet, Arweave.init({})) });
        
        const result = await ario.buyRecord(
            { 
                name, 
                type, 
                years: type === "lease" ? years : 1,
                processId: ARIO_TESTNET_PROCESS_ID
            },
            {
                tags: [{ name: 'App-Name', value: 'ArNS-App' }]
            }
        );

        return {
            success: true,
            transactionId: result.id,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function getWalletOwnedNamesindash(walletAddress: string): Promise<
  {
    name: string;
    processId: string;
    startTimestamp?: number;
    endTimestamp?: number;
    type?: string;
    purchasePrice?: number;
    undernameLimit?: number;
  }[]
> {
    const registryUrl = 'https://cu138.ao-testnet.xyz/dry-run?process-id=i_le_yKKPVstLTDSmkHRqf-wYphMnwB9OhleiTgMkWc';
    const namesUrl = 'https://cu.ardrive.io/dry-run?process-id=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE';
    const headers = {
        'accept': '*/*',
        'content-type': 'application/json',
        'origin': 'https://arns.app',
        'referer': 'https://arns.app/'
    };

    try {
        // 1. Get owned process IDs
        const registryBody = JSON.stringify({
            Id: "1234",
            Target: "i_le_yKKPVstLTDSmkHRqf-wYphMnwB9OhleiTgMkWc",
            Owner: "1234",
            Anchor: "0",
            Data: "1234",
            Tags: [
                { name: "Action", value: "Access-Control-List" },
                { name: "Address", value: walletAddress },
                { name: "Data-Protocol", value: "ao" },
                { name: "Type", value: "Message" },
                { name: "Variant", value: "ao.TN.1" }
            ]
        });
        const registryResponse = await fetch(registryUrl, { method: 'POST', headers, body: registryBody });
        if (!registryResponse.ok) throw new Error(`Registry API error: ${registryResponse.status}`);
        const registryData = JSON.parse(await registryResponse.text());
        let ownedProcessIds: string[] = [];
        if (registryData.Messages?.[0]?.Data) {
            const ownedData = JSON.parse(registryData.Messages[0].Data);
            ownedProcessIds = ownedData.Owned || [];
        }
        if (ownedProcessIds.length === 0) return [];

        // 2. Get all names for owned process IDs (across all pages)
        let cursor = "";
        const processIdToItem = new Map<string, any>();
        let keepPaging = true;
        while (keepPaging) {
            const tags = [
                { name: "Action", value: "Paginated-Records" },
                { name: "Limit", value: "1000" },
                { name: "Data-Protocol", value: "ao" },
                { name: "Type", value: "Message" },
                { name: "Variant", value: "ao.TN.1" }
            ];
            if (cursor) tags.push({ name: "Cursor", value: cursor });
            const namesBody = JSON.stringify({
                Id: "1234",
                Target: "qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE",
                Owner: "1234",
                Anchor: "0",
                Data: "1234",
                Tags: tags
            });
            const namesResponse = await fetch(namesUrl, { method: 'POST', headers, body: namesBody });
            if (!namesResponse.ok) throw new Error(`Names API error: ${namesResponse.status}`);
            const namesText = await namesResponse.text();
            const namesData = JSON.parse(namesText);
            if (namesData.Messages?.[0]?.Data) {
                const parsedData = JSON.parse(namesData.Messages[0].Data);
                const items = parsedData.items || [];
                for (const item of items) {
                    if (ownedProcessIds.includes(item.processId)) {
                        processIdToItem.set(item.processId, item);
                    }
                }
                if (parsedData.nextCursor) {
                    cursor = parsedData.nextCursor;
                } else {
                    keepPaging = false;
                }
            } else {
                keepPaging = false;
            }
        }
        return ownedProcessIds.map(processId => {
            const item = processIdToItem.get(processId);
            if (item) {
                return {
                    name: item.name,
                    processId: item.processId,
                    startTimestamp: item.startTimestamp,
                    endTimestamp: item.endTimestamp,
                    type: item.type,
                    purchasePrice: item.purchasePrice,
                    undernameLimit: item.undernameLimit,
                };
            } else {
                return { name: processId, processId };
            }
        });
    } catch (error) {
        console.error("Error fetching wallet owned names:", error);
        throw error; // Let the dashboard handle the error and loading state
    }
}

/**
 * Fetches the ArNS record for a given name.
 * @param name - The ArNS name to look up.
 * @returns The ArNS record object or null if not found.
 */
export async function getArNSRecordInfo(name: string) {
    try {
        const record = await arioRead.getArNSRecord({ name });
        return record || null;
    } catch (error) {
        console.error("Failed to fetch ArNS record:", error);
        return null;
    }
}











// // for dash table need to get arns name , role , pid and expiry date , we can get all this through  get own arns fn and then  we egt state of the proocess 

// // on the name page we need to get the state of the process to get all initial data info 
// const ant = ANT.init({
//     signer: new ArConnectSigner(window.arweaveWallet, Arweave.init({})),
//     processId: 'bh9l1cy0aksiL_x9M359faGzM_yjralacHIUo8_nQXM'
//   });
  
// const state = await ant.getState();

// //manage undernames buttton will give the user a slider tro but more names 

// // to set logo 
// const { id: txId } = await ant.setLogo(
//     { txId: 'U7RXcpaVShG4u9nIcPVmm2FJSM5Gru9gQCIiRaIPV7f' },
//     // optional tags
//     { tags: [{ name: 'App-Name', value: 'My-Awesome-App' }] },
//   );

// /// set  description
// const { id: txId } = await ant.setDescription(
//     { description: 'A friendly description of this ANT' },
//     // optional tags
//     { tags: [{ name: 'App-Name', value: 'My-Awesome-App' }] },

//   );

// // extend lease 
// const ario = ARIO.mainnet({ signer: new ArweaveSigner(jwk) });
// const { id: txId } = await ario.extendLease(
//   {
//     name: 'ar-io',
//     years: 1,
//   },
//   // optional additional tags
//   { tags: [{ name: 'App-Name', value: 'My-Awesome-App' }] },
// );

// // set ttl 
// // get the ant for the base name
// const arnsRecord = await ario.getArNSRecord({ name: 'ardrive' });
// const ant = await ANT.init({ processId: arnsName.processId });
// const { id: txId } = await ant.setBaseNameRecord({
//   transactionId: '432l1cy0aksiL_x9M359faGzM_yjralacHIUo8_nQXM',
//   ttlSeconds: 3600,
// });

// // ardrive.ar.io will now resolve to the provided 432l1cy0aksiL_x9M359faGzM_yjralacHIUo8_nQXM transaction id

// ///to set primary anme first make prmary name  , first request a primanry anme then aprove the primary anme request

// // to request a primary namr 
// const ario = ARIO.mainnet({ signer: new ArweaveSigner(jwk) });
// const { id: txId } = await ario.requestPrimaryName({
//   name: 'arns',
// });

// // them apprive primary anme request 
// const { id: txId } = await ant.approvePrimaryNameRequest({
//     name: 'arns',
//     address: 't4Xr0_J4Iurt7caNST02cMotaz2FIbWQ4Kbj616RHl3', // must match the request initiator address
//     arioProcessId: ARIO_MAINNET_PROCESS_ID, // the ARIO process id to use for the request
//   });


