import { spawnReportProcess } from "@/hooks/use-report-manager";
import { AnalyticsResponse } from "@/types";
import { connect, createDataItemSigner } from "@permaweb/aoconnect";

const REGISTRY_PROCESS = "-M03tLhxzgf552RFPGiSCTOhqhvtRsk4bRsXKJ06CzE";

type GetProcessPIDResponse = {
    messageId: string;
    processId: string | null;
    error: boolean;
    errorMessage?: string;
};

type Tag = {
    name: string;
    value: string;
};

type DataItem = {
    Data: string;
    Anchor: string;
    Tags: Tag[];
    Target: string;
};

type DataArray = DataItem[];

export type RegisterProjectType = {
    Output: any;
    Messages: DataArray;
    Spawns: any[];
    Error?: any;
};

export type MessageResult = {
    Output: any;
    Messages: GetProcessIdAoResult;
    Spawns: any[];
    Error?: any;
};

type GetProcessIdAoResult = [
    {
        Data: "5YOFYO6ngzsFSBQp4bCSiECwASGg23TpGEB9bn8J0Zs";
        Anchor: "00000000000000000000000000000109";
        Tags: [
            {
                name: "Data-Protocol";
                value: string;
            },
            {
                name: "Variant";
                value: string;
            },
            {
                name: "Type";
                value: string;
            },
            {
                name: "Reference";
                value: string;
            },
            {
                name: "Action";
                value: string;
            },
            {
                name: "Message-Id";
                value: string;
            },
            {
                name: "Status";
                value: "Success";
            },
        ];
        Target: string;
    },
];

export async function getProjectPID(
    projectName: string,
    walletAddress: string,
    managerProcess: string = REGISTRY_PROCESS,
): Promise<GetProcessPIDResponse> {
    const TARGET_PROCESS = managerProcess;
    const ao = connect({
        CU_URL: "https://ur-cu.randao.net",
        MODE: "legacy",
    });

    try {
        const message = await ao.message({
            process: TARGET_PROCESS,
            tags: [
                { name: "Action", value: "GetProjectPID" },
                { name: "Projectname", value: projectName },
                {
                    name: "walletaddr",
                    value: walletAddress,
                },
            ],
            signer: createDataItemSigner(window.arweaveWallet),
        });

        const { Messages, Error } = (await ao.result({
            message: message,
            process: TARGET_PROCESS,
        })) as MessageResult;
        if (Messages && Messages.length > 0) {
            const status = Messages[0].Tags.find(
                (tag) => tag.name === "Status",
            );

            if (status?.value === "Success") {
                return {
                    messageId: message,
                    processId: Messages[0].Data,
                    error: false,
                };
            } else {
                return {
                    messageId: message,
                    processId: null,
                    error: true,
                    errorMessage: "no data was found",
                };
            }
        }

        if (Error) {
            return {
                messageId: message,
                processId: null,
                error: true,
                errorMessage: "an error occured",
            };
        }

        return {
            messageId: message,
            processId: null,
            error: true,
            errorMessage: "No response received",
        };
    } catch (error) {
        console.error("Failed to fetch project PID:", error);
        throw error;
    }
}
export async function enableAnalytics(
    projectName: string,
    walletAddress: string,
) {
    try {
        const pid = await spawnReportProcess(projectName);
        console.log("registering procject with the processId", pid);

        try {
            const registration = await registerProject(
                projectName,
                pid,
                walletAddress,
            );

            console.log("registering process has been completed");
            console.log({ registration });
            if (registration.success) {
                return pid;
            }
        } catch (registrationError) {
            console.error("Error during project registration:", registrationError);
            throw new Error(`Failed to register project: ${registrationError}`);
        }
    } catch (error) {
        console.error("Error from registering project", error);
        throw new Error(`failed to enable analytics, ${error}`);
    }
}

interface RegisterProjectReturnType {
    messageId: string | null;
    success: boolean;
    error: string | null;
}

export async function registerProject(
    projectName: string,
    processId: string,
    walletAddress: string,
): Promise<RegisterProjectReturnType> {
    const TARGET_PROCESS = REGISTRY_PROCESS;
    const ao = connect({
        CU_URL: "https://ur-cu.randao.net",
        MODE: "legacy",
    });

    try {
        // Send registration message
        const message = await ao.message({
            process: TARGET_PROCESS,
            tags: [
                { name: "Action", value: "RegisterProject" },
                { name: "Projectname", value: projectName },
                { name: "ProcessID", value: processId },
                { name: "walletaddr", value: walletAddress },
            ],
            signer: createDataItemSigner(window.arweaveWallet),
        });

        console.log("Registration message sent with ID:", message);

        const { Messages, Error }: RegisterProjectType = await ao.result({
            message: message,
            process: TARGET_PROCESS,
        });

        const statusValue = Messages[0].Tags.find(
            (tag) => tag.name === "Status",
        )?.value;

        if (Messages && Messages.length > 0 && statusValue === "Success") {
            return {
                messageId: processId,
                success: true,
                error: null,
            };
        }

        if (Error) {
            return {
                messageId: message,
                success: false,
                error: Error,
            };
        }

        return {
            messageId: message,
            success: false,
            error: "No response received",
        };
    } catch (error) {
        console.error("Failed to register project:", error);
        throw error;
    }
}

export const checkProcessId = async (
    projectName: string,
    walletAddress: string,
) => {
    console.log("checking process id...");
    const res = await getProjectPID(projectName, walletAddress);
    if (res.processId === null) {
        throw new Error("process Id is not available");
    }

    if (res.error) {
        throw new Error(res.errorMessage);
    }
    return res.processId;
};

export async function getAnalytics(
    processId: string,
): Promise<AnalyticsResponse> {
    const ao = connect({
        CU_URL: "https://ur-cu.randao.net",
        MODE: "legacy",
    });

    try {
        const message = await ao.message({
            process: processId,
            tags: [{ name: "Action", value: "GetAnalytics" }],
            signer: createDataItemSigner(window.arweaveWallet),
        });

        console.log("Analytics request sent with ID:", message);

        const { Messages, Error } = await ao.result({
            message: message,
            process: processId,
        });

        if (Messages && Messages.length > 0) {
            const analyticsData = JSON.parse(Messages[0].Data);

            if (analyticsData.success) {
                return {
                    messageId: message,
                    data: analyticsData.data,
                    error: null,
                };
            }
        }

        if (Error) {
            return {
                messageId: message,
                data: null,
                error: Error,
            };
        }

        return {
            messageId: message,
            data: null,
            error: "No data received",
        };
    } catch (error) {
        console.error("Failed to fetch analytics:", error);
        throw error;
    }
}

export async function fetchAnalytics(processId: string) {
    try {
        const analytics = await getAnalytics(processId);

        if (analytics.data) {
            return analytics.data;
        } else {
            throw new Error(analytics.error || "Failed to fetch analytics");
        }
    } catch (error) {
        console.error("Error fetching analytics:", error);
        throw error;
    }
}
