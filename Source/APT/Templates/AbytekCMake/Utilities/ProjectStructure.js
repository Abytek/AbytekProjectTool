
const path = require("path");

AMJS.Namespace.AProjectTypes =
{
    STANDALONE: "Standalone",
    OPERATOR: "Operator",
    NODE: "Node"
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
    const AProjectType = Options.AProjectType ?? AMJS.Namespace.GetDefaultAProjectType(PlatformTags);
    const Config = Options.Config ?? APT.Templates.CMake.Utilities.GetDefaultConfig(PlatformTags);
    const Generator = Options.Config ?? APT.Templates.CMake.Utilities.GetDefaultGenerator(PlatformTags);

    const TopmostBuildDirectoryPath = AMJS.Namespace.CalculateTopmostBuildDirectoryPath(AbsoluteProjectEntryFilePath);

    return path.join(TopmostBuildDirectoryPath, AProjectType, PlatformTags.sort().join("."), Generator, Config);
}