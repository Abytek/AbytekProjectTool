
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
    }
}