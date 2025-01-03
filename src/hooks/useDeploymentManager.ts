import { useEffect } from "react";
import { useGlobalState } from "@/store/useGlobalState";
import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import { runLua, spawnProcess } from "@/lib/ao-vars";
import { connect } from "@permaweb/aoconnect";
import { gql, GraphQLClient } from "graphql-request";

const setupCommands = `json = require "json"

if not db then
    db = require"lsqlite3".open_memory()
end

db:exec[[
    CREATE TABLE IF NOT EXISTS Deployments (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL,
        RepoUrl TEXT NOT NULL,
        Branch TEXT DEFAULT 'main',
        InstallCMD TEXT DEFAULT 'npm i',
        BuildCMD TEXT DEFAULT 'npm run build',
        OutputDIR TEXT DEFAULT './dist',
        ArnsProcess TEXT,
        DeploymentId TEXT,
        DeploymentHash TEXT,
        Logs TEXT
    )
]]

Handlers.add(
    "ARlink.GetDeployments",
    Handlers.utils.hasMatchingTag("Action","ARlink.GetDeployments"),
    function(msg)
        local deployments = {}
        for row in db:nrows[[SELECT * FROM Deployments]] do
            table.insert(deployments, row)
        end
        Send({Target=msg.From, Data=json.encode(deployments)})
    end
)
    
return "OK"
`;

// dummy value
// deploy -> 200 value, set a dummy value

export default function useDeploymentManager() {
    const globalState = useGlobalState();
    const { connected } = useConnection();
    const address = useActiveAddress();
    //@ts-ignore
    const ao = connect();

    useEffect(() => {
        if (connected && address) {
            getManagerProcessFromAddress(address).then((id) => {
                if (id) {
                    // console.log("deployment manager id", id);
                    globalState.setManagerProcess(id);
                } else {
                    // console.log("No manager process found, spawning new one");
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
        refresh();
    }, [globalState.managerProcess]);

    async function refresh() {
        if (!globalState.managerProcess) return;

        // console.log("fetching deployments");
        const result = await connect().dryrun({
            process: globalState.managerProcess,
            tags: [{ name: "Action", value: "ARlink.GetDeployments" }],
            Owner: address,
        });

        try {
            if (result.Error) return alert(result.Error);
            // console.log("result", result);
            const { Messages } = result;
            const deployments = JSON.parse(Messages[0].Data);
            console.log("deployments", deployments);
            globalState.setDeployments(deployments);
        } catch {
            await runLua(setupCommands, globalState.managerProcess);
            await refresh();
        }
    }

    return {
        managerProcess: globalState.managerProcess,
        deployments: globalState.deployments,
        refresh,
    };
}
// keep it as local host if NODE_ENV is test

export async function getManagerProcessFromAddress(address: string) {
    const client = new GraphQLClient(
        "https://arweave-search.goldsky.com/graphql"
    );

    const query = gql`
  query {
  transactions(
    owners: ["${address}"]
    tags: [
      { name: "App-Name", values: ["ARlink"] }
      { name: "Name", values: ["ARlink-Manager"] }
    ]
  ) {
    edges {
      node {
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
