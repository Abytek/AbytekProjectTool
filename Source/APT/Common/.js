
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

AMJS.Namespace.ForwardOption = function(Key, Value)
{
    let CommandManager = APT.Core.System.CommandManager;
    const CLIInput = CommandManager.CLIInput;
    if (CLIInput.has(Key))
    {
        return CLIInput.get(Key);
    }
    return Value;
}