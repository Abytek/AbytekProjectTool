
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
    let DefaultEnableDebug = APT.Templates.Common.Utilities.GetDefaultEnableDebug();
    let DefaultEnableOptimization = APT.Templates.Common.Utilities.GetDefaultEnableOptimization();
    let DefaultEnableMinSize = APT.Templates.Common.Utilities.GetDefaultEnableMinSize();

    if (DefaultEnableOptimization)
    {
        if (DefaultEnableDebug)
        {
            return AMJS.Namespace.Configs.REL_WITH_DEB_INFO;
        }
        else
        {
            if (DefaultEnableMinSize)
            {
                return AMJS.Namespace.Configs.MIN_SIZE_REL;
            }
            else
            {
                return AMJS.Namespace.Configs.RELEASE;
            }
        }
    }
    else
    {
        if (DefaultEnableDebug)
        {
            return AMJS.Namespace.Configs.DEBUG;
        }
    }
    return AMJS.Namespace.Configs.DEBUG;
}
AMJS.Namespace.GetDefaultConfig = function(Generator)
{
    if (
        (Generator == AMJS.Namespace.Generators.VS2022)
        || (Generator == AMJS.Namespace.Generators.CLION)
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
    CLION: "CLion",
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
            || (Generator == AMJS.Namespace.Generators.CLION)
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