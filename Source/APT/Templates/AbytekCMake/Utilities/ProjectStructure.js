
const path = require("path");

AMJS.Namespace.AProjectTypes =
{
    STANDALONE: "Standalone",
}

AMJS.Namespace.GetDefaultAProjectType = function(PlatformTags)
{
    return AMJS.Namespace.AProjectTypes.STANDALONE;
}

AMJS.Namespace.CalculateTopmostBuildDirectory = function(AbsoluteProjectEntryFile)
{
    return path.join(path.dirname(AbsoluteProjectEntryFile), "Build");
}

// Options
// - AbsoluteProjectEntryFile
// - PlatformTags
// - AProjectType
// - Generator
// - Config
AMJS.Namespace.CalculateBuildDirectory = function(Options)
{
    APT.Common.Assert(Options);
    const AbsoluteProjectEntryFile = APT.Common.Assert(Options.AbsoluteProjectEntryFile);
    const PlatformTags = APT.Common.Assert(Options.PlatformTags);
    const AProjectType = APT.Common.Assert(Options.AProjectType);
    const Config = APT.Common.Assert(Options.Config);
    const Generator = APT.Common.Assert(Options.Generator);

    const TopmostBuildDirectory = AMJS.Namespace.CalculateTopmostBuildDirectory(AbsoluteProjectEntryFile);

    return path.join(TopmostBuildDirectory, AProjectType, PlatformTags.sort().join("."), Generator, Config);
}

AMJS.Namespace.CalculateCMakeBuildDirectory = function(BuildDirectory, Generator, DirectConfig)
{
    if (Generator == APT.Templates.CMake.Utilities.Generators.VS2022)
    {
        return BuildDirectory;
    }
    if (Generator == APT.Templates.CMake.Utilities.Generators.CLION)
    {
        if (DirectConfig == APT.Templates.CMake.Utilities.Configs.DEBUG)
        {
            return path.join(BuildDirectory, "cmake-build-debug");
        }
        if (DirectConfig == APT.Templates.CMake.Utilities.Configs.RELEASE)
        {
            return path.join(BuildDirectory, "cmake-build-release");
        }
        if (DirectConfig == APT.Templates.CMake.Utilities.Configs.REL_WITH_DEB_INFO)
        {
            return path.join(BuildDirectory, "cmake-build-relwithdebinfo");
        }
        if (DirectConfig == APT.Templates.CMake.Utilities.Configs.MIN_SIZE_REL)
        {
            return path.join(BuildDirectory, "cmake-build-minsizerel");
        }
    }
    return BuildDirectory;
}