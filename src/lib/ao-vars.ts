import { connect, createDataItemSigner } from "@permaweb/aoconnect";

export const AppVersion = "1.0.0";
export const AOModule = "u1Ju_X8jiuq4rX9Nh-ZGRQuYQZgV2MKLMT3CZsykk54"; // sqlite
export const AOScheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";

/**
 * Prepares a signer for use with AO operations
 * - If signer is a function (WAuth/MetaMask AO signer), use it directly
 * - If signer is an object (window.arweaveWallet), wrap with createDataItemSigner
 * - Returns undefined for invalid/null signers (will skip signer in AO operations)
 */
export function prepareAoSigner(signer: any): any {
    console.log('[prepareAoSigner] Input:', {
        signer,
        type: typeof signer,
        isNull: signer === null,
        isUndefined: signer === undefined,
        isFunction: typeof signer === 'function',
        isObject: typeof signer === 'object'
    });
    
    // Return undefined for null, undefined, or invalid signers
    if (!signer) {
        console.log('[prepareAoSigner] Signer is null/undefined, returning undefined');
        return undefined;
    }
    
    // If it's already a function (AO signer from WAuth or MetaMask), use it directly
    if (typeof signer === 'function') {
        console.log('[prepareAoSigner] Signer is a function (WAuth/MetaMask), using directly');
        return signer;
    }
    
    // If it's an object (window.arweaveWallet), wrap it with createDataItemSigner
    // Verify it's a valid object with necessary methods before wrapping
    if (typeof signer === 'object' && signer !== null) {
        try {
            console.log('[prepareAoSigner] Signer is an object (Arweave wallet), wrapping with createDataItemSigner');
            const wrapped = createDataItemSigner(signer);
            console.log('[prepareAoSigner] Successfully wrapped signer');
            return wrapped;
        } catch (error) {
            console.error('[prepareAoSigner] Failed to create data item signer:', error);
            return undefined;
        }
    }
    
    // For any other unexpected types, return undefined
    console.warn('[prepareAoSigner] Invalid signer type:', typeof signer);
    return undefined;
}

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
    signer?: any,
) {
    console.log('[spawnProcess] Called with:', {
        name,
        hasTags: !!tags,
        newProcessModule,
        signer,
        signerType: typeof signer,
        signerIsNull: signer === null,
        signerIsUndefined: signer === undefined
    });
    
    return executeWithRetry(async (ao) => {
        if (tags) {
            tags = [...CommonTags, ...tags];
        } else {
            tags = CommonTags;
        }
        tags = name ? [...tags, { name: "Name", value: name }] : tags;

        // Create spawn options object, only include signer if it's defined
        const spawnOptions: any = {
            module: newProcessModule ? newProcessModule : AOModule,
            scheduler: AOScheduler,
            tags,
        };

        // Only add signer if it's defined and not null
        if (signer) {
            const preparedSigner = prepareAoSigner(signer);
            console.log('[spawnProcess] Prepared signer:', {
                original: signer,
                prepared: preparedSigner,
                preparedType: typeof preparedSigner,
                willAddToOptions: !!preparedSigner
            });
            
            if (preparedSigner) {
                spawnOptions.signer = preparedSigner;
            } else {
                // If signer was provided but couldn't be prepared, throw error
                throw new Error('Failed to prepare signer for AO operation. Please ensure your wallet is connected properly.');
            }
        } else {
            // Signer is required for spawn operations
            console.error('[spawnProcess] No signer provided for spawn operation');
            throw new Error('Wallet signer is required to spawn a process. Please connect your wallet and try again.');
        }

        console.log('[spawnProcess] Spawn options:', {
            hasModule: !!spawnOptions.module,
            hasScheduler: !!spawnOptions.scheduler,
            hasSigner: !!spawnOptions.signer,
            signerType: typeof spawnOptions.signer
        });

        const result = await ao.spawn(spawnOptions);
        return result;
    });
}

export async function runLua(code: string, process: string, tags?: Tag[], signer?: any) {
    console.log('[runLua] Called with:', {
        process,
        hasTags: !!tags,
        hasCode: !!code,
        signer,
        signerType: typeof signer,
        signerIsNull: signer === null,
        signerIsUndefined: signer === undefined
    });
    
    return executeWithRetry(async (ao) => {
        if (tags) {
            tags = [...CommonTags, ...tags];
        } else {
            tags = CommonTags;
        }

        tags = [...tags, { name: "Action", value: "Eval" }];

        // Create message options object, only include signer if it's defined
        const messageOptions: any = {
            process,
            data: code,
            tags,
        };

        // Only add signer if it's defined and prepareAoSigner returns a valid signer
        if (signer) {
            const preparedSigner = prepareAoSigner(signer);
            console.log('[runLua] Prepared signer:', {
                original: signer,
                prepared: preparedSigner,
                preparedType: typeof preparedSigner,
                willAddToOptions: !!preparedSigner
            });
            
            if (preparedSigner) {
                messageOptions.signer = preparedSigner;
            } else {
                // If signer was provided but couldn't be prepared, throw error
                throw new Error('Failed to prepare signer for AO operation. Please ensure your wallet is connected properly.');
            }
        } else {
            // Signer is required for write operations (message)
            console.error('[runLua] No signer provided for write operation');
            throw new Error('Wallet signer is required for this operation. Please connect your wallet and try again.');
        }

        console.log('[runLua] Message options:', {
            hasProcess: !!messageOptions.process,
            hasSigner: !!messageOptions.signer,
            signerType: typeof messageOptions.signer
        });

        const message = await ao.message(messageOptions);

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

export async function monitor(process: string, signer?: any) {
    return executeWithRetry(async (ao) => {
        // Create monitor options object, only include signer if it's defined
        const monitorOptions: any = {
            process,
        };

        // Only add signer if it's defined and prepareAoSigner returns a valid signer
        if (signer) {
            const preparedSigner = prepareAoSigner(signer);
            if (preparedSigner) {
                monitorOptions.signer = preparedSigner;
            }
        }

        const r = await ao.monitor(monitorOptions);

        return r;
    });
}

export async function unmonitor(process: string, signer?: any) {
    return executeWithRetry(async (ao) => {
        // Create unmonitor options object, only include signer if it's defined
        const unmonitorOptions: any = {
            process,
        };

        // Only add signer if it's defined and prepareAoSigner returns a valid signer
        if (signer) {
            const preparedSigner = prepareAoSigner(signer);
            if (preparedSigner) {
                unmonitorOptions.signer = preparedSigner;
            }
        }

        const r = await ao.unmonitor(unmonitorOptions);

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
    signer?: any,
) {
    return executeWithRetry(async (ao) => {
        const msgtags = [
            { name: "Action", value: "Set-Record" },
            { name: "Sub-Domain", value: undername },
            { name: "Transaction-Id", value: manifestId },
            { name: "TTL-Seconds", value: "900" },
        ];
        try {
            // Create message options object, only include signer if it's defined
            const messageOptions: any = {
                process: antProcess,
                tags: msgtags,
                data: "",
            };

            // Only add signer if it's defined and prepareAoSigner returns a valid signer
            if (signer) {
                const preparedSigner = prepareAoSigner(signer);
                if (preparedSigner) {
                    messageOptions.signer = preparedSigner;
                } else {
                    throw new Error('Failed to prepare signer for setArnsName operation. Please ensure your wallet is connected properly.');
                }
            } else {
                // Signer is required for setting ArNS
                console.error('[setArnsName] No signer provided');
                throw new Error('Wallet signer is required to set ArNS name. Please connect your wallet and try again.');
            }

            const result = await ao.message(messageOptions);
            console.log("set arns message officially sent out ", result);
            return result;
        } catch (e) {
            console.error(e);
            throw e; // Re-throw instead of returning null so the error propagates
        }
    });
}
export async function setArnsUnderName(
    antProcess: string,
    manifestId: string,
    undername: string,
    signer?: any,
) {
    return executeWithRetry(async (ao) => {
        const msgtags = [
            { name: "Action", value: "Set-Record" },
            { name: "Sub-Domain", value: undername },
            { name: "Transaction-Id", value: manifestId },
            { name: "TTL-Seconds", value: "60" },
        ];
        try {
            // Create message options object, only include signer if it's defined
            const messageOptions: any = {
                process: antProcess,
                tags: msgtags,
                data: "",
            };

            // Only add signer if it's defined and prepareAoSigner returns a valid signer
            if (signer) {
                const preparedSigner = prepareAoSigner(signer);
                if (preparedSigner) {
                    messageOptions.signer = preparedSigner;
                } else {
                    throw new Error('Failed to prepare signer for setArnsUnderName operation. Please ensure your wallet is connected properly.');
                }
            } else {
                // Signer is required for setting ArNS undername
                console.error('[setArnsUnderName] No signer provided');
                throw new Error('Wallet signer is required to set ArNS undername. Please connect your wallet and try again.');
            }

            const result = await ao.message(messageOptions);
            console.log("set arns message officially sent out ", result);
            return result;
        } catch (e) {
            console.error(e);
            throw e; // Re-throw instead of returning null so the error propagates
        }
    });
}
