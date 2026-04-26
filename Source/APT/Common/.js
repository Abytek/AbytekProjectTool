const os = require("os");
const path = require("path");
const fs = require("fs");
const { execSync } = require('child_process');
const Ajv = require("ajv");
const crypto = require('crypto');

APT.Common.StringToUUID = function(input) 
{
  const hash = crypto.createHash('sha1').update(input).digest('hex'); // 40 chars

  // Format as UUIDv4-like string: 8-4-4-4-12
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16), // force version 4
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.substring(18, 20), // force variant
    hash.substring(20, 32)
  ].join('-');
}

APT.Common.StringToShortID = function(input) 
{
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }
  
  // FNV-1a 64-bit hash - commonly used in game engines
  let hash = 0xcbf29ce484222325n; // FNV offset basis (64-bit)
  const fnvPrime = 0x100000001b3n;   // FNV prime (64-bit)
  
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash *= fnvPrime;
    // Keep it within 64-bit range
    hash &= 0xffffffffffffffffn;
  }
  
  // Convert 64-bit hash to base36 for compact representation  
  // Base36 is simpler, portable, and doesn't require Buffer
  const result = hash.toString(36);
  
  // Pad to ensure consistent length and take first 8 chars
  return result.padStart(12, '0');
}

APT.Common.StringToShortIDBase36 = function(input) 
{
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }
  
  const hash = crypto.createHash('sha1').update(input).digest('hex');
  
  if (hash.length < 10) {
    throw new Error('Hash digest too short');
  }
  
  // Convert hex to base36 (0-9, a-z) for better readability
  // Take more hex chars since base36 is more compact
  const hexChars = hash.slice(0, 10); // 10 hex chars = 40 bits
  const number = BigInt('0x' + hexChars);
  
  // Convert to base36 and pad to ensure consistent length
  const result = number.toString(36).padStart(8, '0');
  
  // Safely return first 8 characters
  return result.slice(0, 8);
}

APT.Common.NiceJSONStringify = function(Object)
{
    return JSON.stringify(Object, null, 2);
}

/**
 * Asserts that a value is truthy, throws error if not
 * @param {*} Value - Value to check
 * @param {...*} Args - Arguments to pass to Error constructor if assertion fails
 * @returns {*} The input value if assertion passes
 * @throws {Error} If assertion fails
 */
APT.Common.Assert = function(Value, ...Args)
{
    if (!Value)
    {
        throw new Error(...Args);
        return null;
    }
    return Value;
}

/**
 * Enumeration of supported platform tags
 * @enum {string}
 */
APT.Common.E_PlatformTag = 
{
    WINDOWS: "Windows",
    MACOS: "macOS",
    IOS: "iOS",
    LINUX: "Linux",
    POSIX: "POSIX",
    UNIX: "Unix",
    ANDROID: "Android",
    EMSCRIPTEN: "Emscripten",
    WEB: "Web"
}

/**
 * Gets platform tags for the current host system
 * @returns {string[]|null} Array of platform tags or null if platform is unknown
 */
APT.Common.GetHostPlatformTags = function()
{
    if (os.platform() == 'win32')
    {
        return [
            APT.Common.E_PlatformTag.WINDOWS,
        ];    
    }
    if (os.platform() == 'darwin')
    {
        return [
            APT.Common.E_PlatformTag.MACOS,
            APT.Common.E_PlatformTag.UNIX,
            APT.Common.E_PlatformTag.POSIX,
        ];    
    }
    if (os.platform() == 'linux')
    {
        return [
            APT.Common.E_PlatformTag.LINUX,
            APT.Common.E_PlatformTag.UNIX,
            APT.Common.E_PlatformTag.POSIX,
        ];    
    }
    if (
        (os.platform() == 'freebsd')
        || (os.platform() == 'openbsd')
        || (os.platform() == 'sunos')
    )
    {
        return [
            APT.Common.E_PlatformTag.UNIX,
            APT.Common.E_PlatformTag.POSIX,
        ];    
    }
    return null;
}

/**
 * Sets a property in an object using a dot-notation path, creating intermediate objects if needed.
 * Only sets the value if it doesn't already exist.
 * @param {Object} InObject - Target object
 * @param {string} Key - Dot-notation path (e.g. "a.b.c")
 * @param {*} Value - Value to set
 * @returns {*} Existing value if key exists, or new value if key was created
 */
APT.Common.TrySetPropertyByPath = function(InObject, Key, Value)
{
    let KeyParts = Key.split(".");
    let ParsedKeyParts = [];
    for(let KeyPart of KeyParts)
    {
        if (KeyPart != "")
        {
            ParsedKeyParts.push(KeyPart);
        }
    }

    let NumKeyParts = ParsedKeyParts.length;
    let Subobject = InObject;
    APT.Common.Assert(NumKeyParts > 0, `invalid key ${Key}`);
    for(let Idx = 0; Idx < (NumKeyParts - 1); ++Idx)
    {
        let KeyPart = ParsedKeyParts[Idx];
        if (!(KeyPart in Subobject))
        {
            Subobject[KeyPart] = new Object();
        }
        Subobject = Subobject[KeyPart];
    }
    let LastKeyPart = ParsedKeyParts[NumKeyParts - 1];
    if (LastKeyPart in Subobject)
    {
        return Subobject[LastKeyPart];
    }
    else
    {
        Subobject[LastKeyPart] = Value;
    }
    return Value;
}

/**
 * Sets a property in an object using a dot-notation path, creating intermediate objects if needed.
 * Always sets the value, overwriting any existing value.
 * @param {Object} InObject - Target object
 * @param {string} Key - Dot-notation path (e.g. "a.b.c")
 * @param {*} Value - Value to set
 * @returns {*} The set value
 */
APT.Common.SetPropertyByPath = function(InObject, Key, Value)
{
    let KeyParts = Key.split(".");
    let ParsedKeyParts = [];
    for(let KeyPart of KeyParts)
    {
        if (KeyPart != "")
        {
            ParsedKeyParts.push(KeyPart);
        }
    }

    let NumKeyParts = ParsedKeyParts.length;
    let Subobject = InObject;
    APT.Common.Assert(NumKeyParts > 0, `invalid key ${Key}`);
    for(let Idx = 0; Idx < (NumKeyParts - 1); ++Idx)
    {
        let KeyPart = ParsedKeyParts[Idx];
        if (!(KeyPart in Subobject))
        {
            Subobject[KeyPart] = new Object();
        }
        Subobject = Subobject[KeyPart];
    }
    let LastKeyPart = ParsedKeyParts[NumKeyParts - 1];
    Subobject[LastKeyPart] = Value;
    return Value;
}

/**
 * Gets a property from an object using a dot-notation path.
 * Throws error if any part of the path doesn't exist.
 * @param {Object} InObject - Source object
 * @param {string} Key - Dot-notation path (e.g. "a.b.c")
 * @returns {*} The value at the specified path
 * @throws {Error} If path doesn't exist
 */
APT.Common.GetPropertyByPath = function(InObject, Key)
{
    let KeyParts = Key.split(".");
    let ParsedKeyParts = [];
    for(let KeyPart of KeyParts)
    {
        if (KeyPart != "")
        {
            ParsedKeyParts.push(KeyPart);
        }
    }

    let NumKeyParts = ParsedKeyParts.length;
    let Subobject = InObject;
    APT.Common.Assert(NumKeyParts > 0, `invalid key ${Key}`);
    for(let Idx = 0; Idx < (NumKeyParts - 1); ++Idx)
    {
        let KeyPart = ParsedKeyParts[Idx];
        APT.Common.Assert(KeyPart in Subobject, `key ${Key} not added`);
        Subobject = Subobject[KeyPart];
    }
    let LastKeyPart = ParsedKeyParts[NumKeyParts - 1];
    APT.Common.Assert(LastKeyPart in Subobject, `key ${Key} not added`);
    return Subobject[LastKeyPart];
}

/**
 * Attempts to find a property in an object using a dot-notation path.
 * Returns null if any part of the path doesn't exist.
 * @param {Object} InObject - Source object
 * @param {string} Key - Dot-notation path (e.g. "a.b.c")
 * @returns {*|null} The value at the specified path or null if not found
 */
APT.Common.FindPropertyByPath = function(InObject, Key)
{
    let KeyParts = Key.split(".");
    let ParsedKeyParts = [];
    for(let KeyPart of KeyParts)
    {
        if (KeyPart != "")
        {
            ParsedKeyParts.push(KeyPart);
        }
    }

    let NumKeyParts = ParsedKeyParts.length;
    let Subobject = InObject;
    if (!(NumKeyParts > 0))
    {
        return null;
    }
    for(let Idx = 0; Idx < (NumKeyParts - 1); ++Idx)
    {
        let KeyPart = ParsedKeyParts[Idx];
        if (!(KeyPart in Subobject))
        {
            return null;
        }
        Subobject = Subobject[KeyPart];
    }
    let LastKeyPart = ParsedKeyParts[NumKeyParts - 1];
    if (!(LastKeyPart in Subobject))
    {
        return null;
    }
    return Subobject[LastKeyPart];
}

APT.Common.FindPropertyByPathThenReset = function(InObject, Key)
{
    let KeyParts = Key.split(".");
    let ParsedKeyParts = [];
    for(let KeyPart of KeyParts)
    {
        if (KeyPart != "")
        {
            ParsedKeyParts.push(KeyPart);
        }
    }

    let NumKeyParts = ParsedKeyParts.length;
    let Subobject = InObject;
    if (!(NumKeyParts > 0))
    {
        return null;
    }
    for(let Idx = 0; Idx < (NumKeyParts - 1); ++Idx)
    {
        let KeyPart = ParsedKeyParts[Idx];
        if (!(KeyPart in Subobject))
        {
            return null;
        }
        Subobject = Subobject[KeyPart];
    }
    let LastKeyPart = ParsedKeyParts[NumKeyParts - 1];
    if (!(LastKeyPart in Subobject))
    {
        return null;
    }
    let FinalResult = Subobject[LastKeyPart];
    Subobject[LastKeyPart] = null;
    return FinalResult;
}

/**
 * Converts a value to a string, with special handling for arrays
 * @param {*} Value - Value to convert
 * @param {string} [ArrayCombinatorKeyword="/"] - String to join array elements with
 * @returns {string|null} Converted string or null if input is null
 */
APT.Common.ForwardString = function(Value, ArrayCombinatorKeyword = "/")
{
    if (Value == null)
    {
        return null;
    }
    if (Array.isArray(Value))
    {
        return Value.join(ArrayCombinatorKeyword);
    }
    return Value;
}

/**
 * Converts various string/number values to boolean
 * @param {*} Value - Value to convert
 * @returns {boolean} true for various "truthy" strings/numbers, false otherwise
 */
APT.Common.ForwardBool = function(Value)
{
    if (
        (Value == 1)
        || (Value == '1')
        || (Value == 'true')
        || (Value == 'True')
        || (Value == 'TRUE')
        || (Value == 'on')
        || (Value == 'On')
        || (Value == 'ON')
        || (Value == 'enable')
        || (Value == 'Enable')
        || (Value == 'ENABLE')
    )
    {
        return true;
    }
    return false;
}

/**
 * Creates a deep copy of a value using JSON serialization
 * @param {*} Value - Value to copy
 * @returns {*} Deep copy of the value
 */
APT.Common.SimpleDeepCopy = function(Value)
{
    return JSON.parse(
        JSON.stringify(Value)
    );
}

/**
 * Gets the data directory raw path
 * @returns {string} Absolute raw path to data directory
 */
APT.Common.GetDataDirectoryRaw = function()
{
    return path.join(__dirname, "../../../Data");
}

/**
 * Gets the data directory path
 * @returns {string} Absolute path to data directory
 */
APT.Common.GetDataDirectory = function()
{
    const Raw = this.GetDataDirectoryRaw();
    if (!(APT.Common.GetHostPlatformTags().includes(APT.Common.E_PlatformTag.WINDOWS)))
    {
        return Raw;
    }
    return path.join(path.parse(Raw).root, ".APT");
}

APT.Common.GetProjectImportedDirectory = function(EntryDirectory)
{
    const Result = path.join(APT.Common.GetDataDirectory(), "Imported");
    if (EntryDirectory == null)
    {
        return Result;
    }
    return path.join(Result, APT.Common.StringToUUID(path.normalize(EntryDirectory)));
}

/**
 * Gets the logs directory path
 * @returns {string} Absolute path to logs directory
 */
APT.Common.GetLogsDirectory = function()
{
    return path.join(APT.Common.GetDataDirectory(), "Logs");
}

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

/**
 * Writes content to a file only if it differs from existing content
 * @param {string} File - Target file path
 * @param {string} Content - Content to write
 * @throws {Error} If path exists but is not a file
 */
APT.Common.SmartWriteFile = function(File, Content)
{
    if (!(fs.existsSync(File)))
    {
        fs.writeFileSync(File, Content);
        return;
    }

    let stats = fs.statSync(File);
    if (!(stats.isFile()))
    {
        throw new Error(`The item is actually not a file`);
    }

    let LastContent = fs.readFileSync(File).toString();
    if (Content != LastContent)
    {
        fs.writeFileSync(File, Content);
    }
}

/**
 * Gets the project links directory path
 * @returns {string} Absolute path to project links directory
 */
APT.Common.GetProjectLinksDirectory = function()
{
    return path.join(APT.Common.GetDataDirectory(), "ProjectLinks");
}

APT.Common.MergeData = function(ResultObject, AObject)
{
    if (typeof ResultObject != "object")
    {
        return APT.Common.SimpleDeepCopy(AObject);
    }
    for (let Key in AObject)
    {
        let AProperty = AObject[Key];

        if (typeof AProperty == "object")
        {
            if (Key in ResultObject)
            {
                let ResultPropertySrc = ResultObject[Key];
                if (typeof ResultPropertySrc == "object")
                {
                    let ResultPropertyDst = APT.Common.SimpleDeepCopy(ResultPropertySrc);
                    APT.Common.MergeData(ResultPropertyDst, AProperty);
                    ResultObject[Key] = ResultPropertyDst;
                    continue;
                }
            }
        }
        
        ResultObject[Key] = AProperty;
    }
    return ResultObject;
}

APT.Common.ToCLIArgument = function(Value)
{
    return `\"${
        Value
        .replaceAll("\"", "\\\"")
        .replaceAll("\\", "\\\\")
    }\"`;
}