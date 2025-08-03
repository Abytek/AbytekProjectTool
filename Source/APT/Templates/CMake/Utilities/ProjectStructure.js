
const path = require("path");

AMJS.Namespace.Configs =
{
    AUTO: "Auto",
    DEBUG: "Debug",
    RELEASE: "Release",
    REL_WITH_DEB_INFO: "RelWithDebInfo",
    MIN_SIZE_REL: "MinSizeRel",

    DEFAULT_DIRECT: "Debug",
}

AMJS.Namespace.GetDefaultDirectConfig = function()
{
    let DefaultSupportDebug = APT.Templates.Common.Utilities.GetDefaultSupportDebug();
    let DefaultSupportOptimization = APT.Templates.Common.Utilities.GetDefaultSupportOptimization();
    let DefaultSupportMinSize = APT.Templates.Common.Utilities.GetDefaultSupportMinSize();

    if (DefaultSupportOptimization || (!DefaultSupportDebug))
    {
        if (DefaultSupportDebug)
        {
            return AMJS.Namespace.Configs.REL_WITH_DEB_INFO;
        }
        else
        {
            if (DefaultSupportMinSize)
            {
                return AMJS.Namespace.Configs.MIN_SIZE_REL;
            }
            else
            {
                return AMJS.Namespace.Configs.RELEASE;
            }
        }
    }
    return AMJS.Namespace.Configs.DEBUG;
}
AMJS.Namespace.GetDefaultConfig = function(Generator)
{
    if (
        (Generator == AMJS.Namespace.Generators.VS2022)
    )
    {
        return AMJS.Namespace.Configs.AUTO;
    }
    return AMJS.Namespace.GetDefaultDirectConfig();
}
AMJS.Namespace.EnsureDirectConfig = function(Config)
{
    if (
        (Config == AMJS.Namespace.Configs.AUTO)
    )
    {
        return AMJS.Namespace.GetDefaultDirectConfig();
    }
    return Config;
}

AMJS.Namespace.Generators =
{
    VS2022: "VisualStudio2022",
    UNIX_MAKE_FILES: "UnixMakefiles",
    XCODE: "Xcode",
    NINJA: "Ninja",
}

AMJS.Namespace.GetDefaultGenerator = function(PlatformTags)
{
    if (PlatformTags.includes(APT.Common.PlatformTags.WINDOWS))
    {
        return AMJS.Namespace.Generators.VS2022;
    }
    if (PlatformTags.includes(APT.Common.PlatformTags.MACOS))
    {
        return AMJS.Namespace.Generators.XCODE;
    }
    return AMJS.Namespace.Generators.UNIX_MAKE_FILES;
}

AMJS.Namespace.IsConfigCompatibleWithGenerator = function(Config, Generator)
{
    if (
        (Config == AMJS.Namespace.Configs.AUTO)
    )
    {
        if (
            (Generator == AMJS.Namespace.Generators.VS2022)
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

AMJS.Namespace.ParseConfig = function(Config, Generator, PlatformTags)
{
    if (AMJS.Namespace.IsConfigCompatibleWithGenerator(Config, Generator))
    {
        return Config;
    }
    return AMJS.Namespace.GetDefaultConfig(PlatformTags);
}

AMJS.Namespace.CalculateCMakeParentBuildDirectory = function(BuildDirectory, Generator)
{
    return BuildDirectory;
}

AMJS.Namespace.CalculateCMakeBuildDirectory = function(BuildDirectory, Generator, DirectConfig)
{
    return AMJS.Namespace.CalculateCMakeParentBuildDirectory(BuildDirectory, Generator);
}