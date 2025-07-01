import { connect, createDataItemSigner } from "@permaweb/aoconnect";

export const AppVersion = "1.0.0";
export const AOModule = "u1Ju_X8jiuq4rX9Nh-ZGRQuYQZgV2MKLMT3CZsykk54"; // sqlite
export const AOScheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";

// Array of CU URLs for cycling through in case of slow responses
const CU_URLS = [
    "https://cu.ardrive.io",
    "https://ur-cu.randao.net",
];

let currentCuUrlIndex = 0;
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Gets the next CU URL in rotation
 */
function getNextCuUrl(): string {
    const url = CU_URLS[currentCuUrlIndex];
    currentCuUrlIndex = (currentCuUrlIndex + 1) % CU_URLS.length;
    return url;
}

/**
 * Creates an AO connection with automatic CU URL cycling on timeout
 */
export function createAoConnection(options: { MODE?: "legacy" | "mainnet" } = {}) {
    const mode = options.MODE || "legacy";
    
    if (mode === "legacy") {
        return connect({
            CU_URL: getNextCuUrl(),
            MODE: "legacy" as const,
        });
    } else {
        return connect({
            CU_URL: getNextCuUrl(),
            MODE: "mainnet" as const,
            GATEWAY_URL: "https://arweave.net",
            MU_URL: "https://mu.ao-testnet.xyz",
        });
    }
}

/**
 * Executes an AO operation with automatic retry using different CU URLs on timeout
 */
export async function executeWithRetry<T>(
    operation: (ao: any) => Promise<T>,
    maxRetries: number = CU_URLS.length
): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const ao = createAoConnection();
            
            // Create a timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Request timeout after ${REQUEST_TIMEOUT}ms for CU URL: ${CU_URLS[(currentCuUrlIndex - 1 + CU_URLS.length) % CU_URLS.length]}`));
                }, REQUEST_TIMEOUT);
            });
            
            // Race between the operation and timeout
            const result = await Promise.race([
                operation(ao),
                timeoutPromise
            ]);
            
            return result;
        } catch (error) {
            lastError = error as Error;
            console.warn(`Attempt ${attempt + 1} failed with CU URL ${CU_URLS[(currentCuUrlIndex - 1 + CU_URLS.length) % CU_URLS.length]}:`, error);
            
            // If this was the last attempt, throw the error
            if (attempt === maxRetries - 1) {
                break;
            }
            
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    throw new Error(`All CU URL attempts failed. Last error: ${lastError?.message}`);
}

// Legacy export for backward compatibility
export const CU_URL = CU_URLS[0];

const CommonTags = [
    { name: "App-Name", value: "ARlink" },
    { name: "App-Version", value: AppVersion },
];

export type Tag = { name: string; value: string };

export async function spawnProcess(
    name?: string,
    tags?: Tag[],
    newProcessModule?: string,
) {
    return executeWithRetry(async (ao) => {
        if (tags) {
            tags = [...CommonTags, ...tags];
        } else {
            tags = CommonTags;
        }
        tags = name ? [...tags, { name: "Name", value: name }] : tags;

        const result = await ao.spawn({
            module: newProcessModule ? newProcessModule : AOModule,
            scheduler: AOScheduler,
            tags,
            signer: createDataItemSigner(window.arweaveWallet),
        });
        return result;
    });
}

export async function runLua(code: string, process: string, tags?: Tag[]) {
    return executeWithRetry(async (ao) => {
        if (tags) {
            tags = [...CommonTags, ...tags];
        } else {
            tags = CommonTags;
        }

        // if (!window.arweaveWallet) {
        //   const dryMessage = await ao.dryrun({
        //     process,
        //     data: code,
        //     tags,
        //   });
        //   return dryMessage
        // }

        tags = [...tags, { name: "Action", value: "Eval" }];

        const message = await ao.message({
            process,
            data: code,
            signer: createDataItemSigner(window.arweaveWallet),
            tags,
        });

        const result = await ao.result({ process, message });
        console.log("result of run lua ", result);
        (result as any).id = message;
        return result;
    });
}

export async function getResults(process: string, cursor = "") {
    return executeWithRetry(async (ao) => {
        const r = await ao.results({
            process,
            from: cursor,
            sort: "ASC",
            limit: 999999,
        });

        if (r.edges.length > 0) {
            const newCursor = r.edges[r.edges.length - 1].cursor;
            const results = r.edges.map((e: any) => e.node);
            return { cursor: newCursor, results };
        } else {
            return { cursor, results: [] };
        }
    });
}

export async function monitor(process: string) {
    return executeWithRetry(async (ao) => {
        const r = await ao.monitor({
            process,
            signer: createDataItemSigner(window.arweaveWallet),
        });

        return r;
    });
}

export async function unmonitor(process: string) {
    return executeWithRetry(async (ao) => {
        const r = await ao.unmonitor({
            process,
            signer: createDataItemSigner(window.arweaveWallet),
        });

        return r;
    });
}

export function parseOutupt(out: any) {
    if (!out.Output) return out;
    const data = out.Output.data;
    const { json, output } = data;
    if (json != "undefined") {
        return json;
    }
    try {
        return JSON.parse(output);
    } catch (e) {
        return output;
    }
}
export const BAZAR = {
    // module: 'Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350',
    // scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
    assetSrc: "Fmtgzy1Chs-5ZuUwHpQjQrQ7H7v1fjsP0Bi8jVaDIKA",
    defaultToken: "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10",
    ucm: "U3TjJAZWJjlWBB4KAXSHKzuky81jtyh0zqH8rUL4Wd0",
    pixl: "DM3FoZUq_yebASPhgd8pEIRIzDW6muXEhxz5-JwbZwo",
    collectionsRegistry: "TFWDmf8a3_nw43GCm_CuYlYoylHAjCcFGbgHfDaGcsg",
    collectionSrc: "2ZDuM2VUCN8WHoAKOOjiH4_7Apq0ZHKnTWdLppxCdGY",
    profileRegistry: "SNy4m-DrqxWl01YqGM4sxI8qCni-58re8uuJLvZPypY",
    profileSrc: "_R2XYWDPUXVvQrQKFaQRvDTDcDwnQNbqlTd_qvCRSpQ",
};
export async function readHandler(args: {
    processId: string;
    action: string;
    tags?: Tag[];
    data?: any;
}): Promise<any> {
    return executeWithRetry(async (ao) => {
        const tags = [{ name: "Action", value: args.action }];
        if (args.tags) tags.push(...args.tags);
        let data = JSON.stringify(args.data || {});

        const response = await ao.dryrun({
            process: args.processId,
            tags: tags,
            data: data,
        });

        if (response.Messages && response.Messages.length) {
            if (response.Messages[0].Data) {
                return JSON.parse(response.Messages[0].Data);
            } else {
                if (response.Messages[0].Tags) {
                    return response.Messages[0].Tags.reduce(
                        (acc: any, item: any) => {
                            acc[item.name] = item.value;
                            return acc;
                        },
                        {},
                    );
                }
            }
        }
        return null;
    });
}

export async function setArnsName(
    antProcess: string,
    manifestId: string,
    undername = "@",
) {
    return executeWithRetry(async (ao) => {
        const msgtags = [
            { name: "Action", value: "Set-Record" },
            { name: "Sub-Domain", value: undername },
            { name: "Transaction-Id", value: manifestId },
            { name: "TTL-Seconds", value: "900" },
        ];
        try {
            const result = await ao.message({
                process: antProcess,
                tags: msgtags,
                signer: createDataItemSigner(window.arweaveWallet),
                data: "",
            });
            console.log("set arns message officially sent out ", result);
            return result;
        } catch (e) {
            console.error(e);
            return null;
        }
    });
}
export async function setArnsUnderName(
    antProcess: string,
    manifestId: string,
    undername :string ,
) {
    return executeWithRetry(async (ao) => {
        const msgtags = [
            { name: "Action", value: "Set-Record" },
            { name: "Sub-Domain", value: undername },
            { name: "Transaction-Id", value: manifestId },
            { name: "TTL-Seconds", value: "60" },
        ];
        try {
            const result = await ao.message({
                process: antProcess,
                tags: msgtags,
                signer: createDataItemSigner(window.arweaveWallet),
                data: "",
            });
            console.log("set arns message officially sent out ", result);
            return result;
        } catch (e) {
            console.error(e);
            return null;
        }
    });
}
