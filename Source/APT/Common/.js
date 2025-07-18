
const os = require("os");

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
    EMSCRIPTEN: "Emscripten"
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