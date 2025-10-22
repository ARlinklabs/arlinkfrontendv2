import { runLua, spawnProcess } from "@/lib/ao-vars";

const setUpCommands = `
local _tl_compat; if (tonumber((_VERSION or ''):match('[%d.]*$')) or 0) < 5.3 then local p, m = pcall(require, 'compat53.module'); if p then _tl_compat = m end end; local math = _tl_compat and _tl_compat.math or math; local os = _tl_compat and _tl_compat.os or os; local pairs = _tl_compat and _tl_compat.pairs or pairs; local pcall = _tl_compat and _tl_compat.pcall or pcall

json = require("json")

-- Initialize State with all required structures
State = State or {
  pageViews = {}, -- Store monthly page views
  visitors = {}, -- Store monthly unique visitors
  loadTimes = {}, -- Store monthly load times
  countries = {}, -- Store country visit counts
  browsers = {}, -- Store browser usage
  wallets = {}, -- Store wallet usage
  pages = {}, -- Store page visit counts
  recentActivity = {}, -- Store recent activities
  monthlyStats = {} -- Store combined monthly statistics
}



-- Helper function to calculate percentages
local function calculatePercentages(data)
  local total = 0
  for _, item in pairs(data) do
    total = total + (type(item) == "table" and item.count or item)
  end
  
  local result = {}
  for key, value in pairs(data) do
    local count = type(value) == "table" and value.count or value
    table.insert(result, {
      [type(value) == "table" and value.name or key] = key,
      visitors = count,
      percentage = math.floor((count / total) * 100)
    })
  end
  
  table.sort(result, function(a, b) return a.visitors > b.visitors end)
  return result
end

-- Track handler to process incoming data
Handlers.add("track", Handlers.utils.hasMatchingTag("Action", "Track"), function(msg)
    -- Tags are already key-value pairs, no need to convert
    local data = msg.Tags

    -- Debug print
    print("Received data:", json.encode(data))

    -- Track handler validation section
    local requiredFields = {
        country = "Country",
        browser = "Browser",
        pageVisited = "Page Visited",
        lt = "Load Time"
    }

    -- Check missing fields
    local missingFields = {}
    for field, displayName in pairs(requiredFields) do
        if not data[field] then
            table.insert(missingFields, displayName)
        end
    end

    if #missingFields > 0 then
        return ao.send({
            Target = msg.From,
            Data = string.format("Error: Missing required fields: %s", table.concat(missingFields, ", ")),
            Tags = {
                ["Status"] = "Error",
                ["Error"] = "Missing required fields",
                ["Missing-Fields"] = table.concat(missingFields, ", ")
            }
        })
    end

    -- Extract month directly from timestamp string instead of using os.time parsing
    local month = "Jan" -- Default value
    if data.timestamp then
        -- Format: 2025-03-05T11:06:42GMT
        local _, monthNum = data.timestamp:match("(%d+)-(%d+)-")
        if monthNum then
            local monthIndex = tonumber(monthNum)
            if monthIndex and monthIndex >= 1 and monthIndex <= 12 then
                local months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"}
                month = months[monthIndex]
                print("Extracted month: " .. month .. " from timestamp: " .. data.timestamp)
            end
        end
    end

    -- Initialize state structures if they don't exist
    State.monthlyStats = State.monthlyStats or {}
    State.countries = State.countries or {}
    State.browsers = State.browsers or {}
    State.wallets = State.wallets or {}
    State.pages = State.pages or {}
    State.recentActivity = State.recentActivity or {}

    State.monthlyStats[month] = State.monthlyStats[month] or {
        pageViews = 0,
        visitors = 0,
        loadTimes = { total = 0, count = 0 }
    }

    -- Update all statistics
    State.monthlyStats[month].pageViews = State.monthlyStats[month].pageViews + 1
    State.monthlyStats[month].visitors = State.monthlyStats[month].visitors + 1
    
    -- Parse and validate load time
    local loadTime = tonumber(data.lt)
    if loadTime and loadTime > 0 and loadTime < 60 then -- Reasonable bounds for page load time in seconds
        State.monthlyStats[month].loadTimes.total = State.monthlyStats[month].loadTimes.total + loadTime
        State.monthlyStats[month].loadTimes.count = State.monthlyStats[month].loadTimes.count + 1
    end

    -- Update country/browsers/wallets/pages
    State.countries[data.country] = (State.countries[data.country] or 0) + 1
    State.browsers[data.browser] = (State.browsers[data.browser] or 0) + 1

    -- Handle wallet detection
    local wallet = (data.ar and data.ar ~= "unknown") and data.ar or 
                   (data.eth and data.eth ~= "unknown" and data.eth or "others")
    State.wallets[wallet] = (State.wallets[wallet] or 0) + 1

    State.pages[data.pageVisited] = (State.pages[data.pageVisited] or 0) + 1

    -- Update recent activity (keeping only last 6 items)
    -- Validate the load time for display
    local displayLoadTime = loadTime and loadTime > 0 and loadTime < 60 
                           and (loadTime .. "s") 
                           or "N/A"
    
    table.insert(State.recentActivity, 1, {
        timestamp = data.timestamp,
        pageVisited = data.pageVisited,
        browserDevice = data.browserDevice,
        country = data.country,
        loadTime = displayLoadTime
    })
    
    while #State.recentActivity > 6 do
        table.remove(State.recentActivity)
    end

    -- Return response
    return ao.send({
        Target = msg.From,
        Data = "Tracking data processed successfully",
        Tags = {
            ["Status"] = "Success"
        }
    })
end)

-- GetAnalytics handler to format and return data
Handlers.add("getAnalytics", Handlers.utils.hasMatchingTag("Action", "GetAnalytics"), function(msg)
  -- Helper function to format metric data
  local function formatMetric(data, current, previous)
    -- Get the most recent non-zero value from chartData
    local currentValue = current or 0
    for i = #data, 1, -1 do
      if data[i].value and data[i].value > 0 then
        currentValue = data[i].value
        break
      end
    end
    
    -- Get the previous non-zero value
    local previousValue = previous or 0
    local foundCurrent = false
    for i = #data, 1, -1 do
      if data[i].value and data[i].value > 0 then
        if foundCurrent then
          previousValue = data[i].value
          break
        end
        foundCurrent = true
      end
    end

    local change = previousValue > 0 and math.floor(((currentValue - previousValue) / previousValue) * 100) or 0
    return {
      value = currentValue,  -- This will now correctly use the most recent non-zero value
      change = change,
      trend = change >= 0 and "up" or "down",
      chartData = data
    }
  end

  -- Get monthly data for charts
  local months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"}
  local pageViewsData = {}
  local visitorsData = {}
  local loadTimeData = {}

  for _, month in ipairs(months) do
    local stats = State.monthlyStats[month] or { pageViews = 0, visitors = 0, loadTimes = { total = 0, count = 0 } }
    local avgLoadTime = stats.loadTimes.count > 0 and (stats.loadTimes.total / stats.loadTimes.count) or 0
    
    table.insert(pageViewsData, {
      date = month,
      value = stats.pageViews
    })
    
    table.insert(visitorsData, {
      date = month,
      value = stats.visitors or stats.pageViews -- Fallback to pageViews if visitors not set
    })
    
    table.insert(loadTimeData, {
      date = month,
      value = avgLoadTime
    })
  end

  -- Format response with corrected metric values
  local response = {
    success = true,
    data = {
      analyticsMetrics = {
        pageViews = formatMetric(pageViewsData),
        visitors = formatMetric(visitorsData),
        avgLoadTime = formatMetric(loadTimeData),
        globalTraffic = {
          regions = calculatePercentages(State.countries)
        },
        topCountries = calculatePercentages(State.countries)
      },
      browsers = calculatePercentages(State.browsers),
      wallets = calculatePercentages(State.wallets),
      topPages = calculatePercentages(State.pages),
      recentActivity = State.recentActivity
    }
  }

  return ao.send({
    Target = msg.From,
    Data = json.encode(response)
  })
end)
print("ok")
`;

export const spawnReportProcess = async (projectName: string, signer?: any) => {
    console.log('[spawnReportProcess] Called with:', {
        projectName,
        signer,
        signerType: typeof signer,
        signerIsNull: signer === null,
        signerIsUndefined: signer === undefined
    });
    
    const processId = await spawnProcess(`${projectName}-report-manager`, undefined, undefined, signer);
    console.log("spawned process", processId);

    if (processId) {
        console.log("process Id spawned, running run lua function now");

        let result;
        let retryCount = 0;
        const maxRetries = 5;

        do {
            if (retryCount > 0) {
                console.log(`Retry attempt ${retryCount} for runLua`);
            }
            //added this delay to fix thhe mu 500 error 
            await new Promise(resolve => setTimeout(resolve, 3000));

            result = await runLua(setUpCommands, processId, undefined, signer);
            console.log("result is ", result);

            if (!result) {
                console.log(
                    `Error detected in runLua, will retry. Error: ${result}`,
                );
            }

            retryCount++;
        } while (result.Error && retryCount < maxRetries);

        if (result.Error) {
            console.warn(`runLua still failing after ${maxRetries} retries`);
        }

        console.log({ runLuaResult: result });
        console.log("run lua function has been executed");
    } else {
        throw new Error("Process ID is not spawned");
    }

    return processId;
};
