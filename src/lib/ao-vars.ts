// AO on-chain infrastructure has been replaced by backend API calls.
// This file is kept for backward compatibility with imports that haven't been migrated yet.
// Functions are stubbed to throw clear errors if accidentally called.

export const AppVersion = "1.0.0";
export const AOModule = "u1Ju_X8jiuq4rX9Nh-ZGRQuYQZgV2MKLMT3CZsykk54";
export const AOScheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";
export const CU_URL = "https://cu.ardrive.io";

export type Tag = { name: string; value: string };

export function prepareAoSigner(signer: any): any {
    if (!signer) return undefined;
    if (typeof signer === "function") return signer;
    return undefined;
}

export async function spawnProcess(
    name?: string,
    tags?: Tag[],
    newProcessModule?: string,
    signer?: any,
): Promise<string> {
    throw new Error("spawnProcess is no longer available — use backend API instead");
}

export async function runLua(
    code: string,
    process: string,
    tags?: Tag[],
    signer?: any,
): Promise<any> {
    throw new Error("runLua is no longer available — use backend API instead");
}

export async function readHandler(args: {
    processId: string;
    action: string;
    tags?: Tag[];
    data?: any;
}): Promise<any> {
    throw new Error("readHandler is no longer available — use backend API instead");
}

export async function getResults(process: string, cursor?: string) {
    throw new Error("getResults is no longer available — use backend API instead");
}

export async function monitor(process: string, signer?: any) {
    throw new Error("monitor is no longer available — use backend API instead");
}

export async function unmonitor(process: string, signer?: any) {
    throw new Error("unmonitor is no longer available — use backend API instead");
}

export function createAoConnection() {
    throw new Error("createAoConnection is no longer available — use backend API instead");
}

export async function executeWithRetry<T>(
    operation: (ao: any) => Promise<T>,
    maxRetries?: number,
): Promise<T> {
    throw new Error("executeWithRetry is no longer available — use backend API instead");
}

export function parseOutupt(out: any) {
    if (!out?.Output) return out;
    const data = out.Output.data;
    const { json, output } = data;
    if (json != "undefined") return json;
    try {
        return JSON.parse(output);
    } catch (e) {
        return output;
    }
}

export const BAZAR = {
    assetSrc: "Fmtgzy1Chs-5ZuUwHpQjQrQ7H7v1fjsP0Bi8jVaDIKA",
    defaultToken: "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10",
    ucm: "U3TjJAZWJjlWBB4KAXSHKzuky81jtyh0zqH8rUL4Wd0",
    pixl: "DM3FoZUq_yebASPhgd8pEIRIzDW6muXEhxz5-JwbZwo",
    collectionsRegistry: "TFWDmf8a3_nw43GCm_CuYlYoylHAjCcFGbgHfDaGcsg",
    collectionSrc: "2ZDuM2VUCN8WHoAKOOjiH4_7Apq0ZHKnTWdLppxCdGY",
    profileRegistry: "SNy4m-DrqxWl01YqGM4sxI8qCni-58re8uuJLvZPypY",
    profileSrc: "_R2XYWDPUXVvQrQKFaQRvDTDcDwnQNbqlTd_qvCRSpQ",
};

export async function setArnsName(
    antProcess: string,
    manifestId: string,
    undername?: string,
    signer?: any,
) {
    throw new Error("setArnsName is no longer available — ArNS is now handled by the backend");
}

export async function setArnsUnderName(
    antProcess: string,
    manifestId: string,
    undername: string,
    signer?: any,
) {
    throw new Error("setArnsUnderName is no longer available — ArNS is now handled by the backend");
}
