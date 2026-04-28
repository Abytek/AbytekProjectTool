
const path = require("path");
const { execSync } = require("child_process");

APT.Extensions.CMake.E_Config = {
    AUTO: "Auto",
    DEBUG: "Debug",
    RELEASE: "Release",
    REL_WITH_DEB_INFO: "RelWithDebInfo",
    MIN_SIZE_REL: "MinSizeRel",
};

APT.Extensions.CMake.E_Generator = {
    VISUAL_STUDIO_2026: "VisualStudio2026",
    VISUAL_STUDIO_2022: "VisualStudio2022",
    NINJA: "Ninja",
    UNIX_MAKEFILES: "UnixMakefiles",
};

APT.Extensions.CMake.GetDefaultConfig = function()
{
    return APT.Extensions.CMake.E_Config.DEBUG;
}
APT.Extensions.CMake.GetDefaultConfigForGenerator = function(Generator)
{
    if (Generator == APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2026)
    {
        return APT.Extensions.CMake.E_Config.AUTO;
    }
    else if (Generator == APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2022)
    {
        return APT.Extensions.CMake.E_Config.AUTO;
    }
    else if (Generator == APT.Extensions.CMake.E_Generator.NINJA)
    {
        return GetDefaultConfig();
    }
    else if (Generator == APT.Extensions.CMake.E_Generator.UNIX_MAKEFILES)
    {
        return GetDefaultConfig();
    }
    APT.FatalError("APT", `Unknown generator: ${Generator}`);
}

APT.Extensions.CMake.GetDefaultGenerator = function(PlatformTags)
{
    if (PlatformTags == null)
    {
        PlatformTags = APT.Common.GetHostPlatformTags();
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
    {
        let InstalledVSVersions = APT.Common.GetInstalledVSVersions();
        if (InstalledVSVersions.includes("2026"))
        {
            return APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2026;
        }
        if (InstalledVSVersions.includes("2022"))
        {
            return APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2022;
        }
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.MACOS))
    {
        return APT.Extensions.CMake.E_Generator.XCODE;
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
    {
        return APT.Extensions.CMake.E_Generator.NINJA;
    }
    return APT.Extensions.CMake.E_Generator.UNIX_MAKEFILES;
}

APT.Extensions.CMake.IsConfigCompatibleWithGenerator = function(Config, Generator)
{
    if (Config == APT.Extensions.CMake.AUTO)
    {
        if (
            (Generator == APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2022)
            || (Generator == APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2026)
        )
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    return true;
}

APT.Extensions.CMake.ParseConfig = function(Config, Generator, PlatformTags)
{
    if (APT.Extensions.CMake.IsConfigCompatibleWithGenerator(Config, Generator))
    {
        return Config;
    }
    return APT.Extensions.CMake.GetDefaultConfig(PlatformTags);
}