
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