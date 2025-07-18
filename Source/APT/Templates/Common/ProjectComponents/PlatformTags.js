
AMJS.Namespace.F_PlatformTags = class extends APT.Core.A_ProjectComponent
{
    constructor(Project)
    {
        super(Project);

        this.Value = APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.Common.ProjectComponents.PlatformTags.Value",
            APT.Common.GetHostPlatformTags()
        );
    }
}