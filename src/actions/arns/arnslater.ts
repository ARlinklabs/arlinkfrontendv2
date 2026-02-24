import {
    ARIO,
    AOProcess,
    mARIOToken,
    ArconnectSigner,
    ANT,
    ARIO_MAINNET_PROCESS_ID,
    spawnANT,
    DEFAULT_SCHEDULER_ID,
    ANTRegistry,
    ARIO_TESTNET_PROCESS_ID

} from "@ar.io/sdk";
import { connect, dryrun } from "@permaweb/aoconnect";
import Arweave from "arweave";
import { lowerCaseDomain } from "../../lib/utils";
import { createAntStateForOwner, getLatestANTVersion, sleep } from "./arnsutils";

// Helper to get the raw Arweave wallet signer for ar.io/sdk operations
function getRawSigner(signer?: any) {
    if (signer) return signer;
    if (typeof window !== 'undefined' && window.arweaveWallet) return window.arweaveWallet;
    throw new Error("No wallet connected");
}

// Environment detection
const isTestnet = import.meta.env.VITE_BASE_URL === "http://localhost:3000";

// Global configuration based on environment
const AO_CONFIG = {
    MODE: "legacy",
    MU_URL: "https://mu.ao-testnet.xyz",
    CU_URL: "https://cu.ardrive.io",
    GRAPHQL_URL: "https://arweave.net/graphql",
    GATEWAY_URL: "https://arweave.net"
};

// Registry and process IDs based on environment
const REGISTRYPID = isTestnet ? "i_le_yKKPVstLTDSmkHRqf-wYphMnwB9OhleiTgMkWc" : "i_le_yKKPVstLTDSmkHRqf-wYphMnwB9OhleiTgMkWc";
const NAMES_PROCESS_ID = isTestnet ? "agYcCFJtrMG6cqMuZfskIkFTGvUPddICmtQSBIoPdiA" : "qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE";
const ARIO_PROCESS_ID = isTestnet ? ARIO_TESTNET_PROCESS_ID : ARIO_MAINNET_PROCESS_ID;





type Tag = { name: string; value: string };

export async function checkBalance(walletAddress: string): Promise<{
  rawBalance: string;
  decimalBalance: string;
}> {
  const TOKEN_ID = NAMES_PROCESS_ID;
  const DECIMALS = 6;

  try {
    const balanceResponse = await dryrun({
      process: TOKEN_ID,
      tags: [
        { name: 'Action', value: 'Balance' },
        { name: 'Recipient', value: walletAddress },
        { name: 'Data-Protocol', value: 'ao' },
        { name: 'Type', value: 'Message' },
        { name: 'Variant', value: 'ao.TN.1' }
      ],
      Owner: walletAddress
    });

    const messages = balanceResponse.Messages;
    if (!messages || messages.length === 0) {
      throw new Error('No balance messages received from dryrun');
    }

    const balanceTag = messages[0]?.Tags?.find((tag: Tag) => tag.name === 'Balance');
    const rawBalance = balanceTag?.value || '0';

    if (!/^\d+$/.test(rawBalance)) {
      throw new Error('Invalid balance format received from API');
    }

    const decimalBalance = (Number(rawBalance) / 10 ** DECIMALS).toFixed(DECIMALS);

    return {
      rawBalance,
      decimalBalance
    };

  } catch (err: any) {
    console.error('Failed to check balance:', err.message || err);
    throw new Error(`Error checking balance: ${err.message || err}`);
  }
}


// Create separate instances for read and write operations
const arioRead = ARIO.init({
    process: new AOProcess({
        processId: ARIO_PROCESS_ID,
        //@ts-ignore
        ao: connect(AO_CONFIG),
    }),
});

// Helper function to get ARIO instance based on environment
const getArioInstance = (signer?: any) => {
    const walletSigner = getRawSigner(signer);

    if (isTestnet) {
        return ARIO.testnet({
            // @ts-ignore
            signer: new ArconnectSigner(walletSigner, Arweave.init({}))
        });
    } else {
        return ARIO.mainnet({
            // @ts-ignore
            signer: new ArconnectSigner(walletSigner, Arweave.init({}))
        });
    }
};

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

export async function buyArNS(name: string, type: "lease" | "permabuy", addres: string, years?: number, signer?: any) {
    try {
        // step 1 create state for owner
        const ownerState = createAntStateForOwner(addres);

        // step 2 spawn process for owner with latest module
        const antVersion = await getLatestANTVersion();
        const antModuleId = antVersion?.moduleId ?? "";
        const walletSigner = getRawSigner(signer);
        //@ts-ignore
        const aoc = connect(AO_CONFIG);

        // spawning here
        const ownerProcess = await spawnANT({
            ownerState,
            //@ts-ignore
            signer: walletSigner,
            //@ts-ignore
            ao: aoc,
            scheduler: DEFAULT_SCHEDULER_ID,
            module: antModuleId
        });

        // step 3 register on registry
        //@ts-ignore
        const antRegistry = ANTRegistry.init({
            signer: walletSigner,
            hyperbeamUrl: "https://hyperbeam.ario.permaweb.services",
            process: new AOProcess({
                processId: REGISTRYPID,
                //@ts-ignore
                ao: aoc,
            }),
        });

        console.log("Initial ANT registration check starting");
        let antRegistryUpdated = false;
        let retries = 0;
        const maxRetries = 10;
        const retryBaseDelay = 2000; // ms

        console.log(`Starting registration verification for process: ${ownerProcess}`);
        console.log(`Maximum retries: ${maxRetries}, Base delay: ${retryBaseDelay}ms`);

        while (!antRegistryUpdated && retries <= maxRetries) {
            const currentDelay = retryBaseDelay * retries;
            await sleep(currentDelay);

            try {
                const aclRes = await antRegistry.accessControlList({
                    address: addres,
                });

                const antIdSet = new Set([...aclRes.Controlled, ...aclRes.Owned]);
                antRegistryUpdated = antIdSet.has(ownerProcess);

                if (!antRegistryUpdated) {
                    console.log(`- Process ${ownerProcess} not found in registry, retrying...`);
                }
            } catch (error) {
                console.error(`- Error during ACL check:`, error);
            }

            retries++;
        }

        if (!antRegistryUpdated) {
            throw new Error('Failed to register ANT, please try again later.');
        }

        console.log("registry updated now buying record");
        //@ts-ignore
        const ario = getArioInstance(walletSigner);

        const result = await ario.buyRecord(
            {
                name,
                type,
                years: type === "lease" ? years : 1,
                processId: ownerProcess
            },
            {
                tags: [{ name: 'App-Name', value: 'Arlink' }]
            }
        );

        console.log("record bought ", result.id);
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
    const registryUrl = `https://cu.ardrive.io/dry-run?process-id=${REGISTRYPID}`;
    const namesUrl = `https://cu.ardrive.io/dry-run?process-id=${NAMES_PROCESS_ID}`;
    console.log(namesUrl, registryUrl);
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
            Target: REGISTRYPID,
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
                Target: NAMES_PROCESS_ID,
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

export async function getArNSstate(processId: string, signer?: any) {
    const walletSigner = getRawSigner(signer);
    const ant = ANT.init({
        // @ts-ignore
        signer: new ArconnectSigner(walletSigner, Arweave.init({})),
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

export async function setLogo(processId: string, logoTxId: string, signer?: any) {
    try {
        const walletSigner = getRawSigner(signer);
        const ant = ANT.init({
            // @ts-ignore
            signer: new ArconnectSigner(walletSigner, Arweave.init({})),
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

export async function setDescription(processId: string, description: string, signer?: any) {
    try {
        const walletSigner = getRawSigner(signer);
        const ant = ANT.init({
            // @ts-ignore
            signer: new ArconnectSigner(walletSigner, Arweave.init({})),
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

export async function setTicker(processId: string, ticker: string, signer?: any) {
    try {
        const walletSigner = getRawSigner(signer);
        const ant = ANT.init({
            // @ts-ignore
            signer: new ArconnectSigner(walletSigner, Arweave.init({})),
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
    ttlSeconds: number,
    signer?: any
): Promise<SetTtlResult> {
    try {
        const walletSigner = getRawSigner(signer);
        const ant = ANT.init({
            // @ts-ignore
            signer: new ArconnectSigner(walletSigner, Arweave.init({})),
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

export async function makePrimaryNameRequest(name: string, processid: string, signer?: any, address?: string): Promise<PrimaryNameResult> {
    try {
        const walletSigner = getRawSigner(signer);

        // Initialize ARIO based on environment
        const ario = getArioInstance(walletSigner);

        // Request primary name
        // @ts-ignore
        const { id: requestTxId } = await ario.requestPrimaryName({
            name
        });

        if (!address) {
            throw new Error("Wallet address is required for primary name request");
        }

        // Initialize ANT for approval
        const ant = ANT.init({
            // @ts-ignore
            signer: new ArconnectSigner(walletSigner, Arweave.init({})),
            processId: processid
        });

        // Approve the primary name request
        const { id: approvalTxId } = await ant.approvePrimaryNameRequest({
            name,
            address, // Use the current wallet address
            arioProcessId: ARIO_PROCESS_ID
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

export async function IncreaseUndername(namee: string, qtyy: number, signer?: any) {
    try {
        // @ts-ignore
        const ario = getArioInstance(signer);

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


export async function extendLease(name: string, years: number, signer?: any) {

    try {
 // @ts-ignore
 const ario = getArioInstance(signer);

 const { id: txId } = await ario.extendLease(
    {
      name,
      years,
     
    },
    {
      tags: [
        { name: 'App-Name', value: 'Arlink' },
      ],
    }
  );
  console.log('Lease extended. Tx ID:', txId);
  return txId;
  

    }
    catch (err) {
        console.error('Failed to extend lease:', err);
        throw err;
      }
}

export async function addcontroller(walletAddress: string, processId: string, signer?: any) {

    try {
    const walletSigner = getRawSigner(signer);
    const ant = ANT.init({
        // @ts-ignore
        signer: new ArconnectSigner(walletSigner, Arweave.init({})),
        processId: processId
    });
    const { id } = await ant.addController(
        { controller: walletAddress }
    );
    return { success: true, transactionId: id };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            success: false,
            error: errorMessage
        };
    }

}

    