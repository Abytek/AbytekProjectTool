
const path = require("path");

AMJS.Namespace.AProjectTypes =
{
    STANDALONE: "Standalone",
}

AMJS.Namespace.GetDefaultAProjectType = function(PlatformTags)
{
    return AMJS.Namespace.AProjectTypes.STANDALONE;
}

AMJS.Namespace.CalculateTopmostBuildDirectory = function(ProjectEntryDirectory)
{
    return path.join(ProjectEntryDirectory, "Build");
}

// Options
// - ProjectEntryDirectory
// - PlatformTags
// - AProjectType
// - Generator
// - Config
AMJS.Namespace.CalculateBuildDirectory = function(Options)
{
    APT.Common.Assert(Options);
    const ProjectEntryDirectory = APT.Common.Assert(Options.ProjectEntryDirectory);
    const PlatformTags = APT.Common.Assert(Options.PlatformTags);
    const AProjectType = APT.Common.Assert(Options.AProjectType);
    const Config = APT.Common.Assert(Options.Config);
    const Generator = APT.Common.Assert(Options.Generator);

    const TopmostBuildDirectory = AMJS.Namespace.CalculateTopmostBuildDirectory(ProjectEntryDirectory);

    return path.join(TopmostBuildDirectory, AProjectType, PlatformTags.sort().join("."), Generator, Config);
}