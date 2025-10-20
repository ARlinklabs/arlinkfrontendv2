import { useEffect, useRef, useState } from "react";
import { useGlobalState } from "@/store/useGlobalState";
import { useWalletState } from "./use-wallet-state";
import { runLua, spawnProcess } from "@/lib/ao-vars";
import { useSigner } from "@/lib/wallet-strategies";
import { gql, GraphQLClient } from "graphql-request";
import { GetDemploymentHistoryReturnType } from "@/types";
import { executeWithRetry } from "@/lib/ao-vars";

const setupCommands = `
    json = require "json"

    if not db then
        db = require"lsqlite3".open_memory()
    end

    db:exec[[
        CREATE TABLE IF NOT EXISTS Deployments (
            ID                  INTEGER PRIMARY KEY AUTOINCREMENT,
            Name                TEXT NOT NULL,
            RepoUrl             TEXT NOT NULL, 
            Branch              TEXT DEFAULT 'main',
            InstallCMD          TEXT DEFAULT 'npm i',
            BuildCMD            TEXT DEFAULT 'npm run build',
            OutputDIR           TEXT DEFAULT './dist',
            DeploymentId        TEXT,
            ArnsProcess         TEXT,
            DeploymentHash      TEXT,
            Logs                TEXT
        );

        CREATE TABLE IF NOT EXISTS NewDeploymentHistory (
            ID                  INTEGER PRIMARY KEY AUTOINCREMENT,
            Name                TEXT NOT NULL,
            DeploymentID        TEXT NOT NULL,
            AssignedUndername   TEXT DEFAULT NULL,
            Date                TEXT NOT NULL,
            FOREIGN KEY (Name) REFERENCES Deployments(Name)
        );

        ALTER TABLE Deployments ADD COLUMN UnderName TEXT;
    ]]

    Handlers.add(
        "ARlink.GetDeployments",
        Handlers.utils.hasMatchingTag("Action", "ARlink.GetDeployments"),
        function(msg)
            -- Initialize empty deployments table
            local deployments = {}
            
            -- Get all deployments from database
            for row in db:nrows[[SELECT * FROM Deployments]] do
                table.insert(deployments, row)
            end

            -- Send response back
            Send({
                Target = msg.From,
                Data = json.encode(deployments)
            })
        end
    )

    Handlers.add(
        "ARlink.GetDeploymentHistoryByProjectName",
        Handlers.utils.hasMatchingTag("Action", "ARlink.GetDeploymentHistoryByProjectName"),
        function(msg)
            print('Message received: ', msg)  -- Log the received message
            local projectName = msg.Tags.ProjectName  -- Get the project name from the message tags
            print("Project name received: ", projectName)  -- Log the project name
            local history = {}
            
            -- Using string concatenation with quotes instead of sqlite3.quote
            local query = string.format(
                [[SELECT * FROM NewDeploymentHistory WHERE Name = '%s']], 
                projectName:gsub("'", "''")
            )
            print("Executing query: ", query)  -- Log the query
            
            for row in db:nrows(query) do
                table.insert(history, row)
            end
            
            print("Loop ran, history retrieved: ", json.encode(history))  -- Log the retrieved history
            
            Send({
                Target = msg.From, 
                Data = json.encode(history)
            })
        end
    )
    return "OK"
`;

export const historyTable = `
db:exec[[
    CREATE TABLE IF NOT EXISTS NewDeploymentHistory (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL,
        DeploymentID TEXT NOT NULL,
        AssignedUndername TEXT DEFAULT NULL,
        Date TEXT NOT NULL,  -- Add a date column
        FOREIGN KEY (Name) REFERENCES Deployments(Name)
    )
]]
    Handlers.add(
    "ARlink.GetDeploymentHistoryByProjectName",
    Handlers.utils.hasMatchingTag("Action", "ARlink.GetDeploymentHistoryByProjectName"),
    
    function(msg)
        print('Message received: ', msg)  -- Log the received message
        local projectName = msg.Tags.ProjectName  -- Get the project name from the message tags
        print("Project name received: ", projectName)  -- Log the project name
        local history = {}
        
        -- Using string concatenation with quotes instead of sqlite3.quote
        local query = string.format([[SELECT * FROM NewDeploymentHistory WHERE Name = '%s']], projectName:gsub("'", "''"))
        print("Executing query: ", query)  -- Log the query
        
        for row in db:nrows(query) do
            table.insert(history, row)
        end
        
        print("Loop ran, history retrieved: ", json.encode(history))  -- Log the retrieved history
        
        Send({Target = msg.From, Data = json.encode(history)})
    end
)
`;

// dummy value
// deploy -> 200 value, set a dummy value

export default function useDeploymentManager() {
    const setManagerProcess = useGlobalState(state => state.setManagerProcess);
    const safeUpdateDeployments = useGlobalState(state => state.safeUpdateDeployments);
    
    const globalWalletAddress = useGlobalState(state => state.walletAddress);
    const managerProcess = useGlobalState(state => state.managerProcess);
    const deployments = useGlobalState(state => state.deployments);
    
    const { isConnected: connected, address } = useWalletState();
    
    // Use the centralized wallet state for consistency
    const walletAddress = address || globalWalletAddress;
    const { signer, isLoading: signerLoading } = useSigner();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef(0);
    const maxRetries = 3;
    const isRefreshingRef = useRef(false); // Track if refresh is already in progress

    // Handle manager process setup when wallet connects or changes
    useEffect(() => {
        console.log('🔍 Deployment Manager Effect Check:', {
            connected,
            address,
            hasAddress: !!address,
            managerProcess,
            globalWalletAddress,
            shouldSetup: connected && address && !managerProcess
        });
        
        if (connected && address && !managerProcess && signer && !signerLoading) {
            // Only proceed if the wallet is connected and we don't have a manager process yet
            console.log(`Setting up manager process for wallet: ${address}`);
            getManagerProcessFromAddress(address).then((id) => {
                if (id) {
                    console.log(`✅ Found existing manager process for ${address.slice(0, 8)}...`);
                    console.log(`📦 Manager Process ID: ${id}`);
                    setManagerProcess(id);
                } else {
                    console.log("❌ No manager process found, spawning new one");
                    //@ts-ignore
                    spawnProcess("ARlink-Manager", undefined, undefined, signer).then(async (newId) => {
                        console.log(`🆕 Spawned new manager process: ${newId}`);
                        console.log(`📦 New Manager Process ID: ${newId}`);
                        try {
                            await runLua(setupCommands, newId, undefined, signer);
                            console.log(`✅ Setup commands completed for process: ${newId}`);
                            setManagerProcess(newId);
                        } catch (error) {
                            console.error("❌ Failed to setup commands for new process:", error);
                            // Still set the process ID, as it might work on retry
                            setManagerProcess(newId);
                        }
                    }).catch((error) => {
                        console.error("❌ Failed to spawn manager process:", error);
                    });
                }
            }).catch((error) => {
                console.error("Failed to get manager process from address:", error);
            });
        }
    }, [connected, address, managerProcess, setManagerProcess, signer, signerLoading]);

    // Handle deployment fetching when manager process is ready
    useEffect(() => {
        // Reset retry count when manager process changes
        retryCountRef.current = 0;
        
        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }
        
        // Fetch deployments if we have manager process and connected wallet
        // Always refresh when manager process changes, even if we have deployments
        if (managerProcess && connected && address && signer && !signerLoading) {
            console.log(`🔄 Scheduling deployment fetch for wallet: ${address.slice(0, 8)}...`);
            console.log(`📦 Using Manager Process ID: ${managerProcess}`);
            refreshTimeoutRef.current = setTimeout(() => {
                refresh();
            }, 1000); // 1 second delay for new processes
        }
        
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [managerProcess, address, connected, signer, signerLoading]); // Remove deployments.length dependency

    async function refresh(isRetry = false) {
        // Prevent duplicate concurrent refresh calls
        if (isRefreshingRef.current) {
            console.log('Refresh already in progress, skipping duplicate call');
            return;
        }
        
        // Validate we have the right context before proceeding
        if (!managerProcess || 
            !address || 
            !connected || 
            !signer ||
            signerLoading ||
            isRefreshing) {
            console.log('Skipping refresh - invalid context');
            return;
        }
        
        // Prevent excessive retries
        if (isRetry && retryCountRef.current >= maxRetries) {
            console.warn("Max retries reached for deployment refresh");
            setIsRefreshing(false);
            isRefreshingRef.current = false;
            return;
        }

        isRefreshingRef.current = true;
        setIsRefreshing(true);
        console.log(`🔄 Refreshing deployments for wallet: ${address.slice(0, 8)}...`);
        console.log(`📦 Manager Process ID: ${managerProcess}`);

        try {
            const result = await executeWithRetry(async (ao) => {
                return await ao.dryrun({
                    process: managerProcess,
                    tags: [{ name: "Action", value: "ARlink.GetDeployments" }],
                    Owner: address,
                });
            });

            if (result.Error) {
                console.error("Deployment fetch error:", result.Error);
                setIsRefreshing(false);
                isRefreshingRef.current = false;
                return;
            }
            
            const { Messages } = result;
            
            if (!Messages || Messages.length === 0) {
                throw new Error("No messages received from process");
            }
            
            const deployments = JSON.parse(Messages[0].Data);
            
            // Always update deployments since we validated the context at the start
            console.log(`✅ Successfully fetched ${deployments.length} deployments for wallet: ${address.slice(0, 8)}...`);
            console.log(`📦 Manager Process ID: ${managerProcess}`);
            // Use safe update to preserve existing cache if new data is invalid
            // Pass the wallet address as fallback in case global state doesn't have it yet
            safeUpdateDeployments(deployments, address);
            console.log(`💾 Deployments stored successfully for wallet: ${address.slice(0, 8)}...`);
            
            retryCountRef.current = 0; // Reset retry count on success
            setIsRefreshing(false);
            isRefreshingRef.current = false;
            
        } catch (error) {
            console.warn("Refresh failed, attempting setup and retry:", error);
            retryCountRef.current++;
            
            // Check if we should retry
            if (retryCountRef.current <= maxRetries) {
                try {
                    console.log(`Attempting to setup commands for process ${managerProcess}, retry ${retryCountRef.current}/${maxRetries}`);
                    await runLua(setupCommands, managerProcess, undefined, signer);
                    
                    // Exponential backoff for retries
                    const delay = Math.min(500 * Math.pow(2, retryCountRef.current - 1), 5000);
                    
                    refreshTimeoutRef.current = setTimeout(() => {
                        refresh(true);
                    }, delay);
                    
                } catch (setupError) {
                    console.error("Setup commands failed:", setupError);
                    setIsRefreshing(false);
                    isRefreshingRef.current = false;
                }
            } else {
                console.error("Max retries exceeded for deployment refresh");
                setIsRefreshing(false);
                isRefreshingRef.current = false;
            }
        }
    }

    // Cleanup function
    useEffect(() => {
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

    return {
        managerProcess,
        deployments,
        isRefreshing,
        refresh: () => refresh(false),
        walletAddress,
    };
}
// keep it as local host if NODE_ENV is test

// Primary and fallback GraphQL endpoints
const PRIMARY_GQL_ENDPOINT = "https://arweave-search.goldsky.com/graphql";
const FALLBACK_GQL_ENDPOINT = "https://arweave-search.goldsky.com/graphql";

export async function getManagerProcessFromAddress(address: string) {
    // Initialize client with primary endpoint
    let client = new GraphQLClient(PRIMARY_GQL_ENDPOINT);
    let currentEndpoint = PRIMARY_GQL_ENDPOINT;

    const query = gql`
       query {
  transactions(
    owners: ["${address}"]
    tags: [
      { name: "App-Name", values: ["ARlink"] }
      { name: "Name", values: ["ARlink-Manager"] }
    ],
    sort: HEIGHT_DESC
    first: 100
    after: "your_last_cursor_here"
  ) {
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        id
        block { height }
      }
    }
  }
}

    `;

    type Response = {
        data?: {
            transactions: {
                edges: { node: { id: string } }[];
            };
        };
        error?: string;
    };

    async function executeQuery(endpoint: string): Promise<Response> {
        try {
            client = new GraphQLClient(endpoint);
            const data = await client.request(query);
            // Validate response structure
            //@ts-ignore
            if (!data?.transactions?.edges) {
                throw new Error("Invalid response structure from GraphQL");
            }
            return { data: data as Response['data'] };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`GraphQL query failed at ${endpoint}:`, errorMessage);
            return { error: errorMessage };
        }
    }

    // Try primary endpoint
    let response = await executeQuery(PRIMARY_GQL_ENDPOINT);

    // If primary fails, try fallback endpoint
    if (response.error) {
        console.warn(`Switching to fallback GraphQL provider: ${FALLBACK_GQL_ENDPOINT}`);
        currentEndpoint = FALLBACK_GQL_ENDPOINT;
        response = await executeQuery(FALLBACK_GQL_ENDPOINT);
    }

    // If both endpoints fail, return null
    if (response.error) {
        console.error("Both GraphQL endpoints failed. Returning null.");
        return null;
    }

    //@ts-ignore
    const edges = response.data.transactions.edges;

    // If no transactions found, return null
    if (edges.length === 0) {
        return null;
    }

    // If transactions exist and fewer than 12, run the second query
    if (edges.length > 0 && edges.length < 20) {
        const processIds = edges.map(edge => edge.node.id);

        const secondQuery = gql`
            query GetProcessTransactions($cursor: String, $processId: String!) {
                transactions(
                    sort: INGESTED_AT_DESC
                    first: 25
                    after: $cursor
                    ingested_at: { min: 1696107600 }
                    tags: [
                        { name: "From-Process", values: [$processId] }
                        { name: "Data-Protocol", values: ["ao"] }
                    ]
                ) {
                    count
                    __typename
                }
            }
        `;

        try {
            // Execute second query for each process ID concurrently
            const secondQueryPromises = processIds.map(async (processId) => {
                const result = await client.request(secondQuery, { cursor: null, processId });
                //@ts-ignore
                return { processId, count: result.transactions.count };
            });

            const secondQueryResults = await Promise.all(secondQueryPromises);
            // console.log("Second query results:", secondQueryResults);

            // Find the first process ID with count > 1
            const validProcess = secondQueryResults.find(result => result.count > 1);
            if (validProcess) {
                return validProcess.processId;
            }
        } catch (error) {
            //@ts-ignore
            console.error(`Second query failed at ${currentEndpoint}:`, error.message);
        }
    }

    // Return the first transaction ID or null
    return edges.length > 0 ? edges[0].node.id : null;
}

export async function getDeploymentHistory(
    projectName: string,
    managerProcess: string,
    signer?: any,
): Promise<GetDemploymentHistoryReturnType> {
    const TARGET_PROCESS = managerProcess;

    try {
        return await executeWithRetry(async (ao) => {
            // Send get deployment history message
            const message = await ao.message({
                process: TARGET_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "ARlink.GetDeploymentHistoryByProjectName",
                    },
                    { name: "ProjectName", value: projectName },
                ],
                signer: signer,
            });

            console.log("Message sent with ID:", message);

            // Wait for and get the response
            const { Messages, Error } = await ao.result({
                message: message,
                process: TARGET_PROCESS,
            });

            // Log the response messages
            if (Messages && Messages.length > 0) {
                // Parse the JSON data from the response
                const historyData = JSON.parse(Messages[0].Data);
                return {
                    messageId: null,
                    history: historyData,
                    error: null,
                };
            }

            if (Error) {
                console.error("Error received:", Error);
                return {
                    messageId: message,
                    history: [],
                    error: Error,
                };
            }

            return {
                messageId: message,
                history: [],
                error: null,
            };
        });
    } catch (error) {
        console.error("Failed to get deployment history:", error);
        throw error;
    }
}
