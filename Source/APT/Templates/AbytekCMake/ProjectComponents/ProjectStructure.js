
AMJS.ImportNamespace("../Utilities");
AMJS.ImportNamespace("../../CMake/ProjectComponents");

AMJS.Namespace.F_ProjectStructure = class extends APT.Core.A_ProjectComponent
{
    constructor(Project)
    {
        super(Project);

        let PlatformTags = Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_PlatformTags).Value;
        let CMakeProjectStructure = Project.EnsureComponent(APT.Templates.CMake.ProjectComponents.F_ProjectStructure);
        let Config = CMakeProjectStructure.Config;
        let Generator = CMakeProjectStructure.Generator;

        const AProjectType = APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.AbytekCMake.ProjectComponents.ProjectStructure.AProjectType",
            APT.Templates.AbytekCMake.Utilities.GetDefaultAProjectType(PlatformTags)
        );
        this.AProjectType = AProjectType;

        let CalculateBuildDirectoryPathParams =
        {
            AbsoluteProjectEntryFilePath: Project.AbsoluteEntryFilePath,
            PlatformTags,
            AProjectType,
            Config,
            Generator
        };
        const BuildDirectoryPath = APT.Templates.AbytekCMake.Utilities.CalculateBuildDirectoryPath(CalculateBuildDirectoryPathParams);
        APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.BuildDirectoryPath",
            BuildDirectoryPath
        )
    }
}