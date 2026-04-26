
const path = require("path");
const fs = require("fs");

AMJS.Import("./Files");


/**
 * Gets the cache directory path
 * @returns {string} Absolute path to cache directory
 */
APT.Common.GetCacheDirectory = function()
{
    return path.join(APT.Common.GetDataDirectory(), "Cache");
}

/**
 * Calculates the full path for a cache file
 * @param {string} Key - Cache key
 * @returns {string} Absolute path to cache file
 */
APT.Common.CalculateCacheFile = function(Key)
{
    return path.join(APT.Common.GetCacheDirectory(), Key);
}

/**
 * Checks if a cache entry exists
 * @param {string} Key - Cache key
 * @returns {boolean} true if cache exists and is a file
 */
APT.Common.HasCache = function(Key)
{
    const CacheFile = APT.Common.CalculateCacheFile(Key);
    if (!fs.existsSync(CacheFile))
    {
        return false;
    }
    let stats = fs.statSync(CacheFile);
    return stats.isFile();
}

/**
 * Writes a value to cache
 * @param {string} Key - Cache key
 * @param {*} Value - Value to cache
 * @param {boolean} [Required=true] - If true, throws error if key already exists
 * @returns {*|null} The cached value or null if skipped (already exists)
 * @throws {Error} If Required is true and key already exists
 */
APT.Common.Cache = function(Key, Value, Required = true)
{
    if (APT.Common.HasCache(Key))
    {
        if (Required)
        {
            throw new Error(`Already cached ${Key}`);
        }
        return null;
    }
    const CacheFile = APT.Common.CalculateCacheFile(Key);
    {
        const Dir = path.dirname(CacheFile);
        if (!fs.existsSync(Dir))
        {
            fs.mkdirSync(Dir, { recursive: true });
        }
    }
    fs.writeFileSync(CacheFile, Value);
    return Value;
}

/**
 * Attempts to write a value to cache, ignoring if it already exists
 * @param {string} Key - Cache key
 * @param {*} Value - Value to cache
 * @returns {*|null} The cached value or null if skipped
 */
APT.Common.TryCache = function(Key, Value)
{
    return APT.Common.Cache(Key, Value, false);
}

/**
 * Removes a value from cache
 * @param {string} Key - Cache key
 * @param {boolean} [Required=true] - If true, throws error if key doesn't exist
 * @returns {boolean} true if cache was removed, false if it didn't exist
 * @throws {Error} If Required is true and key doesn't exist
 */
APT.Common.Uncache = function(Key, Required = true)
{
    if (!(APT.Common.HasCache(Key)))
    {
        if (Required)
        {
            throw new Error(`Not cached ${Key}`);
        }
        return false;
    }
    const CacheFile = APT.Common.CalculateCacheFile(Key);
    fs.unlinkSync(CacheFile);
    return true;
}

/**
 * Attempts to remove a value from cache, ignoring if it doesn't exist
 * @param {string} Key - Cache key
 * @returns {boolean} true if cache was removed, false if it didn't exist
 */
APT.Common.TryUncache = function(Key)
{
    return APT.Common.Uncache(Key, false);
}

/**
 * Reads a value from cache
 * @param {string} Key - Cache key
 * @param {boolean} [Required=true] - If true, throws error if key doesn't exist
 * @returns {string|boolean} Cache contents as string, or false if not found
 * @throws {Error} If Required is true and key doesn't exist
 */
APT.Common.ReadCache = function(Key, Required = true)
{
    if (!(APT.Common.HasCache(Key)))
    {
        if (Required)
        {
            throw new Error(`Not cached ${Key}`);
        }
        return false;
    }
    const CacheFile = APT.Common.CalculateCacheFile(Key);
    return fs.readFileSync(CacheFile).toString();
}

/**
 * Attempts to read a value from cache, returning false if it doesn't exist
 * @param {string} Key - Cache key
 * @returns {string|boolean} Cache contents as string, or false if not found
 */
APT.Common.TryReadCache = function(Key)
{
    return APT.Common.ReadCache(Key, false);
}

/**
 * Gets all cache entries
 * @returns {Object.<string, string>} Object mapping cache keys to their values
 */
APT.Common.GatherCache = function()
{
    let Items = fs.readdirSync(APT.Common.GetCacheDirectory(), { withFileTypes: true, recursive: false });
    let Result = new Object();
    for(let Item of Items)
    {
        Result[Item.name] = APT.Common.ReadCache(Item.name);
    }
    return Result;
}