export async function getWalletOwnedNames(walletAddress: string): Promise<{ name: string; processId: string }[]> {
    const registryUrl = "https://cu.ardrive.io/dry-run?process-id=i_le_yKKPVstLTDSmkHRqf-wYphMnwB9OhleiTgMkWc";
    const namesUrl = "https://cu.ardrive.io/dry-run?process-id=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE";
  
    const headers = {
      accept: "*/*",
      "content-type": "application/json",
      origin: "https://arns.app",
      referer: "https://arns.app/",
    };
  
    try {
      // 1️⃣ Get owned + controlled process IDs
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
          { name: "Variant", value: "ao.TN.1" },
        ],
      });
  
      const registryResponse = await fetch(registryUrl, { method: "POST", headers, body: registryBody });
      if (!registryResponse.ok) throw new Error(`Registry API error: ${registryResponse.status}`);
  
      const registryData = JSON.parse(await registryResponse.text());
      let ownedProcessIds: string[] = [];
  
      if (registryData.Messages?.[0]?.Data) {
        const ownedData = JSON.parse(registryData.Messages[0].Data);
        ownedProcessIds = [
          ...(ownedData.Owned || []),
          ...(ownedData.Controlled || []),
        ];
      }
  
      if (ownedProcessIds.length === 0) return [];
  
      // 2️⃣ Get names from paginated API
      let cursor = "";
      const processIdToName = new Map<string, string>();
      const remainingIds = new Set(ownedProcessIds);
  
      while (true) {
        const tags = [
          { name: "Action", value: "Paginated-Records" },
          { name: "Limit", value: "1000" },
          { name: "Data-Protocol", value: "ao" },
          { name: "Type", value: "Message" },
          { name: "Variant", value: "ao.TN.1" },
        ];
  
        if (cursor) tags.push({ name: "Cursor", value: cursor });
  
        const namesBody = JSON.stringify({
          Id: "1234",
          Target: "qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE",
          Owner: "1234",
          Anchor: "0",
          Data: "1234",
          Tags: tags,
        });
  
        const namesResponse = await fetch(namesUrl, { method: "POST", headers, body: namesBody });
        if (!namesResponse.ok) throw new Error(`Names API error: ${namesResponse.status}`);
  
        const namesText = await namesResponse.text();
        const namesData = JSON.parse(namesText);
  
        if (!namesData.Messages?.[0]?.Data) break;
  
        const parsedData = JSON.parse(namesData.Messages[0].Data);
        const items = parsedData.items || [];
  
        // 3️⃣ Collect matches for all items in this page
        for (const item of items) {
          if (remainingIds.has(item.processId)) {
            processIdToName.set(item.processId, item.name);
            remainingIds.delete(item.processId);
          }
        }
  
        // 4️⃣ Stop if we've found all or no more pages
        if (remainingIds.size === 0 || !parsedData.hasMore || !parsedData.nextCursor) {
          break;
        }
  
        cursor = parsedData.nextCursor;
      }
  
      // 5️⃣ Return results
      return ownedProcessIds.map((processId) => ({
        name: processIdToName.get(processId) || processId,
        processId,
      }));
    } catch (error) {
      console.error("Error fetching wallet owned names:", error);
      return [];
    }
  }
  