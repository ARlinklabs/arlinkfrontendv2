/**
 * Process Cache Manager
 * 
 * This utility manages local caching of ARlink manager processes to prevent
 * duplicate process spawns caused by unreliable GraphQL responses.
 * 
 * The cache stores:
 * - Manager process ID
 * - Wallet address it belongs to
 * - Timestamp of last validation
 * - Validation status (whether it has deployments)
 */

const CACHE_KEY_PREFIX = 'arlink_manager_process';
const CACHE_VERSION = 'v1';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export interface CachedProcess {
    processId: string;
    walletAddress: string;
    timestamp: number;
    validated: boolean; // Whether this process has been confirmed to have deployments
    version: string;
}

/**
 * Get the cache key for a specific wallet address
 */
function getCacheKey(walletAddress: string): string {
    return `${CACHE_KEY_PREFIX}_${CACHE_VERSION}_${walletAddress}`;
}

/**
 * Check if a cached process is still valid (not expired)
 */
function isCacheValid(cachedProcess: CachedProcess): boolean {
    const now = Date.now();
    const age = now - cachedProcess.timestamp;
    
    // Check if cache is expired
    if (age > CACHE_TTL) {
        console.log(`[ProcessCache] Cache expired for ${cachedProcess.walletAddress.slice(0, 8)}...`);
        return false;
    }
    
    // Check if it has the correct version
    if (cachedProcess.version !== CACHE_VERSION) {
        console.log(`[ProcessCache] Cache version mismatch for ${cachedProcess.walletAddress.slice(0, 8)}...`);
        return false;
    }
    
    return true;
}

/**
 * Get cached manager process for a wallet address
 * Returns null if cache miss or expired
 */
export function getCachedProcess(walletAddress: string): string | null {
    if (!walletAddress) {
        console.warn('[ProcessCache] No wallet address provided');
        return null;
    }
    
    try {
        const cacheKey = getCacheKey(walletAddress);
        const cachedData = localStorage.getItem(cacheKey);
        
        if (!cachedData) {
            console.log(`[ProcessCache] No cache found for ${walletAddress.slice(0, 8)}...`);
            return null;
        }
        
        const cachedProcess: CachedProcess = JSON.parse(cachedData);
        
        // Validate cache
        if (!isCacheValid(cachedProcess)) {
            // Remove invalid cache
            localStorage.removeItem(cacheKey);
            return null;
        }
        
        console.log(`[ProcessCache] ✅ Cache hit for ${walletAddress.slice(0, 8)}... -> ${cachedProcess.processId}`);
        return cachedProcess.processId;
    } catch (error) {
        console.error('[ProcessCache] Error reading cache:', error);
        return null;
    }
}

/**
 * Get full cached process data (including validation status)
 * Returns null if cache miss or expired
 */
export function getCachedProcessData(walletAddress: string): CachedProcess | null {
    if (!walletAddress) {
        return null;
    }
    
    try {
        const cacheKey = getCacheKey(walletAddress);
        const cachedData = localStorage.getItem(cacheKey);
        
        if (!cachedData) {
            return null;
        }
        
        const cachedProcess: CachedProcess = JSON.parse(cachedData);
        
        // Validate cache
        if (!isCacheValid(cachedProcess)) {
            // Remove invalid cache
            localStorage.removeItem(cacheKey);
            return null;
        }
        
        return cachedProcess;
    } catch (error) {
        console.error('[ProcessCache] Error reading cache data:', error);
        return null;
    }
}

/**
 * Cache a manager process for a wallet address
 * 
 * @param walletAddress - The wallet address that owns the process
 * @param processId - The manager process ID to cache
 * @param validated - Whether this process has been confirmed to have deployments
 * @param forceUpdate - Force update even if already cached with same validation status
 */
export function cacheProcess(
    walletAddress: string, 
    processId: string, 
    validated: boolean = false,
    forceUpdate: boolean = false
): void {
    if (!walletAddress || !processId) {
        console.warn('[ProcessCache] Invalid parameters for caching');
        return;
    }
    
    try {
        // Check if we already have this exact cache entry
        const existingCache = getCachedProcessData(walletAddress);
        
        if (!forceUpdate && existingCache) {
            // If same process ID and already validated, skip caching
            if (existingCache.processId === processId && existingCache.validated && validated) {
                console.log(`[ProcessCache] ⏭️ Skipping cache update - already cached and validated for ${walletAddress.slice(0, 8)}...`);
                return;
            }
            
            // If upgrading from unvalidated to validated, proceed
            if (existingCache.processId === processId && !existingCache.validated && validated) {
                console.log(`[ProcessCache] ⬆️ Upgrading cache to validated for ${walletAddress.slice(0, 8)}...`);
            }
        }
        
        const cacheKey = getCacheKey(walletAddress);
        const cacheData: CachedProcess = {
            processId,
            walletAddress,
            timestamp: Date.now(),
            validated,
            version: CACHE_VERSION,
        };
        
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        
        const validationStatus = validated ? '(validated)' : '(unvalidated)';
        console.log(`[ProcessCache] 💾 Cached process for ${walletAddress.slice(0, 8)}... -> ${processId} ${validationStatus}`);
    } catch (error) {
        console.error('[ProcessCache] Error writing cache:', error);
    }
}

/**
 * Clear cached process for a wallet address
 * Useful when we know a process is invalid or we want to force a refresh
 */
export function clearCachedProcess(walletAddress: string): void {
    if (!walletAddress) {
        console.warn('[ProcessCache] No wallet address provided for clearing cache');
        return;
    }
    
    try {
        const cacheKey = getCacheKey(walletAddress);
        localStorage.removeItem(cacheKey);
        console.log(`[ProcessCache] 🗑️ Cleared cache for ${walletAddress.slice(0, 8)}...`);
    } catch (error) {
        console.error('[ProcessCache] Error clearing cache:', error);
    }
}

/**
 * Clear all cached processes
 * Useful for debugging or when we want to force a complete refresh
 */
export function clearAllCachedProcesses(): void {
    try {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith(`${CACHE_KEY_PREFIX}_${CACHE_VERSION}_`));
        
        cacheKeys.forEach(key => localStorage.removeItem(key));
        
        console.log(`[ProcessCache] 🗑️ Cleared ${cacheKeys.length} cached processes`);
    } catch (error) {
        console.error('[ProcessCache] Error clearing all caches:', error);
    }
}

/**
 * Get all cached processes (for debugging)
 */
export function getAllCachedProcesses(): CachedProcess[] {
    try {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith(`${CACHE_KEY_PREFIX}_${CACHE_VERSION}_`));
        
        return cacheKeys.map(key => {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) as CachedProcess : null;
        }).filter(Boolean) as CachedProcess[];
    } catch (error) {
        console.error('[ProcessCache] Error getting all caches:', error);
        return [];
    }
}

