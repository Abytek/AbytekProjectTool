
AMJS.ImportNamespace("../Utilities");

AMJS.Namespace.F_ProjectStructure = class extends APT.Core.A_ProjectComponent
{
    constructor(Project)
    {
        super(Project);

        let PlatformTags = Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_PlatformTags).Value;

        let CalculateBuildDirectoryPathParams =
        {
            AbsoluteProjectEntryFilePath: Project.AbsoluteEntryFilePath,
            PlatformTags
        };
        this.BuildDirectoryPath = APT.Templates.AbytekCMake.Utilities.CalculateBuildDirectoryPath(CalculateBuildDirectoryPathParams);
    }
}