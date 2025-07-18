
AMJS.Namespace.Configs =
{
    GENERATOR_EXPRESSION: "GeneratorExpression",
    DEBUG: "Debug",
    RELEASE: "Release",
    REL_WITH_DEB_INFO: "RelWithDebInfo",
    MIN_SIZE_REL: "MinSizeRel"
}

AMJS.Namespace.GetDefaultConfig = function(PlatformTags)
{
    if (PlatformTags.includes(APT.Common.PlatformTags.WINDOWS))
    {
        return AMJS.Namespace.Configs.GENERATOR_EXPRESSION;
    }
    return AMJS.Namespace.Configs.DEBUG;
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
        (Config == AMJS.Namespace.Configs.GENERATOR_EXPRESSION)
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

AMJS.Namespace.IsConfigCompatibleWithGenerator = function(Config, Generator)
{
    if (
        (Config == AMJS.Namespace.Configs.GENERATOR_EXPRESSION)
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
    return (Config != null);
}

AMJS.Namespace.ParseConfig = function(Config, Generator, PlatformTags)
{
    if (AMJS.Namespace.IsConfigCompatibleWithGenerator(Config, Generator))
    {
        return Config;
    }
    return AMJS.Namespace.GetDefaultConfig(PlatformTags);
}