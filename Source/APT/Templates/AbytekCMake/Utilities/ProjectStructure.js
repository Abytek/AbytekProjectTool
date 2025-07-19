
const path = require("path");

AMJS.Namespace.AProjectTypes =
{
    STANDALONE: "Standalone",
}

AMJS.Namespace.GetDefaultAProjectType = function(PlatformTags)
{
    return AMJS.Namespace.AProjectTypes.STANDALONE;
}

AMJS.Namespace.CalculateTopmostBuildDirectoryPath = function(AbsoluteProjectEntryFilePath)
{
    return path.join(path.dirname(AbsoluteProjectEntryFilePath), "Build");
}

// Options
// - AbsoluteProjectEntryFilePath
// - PlatformTags
// - AProjectType
// - Generator
// - Config
AMJS.Namespace.CalculateBuildDirectoryPath = function(Options)
{
    APT.Common.Assert(Options);
    const AbsoluteProjectEntryFilePath = APT.Common.Assert(Options.AbsoluteProjectEntryFilePath);
    const PlatformTags = APT.Common.Assert(Options.PlatformTags);
    const AProjectType = APT.Common.Assert(Options.AProjectType);
    const Config = APT.Common.Assert(Options.Config);
    const Generator = APT.Common.Assert(Options.Generator);

    const TopmostBuildDirectoryPath = AMJS.Namespace.CalculateTopmostBuildDirectoryPath(AbsoluteProjectEntryFilePath);

    return path.join(TopmostBuildDirectoryPath, AProjectType, PlatformTags.sort().join("."), Generator, Config);
}

AMJS.Namespace.CalculateCMakeBuildDirectoryPath = function(BuildDirectoryPath, Generator, DirectConfig)
{
    if (Generator == APT.Templates.CMake.Utilities.Generators.VS2022)
    {
        return Project.BuildDirectoryPath;
    }
    if (Generator == APT.Templates.CMake.Utilities.Generators.CLION)
    {
        if (Config == APT.Templates.CMake.Utilities.Configs.DEBUG)
        {
            return path.join(BuildDirectoryPath, "cmake-build-debug");
        }
        if (Config == APT.Templates.CMake.Utilities.Configs.RELEASE)
        {
            return path.join(BuildDirectoryPath, "cmake-build-release");
        }
        if (Config == APT.Templates.CMake.Utilities.Configs.REL_WITH_DEB_INFO)
        {
            return path.join(BuildDirectoryPath, "cmake-build-relwithdebinfo");
        }
        if (Config == APT.Templates.CMake.Utilities.Configs.MIN_SIZE_REL)
        {
            return path.join(BuildDirectoryPath, "cmake-build-minsizerel");
        }
    }
    return BuildDirectoryPath;
}