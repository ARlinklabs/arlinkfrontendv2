import { useEffect, useRef, useState } from "react";
import { useGlobalState } from "@/store/useGlobalState";
import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import { runLua, spawnProcess } from "@/lib/ao-vars";
import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { gql, GraphQLClient } from "graphql-request";
import { GetDemploymentHistoryReturnType } from "@/types";

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
    const globalState = useGlobalState();
    const { connected } = useConnection();
    const address = useActiveAddress();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef(0);
    const maxRetries = 3;
    
    //@ts-ignore
    const ao = connect({
        CU_URL: "https://cu.ardrive.io",
        MODE: "legacy",
    });

    useEffect(() => {
        if (connected && address) {
            getManagerProcessFromAddress(address).then((id) => {
                if (id) {
                    globalState.setManagerProcess(id);
                } else {
                    console.log("No manager process found, spawning new one");
                    //@ts-ignore
                    spawnProcess("ARlink-Manager").then(async (newId) => {
                        await runLua(setupCommands, newId);
                        // console.log("deployment manager id", newId);
                        globalState.setManagerProcess(newId);
                    });
                }
            });
        }
    }, [connected, address, globalState.setManagerProcess]);

    useEffect(() => {
        // Reset retry count when manager process changes
        retryCountRef.current = 0;
        
        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }
        
        // Add a small delay when process is newly set to ensure it's ready
        if (globalState.managerProcess) {
            refreshTimeoutRef.current = setTimeout(() => {
                refresh();
            }, 1000); // 1 second delay for new processes
        }
        
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [globalState.managerProcess]);

    async function refresh(isRetry = false) {
        if (!globalState.managerProcess || isRefreshing) return;
        
        // Prevent excessive retries
        if (isRetry && retryCountRef.current >= maxRetries) {
            console.warn("Max retries reached for deployment refresh");
            setIsRefreshing(false);
            return;
        }

        setIsRefreshing(true);

        try {
            // console.log("fetching deployments");
            const result = await connect({
                CU_URL: "https://cu.ardrive.io",
                MODE: "legacy",
            }).dryrun({
                process: globalState.managerProcess,
                tags: [{ name: "Action", value: "ARlink.GetDeployments" }],
                Owner: address,
            });

            if (result.Error) {
                console.error("Deployment fetch error:", result.Error);
                setIsRefreshing(false);
                return;
            }
            
            // console.log("result", result);
            const { Messages } = result;
            
            if (!Messages || Messages.length === 0) {
                throw new Error("No messages received from process");
            }
            
            const deployments = JSON.parse(Messages[0].Data);
            globalState.setDeployments(deployments);
            retryCountRef.current = 0; // Reset retry count on success
            setIsRefreshing(false);
            
        } catch (error) {
            console.warn("Refresh failed, attempting setup and retry:", error);
            retryCountRef.current++;
            
            try {
                await runLua(setupCommands, globalState.managerProcess);
                
                // Exponential backoff for retries
                const delay = Math.min(500 * Math.pow(2, retryCountRef.current - 1), 5000);
                
                refreshTimeoutRef.current = setTimeout(() => {
                    refresh(true);
                }, delay);
                
            } catch (setupError) {
                console.error("Setup commands failed:", setupError);
                setIsRefreshing(false);
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
        managerProcess: globalState.managerProcess,
        deployments: globalState.deployments,
        isRefreshing,
        refresh: () => refresh(false),
    };
}
// keep it as local host if NODE_ENV is test

export async function getManagerProcessFromAddress(address: string) {
    const client = new GraphQLClient(
        "https://arweave-search.goldsky.com/graphql",
    );

    const query = gql`
  query {
  transactions(
    owners: ["${address}"]
    tags: [
      { name: "App-Name", values: ["ARlink"] }
      { name: "Name", values: ["ARlink-Manager"] }
    ],
    sort:HEIGHT_ASC
  ) {
    edges {
      node {
        block{height}
        id
      }
    }
  }
}`;

    type response = {
        transactions: {
            edges: {
                node: {
                    id: string;
                };
            }[];
        };
    };

    const data: response = await client.request(query);
    return data.transactions.edges.length > 0
        ? data.transactions.edges[0].node.id
        : null;
}

export async function getDeploymentHistory(
    projectName: string,
    managerProcess: string,
): Promise<GetDemploymentHistoryReturnType> {
    const TARGET_PROCESS = managerProcess;
    const ao = connect({
        CU_URL: "https://cu.ardrive.io",
        MODE: "legacy",
    });

    try {
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
            signer: createDataItemSigner(window.arweaveWallet),
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
    } catch (error) {
        console.error("Failed to get deployment history:", error);
        throw error;
    }
}
