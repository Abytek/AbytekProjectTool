
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
        this.ShouldConfigureProject = APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.Common.ProjectComponents.ProjectStructure.ShouldConfigureProject",
            APT.Templates.Common.Utilities.GetDefaultShouldConfigureProjects()
        );
        this.SupportDebug = APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.Common.ProjectComponents.ProjectStructure.SupportDebug",
            APT.Templates.Common.Utilities.GetDefaultSupportDebug()
        );
        this.SupportOptimization = APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.Common.ProjectComponents.ProjectStructure.SupportOptimization",
            APT.Templates.Common.Utilities.GetDefaultSupportOptimization()
        );
        this.SupportMinSize = APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.Common.ProjectComponents.ProjectStructure.SupportMinSize",
            APT.Templates.Common.Utilities.GetDefaultSupportMinSize()
        );
    }
}