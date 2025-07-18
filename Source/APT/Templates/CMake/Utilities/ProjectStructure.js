
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
    CLion: "CLion",
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