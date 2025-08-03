
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