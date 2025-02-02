import { connect, spawn } from "@permaweb/aoconnect";
import { useActiveStrategy , useConnection } from "@project-kardeshev/ao-wallet-kit";
export const AppVersion = "1.0.0";
export const AOModule = "u1Ju_X8jiuq4rX9Nh-ZGRQuYQZgV2MKLMT3CZsykk54"; // sqlite
export const AOScheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";

const CommonTags = [
    { name: "App-Name", value: "ARlink" },
    { name: "App-Version", value: AppVersion },
];

export type Tag = { name: string; value: string };

export async function spawnProcess(
    strategy: any,
    name?: string,
    tags?: Tag[],
    newProcessModule?: string,
) {
    const ao = connect();
    const signerr = await strategy?.createDataItemSigner();
    
    if (!signerr) {
        throw new Error("No signer available");
    }

    if (tags) {
        tags = [...CommonTags, ...tags];
    } else {
        tags = CommonTags;
    }
    tags = name ? [...tags, { name: "Name", value: name }] : tags;

    const result = await spawn({
        module: newProcessModule ? newProcessModule : AOModule,
        scheduler: AOScheduler,
        tags,
        signer: signerr,
    });

    return result;
}

export async function runLua(code: string, process: string,strategy: any, tags?: Tag[]) {
    const ao = connect();
    const signerr = await strategy?.createDataItemSigner();
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
        signer: signerr,
        tags,
    });

    const result = await ao.result({ process, message });
    console.log("result of run lua ", result);
    (result as any).id = message;
    return result;
}

export async function getResults(process: string, cursor = "") {
    const ao = connect();

    const r = await ao.results({
        process,
        from: cursor,
        sort: "ASC",
        limit: 999999,
    });

    if (r.edges.length > 0) {
        const newCursor = r.edges[r.edges.length - 1].cursor;
        const results = r.edges.map((e) => e.node);
        return { cursor: newCursor, results };
    } else {
        return { cursor, results: [] };
    }
}

export async function monitor(process: string) {
    const ao = connect();

    const r = await ao.monitor({
        process,
        signer: createDataItemSigner(window.arweaveWallet),
    });

    return r;
}

export async function unmonitor(process: string) {
    const ao = connect();

    const r = await ao.unmonitor({
        process,
        signer: createDataItemSigner(window.arweaveWallet),
    });

    return r;
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

export async function readHandler(args: {
    processId: string;
    action: string;
    tags?: Tag[];
    data?: any;
}): Promise<any> {
    const ao = connect();
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
}

export async function setArnsName(
    antProcess: string,
    manifestId: string,
    undername = "@",
) {
    const ao = connect();
    const msgtags = [
        { name: "Action", value: "Set-Record" },
        { name: "Sub-Domain", value: undername },
        { name: "Transaction-Id", value: manifestId },
        { name: "TTL-Seconds", value: "3600" },
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
}