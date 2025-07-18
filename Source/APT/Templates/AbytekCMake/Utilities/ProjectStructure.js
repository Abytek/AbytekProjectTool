
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
    const AProjectType = APT.Common.Assert(Options.AProjectType);
    const Config = APT.Common.Assert(Options.Config);
    const Generator = APT.Common.Assert(Options.Generator);

    const TopmostBuildDirectoryPath = AMJS.Namespace.CalculateTopmostBuildDirectoryPath(AbsoluteProjectEntryFilePath);

    return path.join(TopmostBuildDirectoryPath, AProjectType, PlatformTags.sort().join("."), Generator, Config);
}