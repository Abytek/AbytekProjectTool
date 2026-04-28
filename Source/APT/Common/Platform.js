
const os = require("os");


APT.Common.E_Platform = 
{
    AUTO: "Auto",
    WINDOWS: "Windows",
    MACOS: "macOS",
    IOS: "iOS",
    LINUX: "Linux",
    UNIX: "Unix",
    ANDROID: "Android",
    EMSCRIPTEN: "Emscripten"
}

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

APT.Common.GetHostPlatform = function()
{
    if (os.platform() == 'win32')
    {
        return APT.Common.E_Platform.WINDOWS;    
    }
    if (os.platform() == 'darwin')
    {
        return APT.Common.E_Platform.MACOS;
    }
    if (os.platform() == 'linux')
    {
        return APT.Common.E_Platform.LINUX;
    }
    if (
        (os.platform() == 'freebsd')
        || (os.platform() == 'openbsd')
        || (os.platform() == 'sunos')
    )
    {
        return APT.Common.E_PlatformTag.UNIX;
    }
    return null;
}
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

APT.Common.ParsePlatformTags = function(Platform)
{
    if (Platform == APT.Common.E_Platform.AUTO)
    {
        return [];
    }
    else if (Platform == APT.Common.E_Platform.WINDOWS)
    {
        return [
            APT.Common.E_PlatformTag.WINDOWS
        ];
    }
    else if (Platform == APT.Common.E_Platform.MACOS)
    {
        return [
            APT.Common.E_PlatformTag.MACOS,
            APT.Common.E_PlatformTag.UNIX,
            APT.Common.E_PlatformTag.POSIX
        ];
    }
    else if (Platform == APT.Common.E_Platform.IOS)
    {
        return [
            APT.Common.E_PlatformTag.IOS,
            APT.Common.E_PlatformTag.POSIX
        ];
    }
    else if (Platform == APT.Common.E_Platform.LINUX)
    {
        return [
            APT.Common.E_PlatformTag.LINUX,
            APT.Common.E_PlatformTag.POSIX
        ];
    }
    else if (Platform == APT.Common.E_Platform.ANDROID)
    {
        return [
            APT.Common.E_PlatformTag.ANDROID,
            APT.Common.E_PlatformTag.LINUX,
            APT.Common.E_PlatformTag.POSIX
        ];
    }
    else if (Platform == APT.Common.E_Platform.EMSCRIPTEN)
    {
        return [
            APT.Common.E_PlatformTag.EMSCRIPTEN,
            APT.Common.E_PlatformTag.POSIX,
            APT.Common.E_PlatformTag.WEB,
        ];
    }
    else
    {
        APT.FatalError("APT", `Unknown platform: ${Platform}`);
    }
}