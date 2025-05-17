
export async function getWalletOwnedNames(walletAddress: string): Promise<{ name: string; processId: string }[]> {
    const registryUrl = 'https://cu.ardrive.io/dry-run?process-id=i_le_yKKPVstLTDSmkHRqf-wYphMnwB9OhleiTgMkWc';
    const namesUrl = 'https://cu.ardrive.io/dry-run?process-id=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE';
    
    const headers = {
        'accept': '*/*',
        'content-type': 'application/json',
        'origin': 'https://arns.app',
        'referer': 'https://arns.app/'
    };
  
    try {
        // First API call to get owned process IDs
        const registryBody = JSON.stringify({
            Id: "1234",
            Target: "i_le_yKKPVstLTDSmkHRqf-wYphMnwB9OhleiTgMkWc",
            Owner: "1234",
            Anchor: "0",
            Data: "1234",
            Tags: [
                { name: "Action", value: "Access-Control-List" },
                { name: "Address", value: walletAddress },
                { name: "Data-Protocol", value: "ao" },
                { name: "Type", value: "Message" },
                { name: "Variant", value: "ao.TN.1" }
            ]
        });
  
        const registryResponse = await fetch(registryUrl, { method: 'POST', headers, body: registryBody });
        if (!registryResponse.ok) throw new Error(`Registry API error: ${registryResponse.status}`);
        
        const registryData = JSON.parse(await registryResponse.text());
        
        let ownedProcessIds: string[] = [];
        if (registryData.Messages?.[0]?.Data) {
            const ownedData = JSON.parse(registryData.Messages[0].Data);
            ownedProcessIds = ownedData.Owned || [];
        }

        // If no owned process IDs, return empty array
        if (ownedProcessIds.length === 0) return [];

        // Second API call to get names
        let cursor = "";  // Start with initial cursor
        let foundMatch = false;
        const processIdToName = new Map<string, string>();

        while (!foundMatch) {
            // Create base tags array without cursor
            const tags = [
                { name: "Action", value: "Paginated-Records" },
                { name: "Limit", value: "1000" },
                { name: "Data-Protocol", value: "ao" },
                { name: "Type", value: "Message" },
                { name: "Variant", value: "ao.TN.1" }
            ];

            // Only add cursor tag if we have a cursor value (not first request)
            if (cursor) {
                console.log(" moving to next page", cursor);
                tags.push({ name: "Cursor", value: cursor });
            }

            const namesBody = JSON.stringify({
                Id: "1234",
                Target: "qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE",
                Owner: "1234",
                Anchor: "0",
                Data: "1234",
                Tags: tags
            });

            const namesResponse = await fetch(namesUrl, { method: 'POST', headers, body: namesBody });
            if (!namesResponse.ok) throw new Error(`Names API error: ${namesResponse.status}`);

            const namesText = await namesResponse.text();
            const namesData = JSON.parse(namesText);
            
            if (namesData.Messages?.[0]?.Data) {
                const parsedData = JSON.parse(namesData.Messages[0].Data);
                const items = parsedData.items || [];
                
                // Check if any item matches our process IDs
                for (const item of items) {
                    if (ownedProcessIds.includes(item.processId)) {
                        processIdToName.set(item.processId, item.name);
                        foundMatch = true;
                        break; // Found what we're looking for, exit the loop
                    }
                }

                // If no match found and we have a next cursor, continue searching
                if (!foundMatch && parsedData.nextCursor) {
                    cursor = parsedData.nextCursor;  // Use the cursor from the response
                } else {
                    // Either found a match or no more pages to check
                    break;
                }
            } else {
                // No more data available
                break;
            }
        }
  
        // Return the matches we found (or process IDs if no matches)
        return ownedProcessIds.map(processId => ({
            name: processIdToName.get(processId) || processId,
            processId
        }));
  
    } catch (error) {
        console.error("Error fetching wallet owned names:", error);
        return [];
    }
}