
AMJS.Import("../Utilities");

// Dependent components:
//
// Constructor-phase properties:
//      InstanceData.APT.Templates.Common.ProjectComponents.ProjectStructure.PlatformTags
//
// Init-phase properties:
AMJS.Namespace.F_ProjectStructure = class extends APT.Core.A_ProjectComponent
{
    constructor(Project)
    {
        super(Project);

        this.PlatformTags = APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.Common.ProjectComponents.ProjectStructure.PlatformTags",
            APT.Common.GetHostPlatformTags()
        );
        this.EnableDebug = APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.Common.ProjectComponents.ProjectStructure.EnableDebug",
            APT.Templates.Common.Utilities.GetDefaultEnableDebug()
        );
        this.EnableOptimization = APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.Common.ProjectComponents.ProjectStructure.EnableOptimization",
            APT.Templates.Common.Utilities.GetDefaultEnableOptimization()
        );
        this.EnableMinSize = APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.Common.ProjectComponents.ProjectStructure.EnableMinSize",
            APT.Templates.Common.Utilities.GetDefaultEnableMinSize()
        );
    }
}