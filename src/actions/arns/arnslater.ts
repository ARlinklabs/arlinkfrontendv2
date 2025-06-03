import {
    ARIO,
    AOProcess,
    mARIOToken,
   
    ArconnectSigner,
    ANT,
    type AoARIOWrite,
    ARIO_MAINNET_PROCESS_ID,
    
    
} from "@ar.io/sdk";
import { connect } from "@permaweb/aoconnect";
import Arweave from "arweave";
import { lowerCaseDomain } from "../../lib/utils";

// Create separate instances for read and write operations
const arioRead = ARIO.init({
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


const ant = ANT.init({
    // @ts-ignore
    signer: new ArconnectSigner(window.arweaveWallet, Arweave.init({})),
    processId: ARIO_MAINNET_PROCESS_ID
});

const arioWrite = ARIO.init({
    process: new AOProcess({
        processId: ARIO_MAINNET_PROCESS_ID,
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
                processId: ARIO_MAINNET_PROCESS_ID
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
    const registryUrl = 'https://cu.ardrive.io/dry-run?process-id=i_le_yKKPVstLTDSmkHRqf-wYphMnwB9OhleiTgMkWc';
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
        }).filter(item => item.name !== item.processId);
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

export async function getArNSstate(processId: string) {
    const ant = ANT.init({
        // @ts-ignore
        signer: new ArconnectSigner(window.arweaveWallet, Arweave.init({})),
        processId: processId
    });
    const state = await ant.getState();
    return state;
}

export async function getpriceinfo(name: string, qty: number, adress: string) {
    const pricemrio = await fetch(`https://payment.ardrive.io/v1/arns/price/Increase-Undername-Limit/${name}?increaseQty=${qty}&currency=usd&userAddress=${adress}`);
    const pricemriojson = await pricemrio.json();
    
    // Convert mARIO to ARIO using the correct format
    const marioValue = parseInt(pricemriojson.mARIO);
    const priceario = Number(new mARIOToken(marioValue).toARIO());
    console.log(priceario);
    
    return {
        priceario
    };
}

export async function setLogo(processId: string, logoTxId: string) {
    try {
        const ant = ANT.init({
            // @ts-ignore
            signer: new ArconnectSigner(window.arweaveWallet, Arweave.init({})),
            processId: processId
        });

        const { id } = await ant.setLogo(
            { txId: logoTxId },
            { tags: [{ name: 'App-Name', value: 'Arlink' }] }
        );

        return {
            success: true,
            transactionId: id
        }; 
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            success: false,
            error: errorMessage
        };
    }
}

export async function setDescription(processId: string, description: string) {
    try {
        const ant = ANT.init({
            // @ts-ignore
            signer: new ArconnectSigner(window.arweaveWallet, Arweave.init({})),
            processId: processId
        });

        const { id } = await ant.setDescription(
            { description },
            { tags: [{ name: 'App-Name', value: 'Arlink' }] }
        );

        return {
            success: true,
            transactionId: id
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            success: false,
            error: errorMessage
        };
    }
}

export async function setTicker(processId: string, ticker: string) {
    try {
        const ant = ANT.init({
            // @ts-ignore
            signer: new ArconnectSigner(window.arweaveWallet, Arweave.init({})),
            processId: processId
        });

        const { id } = await ant.setTicker(
            { ticker },
            { tags: [{ name: 'App-Name', value: 'Arlink' }] }
        );

        return {
            success: true,
            transactionId: id
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            success: false,
            error: errorMessage
        };
    }
}

interface SetTtlResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export async function setTtl(
    processId: string,
    transactionId: string,
    ttlSeconds: number
): Promise<SetTtlResult> {
    try {
        const ant = ANT.init({
            // @ts-ignore
            signer: new ArconnectSigner(window.arweaveWallet, Arweave.init({})),
            processId: processId
        });

        const { id } = await ant.setBaseNameRecord(
            {
                transactionId,
                ttlSeconds
            },
            { tags: [{ name: 'App-Name', value: 'Arlink' }] }
        );

        return {
            success: true,
            transactionId: id
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            success: false,
            error: errorMessage
        };
    }
}

interface PrimaryNameResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export async function makePrimaryNameRequest(name: string): Promise<PrimaryNameResult> {
    try {
        // Initialize ARIO for mainnet
        const ario = ARIO.mainnet({ 
            // @ts-ignore
            signer: new ArconnectSigner(window.arweaveWallet, Arweave.init({}))
        });

        // Request primary name
        // @ts-ignore
        const { id: requestTxId } = await ario.requestPrimaryName({
            name
        });

        // Initialize ANT for approval
        const ant = ANT.init({
            // @ts-ignore
            signer: new ArconnectSigner(window.arweaveWallet, Arweave.init({})),
            processId: ARIO_MAINNET_PROCESS_ID
        });

        // Get the wallet address
        const address = await window.arweaveWallet.getActiveAddress();

        // Approve the primary name request
        const { id: approvalTxId } = await ant.approvePrimaryNameRequest({
            name,
            address, // Use the current wallet address
            arioProcessId: ARIO_MAINNET_PROCESS_ID
        });

        return {
            success: true,
            transactionId: approvalTxId
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            success: false,
            error: errorMessage
        };
    }
}

export async function IncreaseUndername(namee: string, qtyy: number) {
    try {
        // @ts-ignore
        const ario = ARIO.mainnet({signer : new ArconnectSigner(window.arweaveWallet, Arweave.init({}))})

        const normalizedName = lowerCaseDomain(namee);
        const { id: txId } = await ario.increaseUndernameLimit(
            {
                name: normalizedName,
                increaseCount: qtyy,
                fundFrom: 'balance'
            },
            { tags: [{ name: 'App-Name', value: 'Arlink' }] }
        );

        return {
            success: true,
            transactionId: txId
        };
    } catch (error) {
        console.error('Error increasing undername limit:', error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Alternative version compatible with both parameter formats
 * Can accept either (name, qty) or an object with configuration
 */
export async function flexibleIncreaseUndername(
    nameOrConfig: string | { name: string; qty: number; },
    maybeQty?: number
): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
}> {
    // Handle different parameter formats
    let name: string;
    let qty: number;
    
    if (typeof nameOrConfig === 'string') {
        name = nameOrConfig;
        qty = maybeQty as number;
    } else {
        name = nameOrConfig.name;
        qty = nameOrConfig.qty;
    }

    return IncreaseUndername(name, qty);
}


