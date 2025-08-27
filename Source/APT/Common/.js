const os = require("os");
const path = require("path");
const fs = require("fs");
const { execSync } = require('child_process');
const Ajv = require("ajv");

AMJS.Namespace.NiceJSONStringify = function(Object)
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
AMJS.Namespace.Assert = function(Value, ...Args)
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
AMJS.Namespace.PlatformTags = 
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
AMJS.Namespace.GetHostPlatformTags = function()
{
    if (os.platform() == 'win32')
    {
        return [
            AMJS.Namespace.PlatformTags.WINDOWS,
        ];    
    }
    if (os.platform() == 'darwin')
    {
        return [
            AMJS.Namespace.PlatformTags.MACOS,
            AMJS.Namespace.PlatformTags.UNIX,
            AMJS.Namespace.PlatformTags.POSIX,
        ];    
    }
    if (os.platform() == 'linux')
    {
        return [
            AMJS.Namespace.PlatformTags.LINUX,
            AMJS.Namespace.PlatformTags.UNIX,
            AMJS.Namespace.PlatformTags.POSIX,
        ];    
    }
    if (
        (os.platform() == 'freebsd')
        || (os.platform() == 'openbsd')
        || (os.platform() == 'sunos')
    )
    {
        return [
            AMJS.Namespace.PlatformTags.UNIX,
            AMJS.Namespace.PlatformTags.POSIX,
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
AMJS.Namespace.TrySetPropertyByPath = function(InObject, Key, Value)
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
    AMJS.Namespace.Assert(NumKeyParts > 0, `invalid key ${Key}`);
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
AMJS.Namespace.SetPropertyByPath = function(InObject, Key, Value)
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
    AMJS.Namespace.Assert(NumKeyParts > 0, `invalid key ${Key}`);
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
AMJS.Namespace.GetPropertyByPath = function(InObject, Key)
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
    AMJS.Namespace.Assert(NumKeyParts > 0, `invalid key ${Key}`);
    for(let Idx = 0; Idx < (NumKeyParts - 1); ++Idx)
    {
        let KeyPart = ParsedKeyParts[Idx];
        AMJS.Namespace.Assert(KeyPart in Subobject, `key ${Key} not added`);
        Subobject = Subobject[KeyPart];
    }
    let LastKeyPart = ParsedKeyParts[NumKeyParts - 1];
    AMJS.Namespace.Assert(LastKeyPart in Subobject, `key ${Key} not added`);
    return Subobject[LastKeyPart];
}

/**
 * Attempts to find a property in an object using a dot-notation path.
 * Returns null if any part of the path doesn't exist.
 * @param {Object} InObject - Source object
 * @param {string} Key - Dot-notation path (e.g. "a.b.c")
 * @returns {*|null} The value at the specified path or null if not found
 */
AMJS.Namespace.FindPropertyByPath = function(InObject, Key)
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

/**
 * Converts a value to a string, with special handling for arrays
 * @param {*} Value - Value to convert
 * @param {string} [ArrayCombinatorKeyword="/"] - String to join array elements with
 * @returns {string|null} Converted string or null if input is null
 */
AMJS.Namespace.ForwardString = function(Value, ArrayCombinatorKeyword = "/")
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
AMJS.Namespace.ForwardBool = function(Value)
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
AMJS.Namespace.SimpleDeepCopy = function(Value)
{
    return JSON.parse(
        JSON.stringify(Value)
    );
}

/**
 * Gets the data directory raw path
 * @returns {string} Absolute raw path to data directory
 */
AMJS.Namespace.GetDataDirectoryRaw = function()
{
    return path.join(__dirname, "../../../Data");
}

/**
 * Gets the data directory path
 * @returns {string} Absolute path to data directory
 */
AMJS.Namespace.GetDataDirectory = function()
{
    const Raw = this.GetDataDirectoryRaw();
    if (!(AMJS.Namespace.GetHostPlatformTags().includes(AMJS.Namespace.PlatformTags.WINDOWS)))
    {
        return Raw;
    }
    return path.join(path.parse(Raw).root, ".APTData");
}

/**
 * Gets the cache directory path
 * @returns {string} Absolute path to cache directory
 */
AMJS.Namespace.GetCacheDirectory = function()
{
    return path.join(AMJS.Namespace.GetDataDirectory(), "Cache");
}

/**
 * Calculates the full path for a cache file
 * @param {string} Key - Cache key
 * @returns {string} Absolute path to cache file
 */
AMJS.Namespace.CalculateCacheFile = function(Key)
{
    return path.join(AMJS.Namespace.GetCacheDirectory(), Key);
}

/**
 * Checks if a cache entry exists
 * @param {string} Key - Cache key
 * @returns {boolean} true if cache exists and is a file
 */
AMJS.Namespace.HasCache = function(Key)
{
    const CacheFile = AMJS.Namespace.CalculateCacheFile(Key);
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
AMJS.Namespace.Cache = function(Key, Value, Required = true)
{
    if (AMJS.Namespace.HasCache(Key))
    {
        if (Required)
        {
            throw new Error(`Already cached ${Key}`);
        }
        return null;
    }
    const CacheFile = AMJS.Namespace.CalculateCacheFile(Key);
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
AMJS.Namespace.TryCache = function(Key, Value)
{
    return AMJS.Namespace.Cache(Key, Value, false);
}

/**
 * Removes a value from cache
 * @param {string} Key - Cache key
 * @param {boolean} [Required=true] - If true, throws error if key doesn't exist
 * @returns {boolean} true if cache was removed, false if it didn't exist
 * @throws {Error} If Required is true and key doesn't exist
 */
AMJS.Namespace.Uncache = function(Key, Required = true)
{
    if (!(AMJS.Namespace.HasCache(Key)))
    {
        if (Required)
        {
            throw new Error(`Not cached ${Key}`);
        }
        return false;
    }
    const CacheFile = AMJS.Namespace.CalculateCacheFile(Key);
    fs.unlinkSync(CacheFile);
    return true;
}

/**
 * Attempts to remove a value from cache, ignoring if it doesn't exist
 * @param {string} Key - Cache key
 * @returns {boolean} true if cache was removed, false if it didn't exist
 */
AMJS.Namespace.TryUncache = function(Key)
{
    return AMJS.Namespace.Uncache(Key, false);
}

/**
 * Reads a value from cache
 * @param {string} Key - Cache key
 * @param {boolean} [Required=true] - If true, throws error if key doesn't exist
 * @returns {string|boolean} Cache contents as string, or false if not found
 * @throws {Error} If Required is true and key doesn't exist
 */
AMJS.Namespace.ReadCache = function(Key, Required = true)
{
    if (!(AMJS.Namespace.HasCache(Key)))
    {
        if (Required)
        {
            throw new Error(`Not cached ${Key}`);
        }
        return false;
    }
    const CacheFile = AMJS.Namespace.CalculateCacheFile(Key);
    return fs.readFileSync(CacheFile).toString();
}

/**
 * Attempts to read a value from cache, returning false if it doesn't exist
 * @param {string} Key - Cache key
 * @returns {string|boolean} Cache contents as string, or false if not found
 */
AMJS.Namespace.TryReadCache = function(Key)
{
    return AMJS.Namespace.ReadCache(Key, false);
}

/**
 * Gets all cache entries
 * @returns {Object.<string, string>} Object mapping cache keys to their values
 */
AMJS.Namespace.GatherCache = function()
{
    let Items = fs.readdirSync(AMJS.Namespace.GetCacheDirectory(), { withFileTypes: true, recursive: false });
    let Result = new Object();
    for(let Item of Items)
    {
        Result[Item.name] = AMJS.Namespace.ReadCache(Item.name);
    }
    return Result;
}

/**
 * Writes content to a file only if it differs from existing content
 * @param {string} File - Target file path
 * @param {string} Content - Content to write
 * @throws {Error} If path exists but is not a file
 */
AMJS.Namespace.SmartWriteFile = function(File, Content)
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
AMJS.Namespace.GetProjectLinksDirectory = function()
{
    return path.join(AMJS.Namespace.GetDataDirectory(), "ProjectLinks");
}