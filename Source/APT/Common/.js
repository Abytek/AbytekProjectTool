
const os = require("os");
const path = require("path");
const fs = require("fs");

AMJS.Namespace.Assert = function(Value, ...Args)
{
    if (!Value)
    {
        throw new Error(...Args);
        return null;
    }
    return Value;
}

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

AMJS.Namespace.SimpleDeepCopy = function(Value)
{
    return JSON.parse(
        JSON.stringify(Value)
    );
}

AMJS.Namespace.GetCacheDirectory = function()
{
    return path.join(__dirname, "../../../Data/Cache");
}
AMJS.Namespace.CalculateCacheFile = function(Key)
{
    return path.join(AMJS.Namespace.GetCacheDirectory(), Key);
}
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
AMJS.Namespace.TryCache = function(Key, Value)
{
    return AMJS.Namespace.Cache(Key, Value, false);
}
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
    fs.unlinkSync(CacheFile, Value);
    return true;
}
AMJS.Namespace.TryUncache = function(Key)
{
    return AMJS.Namespace.Uncache(Key, false);
}
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
    return fs.readFileSync(CacheFile);
}
AMJS.Namespace.TryReadCache = function(Key)
{
    return AMJS.Namespace.ReadCache(Key, false);
}