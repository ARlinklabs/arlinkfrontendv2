import { useEffect, useRef, useState } from "react";
import { useGlobalState } from "@/store/useGlobalState";
import { useWalletState } from "./use-wallet-state";
import { runLua, spawnProcess, prepareAoSigner } from "@/lib/ao-vars";
import { useAoSigner } from "ao-wallet-kit";
import { gql, GraphQLClient } from "graphql-request";
import { GetDemploymentHistoryReturnType, DeploymentRecord } from "@/types";
import { executeWithRetry } from "@/lib/ao-vars";
import { getCachedProcess, getCachedProcessData, cacheProcess, clearCachedProcess, clearAllCachedProcesses, getAllCachedProcesses } from "@/lib/process-cache";

// Debug logging - enable by setting localStorage.WALLET_DEBUG = 'true'
const DEBUG = import.meta.env.DEV && localStorage.getItem('WALLET_DEBUG') === 'true';
const log = (...args: any[]) => DEBUG && console.log('[DeploymentManager]', ...args);

// Expose cache utilities globally for debugging in development mode
if (import.meta.env.DEV) {
    (window as any).ARlinkDebug = {
        clearProcessCache: clearAllCachedProcesses,
        viewProcessCache: getAllCachedProcesses,
        viewSpecificCache: getCachedProcessData,
        clearSpecificCache: clearCachedProcess,
        enableDebug: () => localStorage.setItem('WALLET_DEBUG', 'true'),
        disableDebug: () => localStorage.removeItem('WALLET_DEBUG'),
    };
}

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
    const { signer, isLoading: signerLoading } = useAoSigner();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false); // Track if we've completed initial fetch
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef(0);
    const maxRetries = 3;
    const isRefreshingRef = useRef(false); // Track if refresh is already in progress

    // Handle manager process setup when wallet connects or changes
    useEffect(() => {
        log('Effect Check:', {
            connected,
            address,
            hasAddress: !!address,
            managerProcess,
            globalWalletAddress,
            shouldSetup: connected && address && !managerProcess
        });
        
        if (connected && address && !managerProcess && signer && !signerLoading) {
            // Only proceed if the wallet is connected and we don't have a manager process yet
            log(`Setting up manager process for wallet: ${address}`);
            
            // Check cache first before querying GraphQL
            const cachedProcessId = getCachedProcess(address);
            if (cachedProcessId) {
                log(`✅ Found cached manager process for ${address.slice(0, 8)}...`);
                log(`📦 Cached Manager Process ID: ${cachedProcessId}`);
                setManagerProcess(cachedProcessId);
                return;
            }
            
            log(`🔍 No cache found, querying GraphQL for manager process...`);
            getManagerProcessFromAddress(address).then((id) => {
                if (id) {
                    log(`✅ Found existing manager process for ${address.slice(0, 8)}...`);
                    log(`📦 Manager Process ID: ${id}`);
                    // Note: We cache this after validation in getManagerProcessFromAddress
                    setManagerProcess(id);
                } else {
                    log("❌ No manager process found, spawning new one");
                    //@ts-ignore
                    spawnProcess("ARlink-Manager", undefined, undefined, signer).then(async (newId) => {
                        log(`🆕 Spawned new manager process: ${newId}`);
                        log(`📦 New Manager Process ID: ${newId}`);
                        try {
                            await runLua(setupCommands, newId, undefined, signer);
                            log(`✅ Setup commands completed for process: ${newId}`);
                            // Cache the new process (unvalidated initially)
                            cacheProcess(address, newId, false);
                            setManagerProcess(newId);
                        } catch (error) {
                            console.error("❌ Failed to setup commands for new process:", error);
                            // Still set the process ID and cache it, as it might work on retry
                            cacheProcess(address, newId, false);
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
        // Reset retry count and fetch status when manager process changes
        retryCountRef.current = 0;
        setHasFetchedOnce(false); // Reset on manager process change
        
        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }
        
        // Fetch deployments if we have manager process and connected wallet
        // Always refresh when manager process changes, even if we have deployments
        if (managerProcess && connected && address && signer && !signerLoading) {
            log(`🔄 Scheduling deployment fetch for wallet: ${address.slice(0, 8)}...`);
            log(`📦 Using Manager Process ID: ${managerProcess}`);
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
        log(`🔄 Refreshing deployments for wallet: ${address.slice(0, 8)}...`);
        log(`📦 Manager Process ID: ${managerProcess}`);

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
            log(`✅ Successfully fetched ${deployments.length} deployments for wallet: ${address.slice(0, 8)}...`);
            log(`📦 Manager Process ID: ${managerProcess}`);
            // Use safe update to preserve existing cache if new data is invalid
            // Pass the wallet address as fallback in case global state doesn't have it yet
            safeUpdateDeployments(deployments, address);
            log(`💾 Deployments stored successfully for wallet: ${address.slice(0, 8)}...`);
            
            // If we successfully fetched deployments, cache the process as validated
            // This is important: we only cache after confirming the process has deployments
            if (deployments.length > 0) {
                cacheProcess(address, managerProcess, true);
                log(`💾 Manager process cached as validated for wallet: ${address.slice(0, 8)}...`);
            }
            
            // Mark that we've completed at least one successful fetch
            setHasFetchedOnce(true);
            
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
        hasFetchedOnce, // Indicates whether initial fetch has completed
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
        console.log(`[ProcessCache] No manager processes found via GraphQL for ${address.slice(0, 8)}...`);
        return null;
    }

    // If transactions exist and fewer than 20, run the second query to find the correct one
    // This is the technical debt fix mentioned by the user - it helps find the process with actual deployments
    if (edges.length > 0 && edges.length < 20) {
        const processIds = edges.map(edge => edge.node.id);
        console.log(`[ProcessCache] Found ${processIds.length} potential manager processes, validating which has deployments...`);

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
            console.log(`[ProcessCache] Validation results:`, secondQueryResults.map(r => `${r.processId}: ${r.count} txns`));

            // Find the first process ID with count > 1 (has actual activity/deployments)
            const validProcess = secondQueryResults.find(result => result.count > 1);
            if (validProcess) {
                console.log(`[ProcessCache] ✅ Found validated process with deployments: ${validProcess.processId}`);
                // Cache this process as validated since we confirmed it has deployments
                cacheProcess(address, validProcess.processId, true);
                return validProcess.processId;
            } else {
                console.log(`[ProcessCache] ⚠️ No processes with deployments found, using first process`);
            }
        } catch (error) {
            //@ts-ignore
            console.error(`Second query failed at ${currentEndpoint}:`, error.message);
        }
    }

    // Return the first transaction ID or null
    const firstProcessId = edges.length > 0 ? edges[0].node.id : null;
    if (firstProcessId) {
        // Cache this process but mark as unvalidated since we didn't verify it has deployments
        cacheProcess(address, firstProcessId, false);
        console.log(`[ProcessCache] Caching first process (unvalidated): ${firstProcessId}`);
    }
    return firstProcessId;
}

export async function getDeploymentHistory(
    projectName: string,
    managerProcess: string,
    signer?: any,
): Promise<GetDemploymentHistoryReturnType> {
    const TARGET_PROCESS = managerProcess;

    // Validate and prepare signer before entering the retry loop
    if (!signer) {
        throw new Error('Wallet signer is required to fetch deployment history. Please connect your wallet and try again.');
    }
    
    const preparedSigner = prepareAoSigner(signer);
    if (!preparedSigner) {
        throw new Error('Failed to prepare signer for deployment history. Please ensure your wallet is connected properly.');
    }

    try {
        return await executeWithRetry(async (ao) => {
            // Prepare message options
            const messageOptions: any = {
                process: TARGET_PROCESS,
                tags: [
                    {
                        name: "Action",
                        value: "ARlink.GetDeploymentHistoryByProjectName",
                    },
                    { name: "ProjectName", value: projectName },
                ],
                signer: preparedSigner,
            };

            // Send get deployment history message
            const message = await ao.message(messageOptions);

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

export async function getDeploymentHistoryFromGraphQL(
    undername: string,
    projectName: string,
): Promise<GetDemploymentHistoryReturnType> {
    if (!undername) {
        return {
            messageId: null,
            history: [],
            error: new Error('Undername is required for GraphQL history fetch'),
        };
    }

    let client = new GraphQLClient(PRIMARY_GQL_ENDPOINT);
    
    // Escape strings to prevent GraphQL injection
    const escapedUndername = undername.replace(/"/g, '\\"');
    
    // Query by tags only - Set-Record transactions for this undername
    // Note: We query without owners filter because transactions can come from any wallet
    // that has permission to set records for this undername
    const queryString = `
        query {
            transactions(
                tags: [
                    { name: "Data-Protocol", values: ["ao"] }
                    { name: "Action", values: ["Set-Record"] }
                    { name: "Sub-Domain", values: ["${escapedUndername}"] }
                ]
                sort: INGESTED_AT_DESC
                first: 100
            ) {
                edges {
                    node {
                        id
                        owner {
                            address
                        }
                        ingested_at
                        block {
                            timestamp
                            height
                        }
                        tags {
                            name
                            value
                        }
                    }
                }
                count
            }
        }
    `;

    console.log('[GraphQL History] Querying for undername:', undername);

    // GraphQL response type - response may be wrapped in data or unwrapped
    type GraphQLResponse = {
        data?: {
            transactions: {
                edges: Array<{
                    node: {
                        id: string;
                        owner?: {
                            address: string;
                        };
                        ingested_at: number;
                        block: {
                            timestamp: number;
                            height: number;
                        };
                        tags: Array<{
                            name: string;
                            value: string;
                        }>;
                    };
                }>;
                count: string | number;
            };
        };
        transactions?: {
            edges: Array<{
                node: {
                    id: string;
                    owner?: {
                        address: string;
                    };
                        ingested_at: number;
                    block: {
                        timestamp: number;
                        height: number;
                    };
                    tags: Array<{
                        name: string;
                        value: string;
                    }>;
                };
            }>;
            count: string | number;
        };
    };

    try {
        console.log('[GraphQL History] Executing query...');
        const rawResponse = await client.request(queryString);
        
        // Log the raw response to debug structure
        console.log('[GraphQL History] Raw response:', JSON.stringify(rawResponse, null, 2).substring(0, 500));
        
        // Handle both wrapped (data.transactions) and unwrapped (transactions) response structures
        // graphql-request may or may not unwrap the data field depending on the endpoint
        const response = rawResponse as GraphQLResponse;
        const transactions = response.data?.transactions || response.transactions;

        if (!transactions) {
            console.error('[GraphQL History] No transactions found in response:', response);
            return {
                messageId: null,
                history: [],
                error: new Error('Invalid response structure from GraphQL'),
            };
        }

        const count = transactions.count ? (typeof transactions.count === 'string' ? parseInt(transactions.count) : transactions.count) : 0;
        const edges = transactions.edges || [];

        console.log('[GraphQL History] Response count:', count);
        console.log('[GraphQL History] Edges found:', edges.length);
        console.log('[GraphQL History] Response structure check:', { 
            hasData: !!response.data, 
            hasTransactions: !!response.transactions,
            hasDataTransactions: !!response.data?.transactions 
        });

        if (!edges || edges.length === 0) {
            console.warn('[GraphQL History] No transactions found for undername:', undername);
            return {
                messageId: null,
                history: [],
                error: null,
            };
        }

        // Extract Transaction-Id from tags and map to DeploymentRecord format
        // Results are already sorted by INGESTED_AT_DESC (newest first)
        const history: DeploymentRecord[] = [];
        
        console.log('[GraphQL History] Starting to process', edges.length, 'edges...');
        
        edges.forEach((edge, index) => {
            console.log(`[GraphQL History] Processing edge ${index + 1}/${edges.length}:`, {
                nodeId: edge.node.id,
                tagsCount: edge.node.tags.length,
                hasBlock: !!edge.node.block,
                timestamp: edge.node.block?.timestamp,
                ingestedAt: edge.node.ingested_at,
            });
            
            const transactionIdTag = edge.node.tags.find(
                (tag) => tag.name === "Transaction-Id"
            );
            const assignedUndernameTag = edge.node.tags.find(
                (tag) => tag.name === "Sub-Domain"
            );

            if (!transactionIdTag) {
                console.warn(`[GraphQL History] Edge ${index + 1}: Skipping transaction without Transaction-Id tag:`, edge.node.id);
                console.warn(`[GraphQL History] Available tags:`, edge.node.tags.map(t => t.name).join(', '));
                return; // Skip entries without Transaction-Id
            }

            // Format date from timestamp using the user's format
            // Use block.timestamp if available, otherwise fall back to ingested_at (in seconds)
            // ingested_at is in seconds, block.timestamp is also in seconds
            let timestamp: number;
            if (edge.node.block?.timestamp) {
                timestamp = edge.node.block.timestamp * 1000; // Convert seconds to milliseconds
            } else if (edge.node.ingested_at) {
                timestamp = edge.node.ingested_at * 1000; // Convert seconds to milliseconds
            } else {
                // Fallback to current time if neither is available (shouldn't happen)
                console.warn(`[GraphQL History] Edge ${index + 1}: No timestamp available, using current time`);
                timestamp = Date.now();
            }
            
            const dateObj = new Date(timestamp);
            const dateStr = dateObj.toISOString().split("T")[0]; // Date: YYYY-MM-DD
            const timeStr = dateObj.toISOString().split("T")[1].split("Z")[0]; // Time: HH:MM:SS
            const formattedDate = `${dateStr} ${timeStr}`;

            const historyRecord = {
                ID: index + 1, // Sequential ID starting from 1 (newest = 1)
                Name: projectName,
                DeploymentID: transactionIdTag.value,
                Date: formattedDate,
                AssignedUndername: assignedUndernameTag?.value || undername,
            };

            console.log(`[GraphQL History] Edge ${index + 1}: Adding history record:`, {
                ID: historyRecord.ID,
                DeploymentID: historyRecord.DeploymentID,
                Date: historyRecord.Date,
            });

            history.push(historyRecord);
        });

        console.log('[GraphQL History] Final result:', {
            totalEdges: edges.length,
            processedRecords: history.length,
            skipped: edges.length - history.length,
            historyRecords: history.map(h => ({ ID: h.ID, DeploymentID: h.DeploymentID, Date: h.Date })),
        });

        return {
            messageId: null,
            history,
            error: null,
        };
    } catch (error) {
        console.error("[GraphQL History] Failed to get deployment history from GraphQL:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("[GraphQL History] Error details:", error);
        return {
            messageId: null,
            history: [],
            error: new Error(`GraphQL query failed: ${errorMessage}`),
        };
    }
}
