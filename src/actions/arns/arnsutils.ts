import { SpawnANTState , defaultANTLogoId , ANTVersions ,ANT_REGISTRY_ID, AOProcess} from '@ar.io/sdk';
import { useQuery } from '@tanstack/react-query';
import { connect } from "@permaweb/aoconnect";



export function createDefaultAntState(
    state: Partial<SpawnANTState>,
  ): SpawnANTState {
    return {
      ticker: 'aos',
      name: 'ANT', 
      controllers: [],
      balances: {},
      owner: '',
      description: '',
      keywords: [],
      records: {
        ['@']: {
            transactionId: "YcGjCKeW6G_RuipZBZ2h9NaEIwOVuis5ZkfvLTVMc0k",
          ttlSeconds: 60,
        },
      },
      logo: defaultANTLogoId,
      ...state,
    };
  }




export function createAntStateForOwner(owner: string) {
    return createDefaultAntState({
      owner: owner,
      controllers: [owner],
      balances: { [owner]: 1 },
      records: {
        ['@']: {
          transactionId: "YcGjCKeW6G_RuipZBZ2h9NaEIwOVuis5ZkfvLTVMc0k",
          ttlSeconds: 60,
        },
      },
    });
  }


 

  export async function getLatestANTVersion() {
    const versionRegistry = ANTVersions.init({
        process: new AOProcess({
            processId: ANT_REGISTRY_ID,
            //@ts-ignore
            ao: connect({
                MU_URL: "https://mu.ao-testnet.xyz",
                CU_URL: "https://cu.ardrive.io",
                GRAPHQL_URL: "https://arweave.net/graphql",
                GATEWAY_URL: "https://arweave.net",
            }),
        }),
    });
    return versionRegistry.getLatestANTVersion();
}

  export function useLatestANTVersion() {
 

  
    return useQuery({
      queryKey: ['ant-latest-versions'],
      queryFn: getLatestANTVersion,
      staleTime: Infinity, // these rarely change
    });
  }

  export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  export async function getTokenCost(name:string , years:number) {
    const url = 'https://cu.ardrive.io/dry-run?process-id=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE';
    
    const headers = {
      'accept': '*/*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      'dnt': '1',
      'origin': 'https://arns.app',
      'pragma': 'no-cache',
      'priority': 'u=1, i',
      'referer': 'https://arns.app/',
      'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36'
    };
  
    const body = {
      "Id": "1234",
      "Target": "agYcCFJtrMG6cqMuZfskIkFTGvUPddICmtQSBIoPdiA",
      "Owner": "1234",
      "Anchor": "0",
      "Data": "1234",
      "Tags": [
        {"name": "Action", "value": "Cost-Details"},
        {"name": "Intent", "value": "Buy-Name"},
        {"name": "Name", "value": name},
        {"name": "Years", "value": years.toString()},
        {"name": "Purchase-Type", "value": "lease"},
        {"name": "Data-Protocol", "value": "ao"},
        {"name": "Type", "value": "Message"},
        {"name": "Variant", "value": "ao.TN.1"}
      ]
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Extract token cost and convert to 6 decimal value
      const messages = data.Messages;
      if (messages && messages.length > 0) {
        const messageData = JSON.parse(messages[0].Data);
        const tokenCost = messageData.tokenCost;
        const tokenCost6Decimals = tokenCost / 1e6; // Convert to 6 decimal places
        
        return {
          rawTokenCost: tokenCost,
          tokenCost6Decimals: tokenCost6Decimals
        };
      } else {
        throw new Error("No messages found in response");
      }
    } catch (error) {
      console.error("Error fetching token cost:", error);
      throw error;
    }
  }

  export async function getIncreaseLeaseCost(name:string, years:number, ownerAddress:string) {
    const url = 'https://cu.ardrive.io/dry-run?process-id=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE';
    
    const headers = {
      'accept': '*/*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      'dnt': '1',
      'origin': 'https://arns.app',
      'pragma': 'no-cache',
      'priority': 'u=1, i',
      'referer': 'https://arns.app/',
      'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36'
    };
  
    const body = {
      "Id": "1234",
      "Target": "qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE",
      "Owner": ownerAddress,
      "Anchor": "0",
      "Data": "1234",
      "Tags": [
        {"name": "Action", "value": "Cost-Details"},
        {"name": "Intent", "value": "Extend-Lease"},
        {"name": "Name", "value": name},
        {"name": "Years", "value": String(years)},
        {"name": "Purchase-Type", "value": "lease"},
        {"name": "Fund-From", "value": "any"},
        {"name": "Data-Protocol", "value": "ao"},
        {"name": "Type", "value": "Message"},
        {"name": "Variant", "value": "ao.TN.1"}
      ]
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Extract token cost from the nested structure
      if (data.Messages && data.Messages.length > 0) {
        const firstMessage = data.Messages[0];
        if (firstMessage.Data) {
          const messageData = JSON.parse(firstMessage.Data);
          if (messageData.tokenCost !== undefined) {
            const tokenCost = messageData.tokenCost;
            const tokenCost6Decimals = (tokenCost / 1e6).toFixed(6);
            
            return {
              rawTokenCost: tokenCost,
              tokenCost6Decimals: tokenCost6Decimals,
              fundingInfo: {
                shortfall: messageData.fundingPlan?.shortfall,
                balance: messageData.fundingPlan?.balance
              }
            };
          }
        }
      }
      throw new Error("Token cost not found in response");
    } catch (error) {
      console.error("Error fetching lease increase cost:", error);
      throw error;
    }
  }