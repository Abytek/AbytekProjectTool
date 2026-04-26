
const os = require("os");


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