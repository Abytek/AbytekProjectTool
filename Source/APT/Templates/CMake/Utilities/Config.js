
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