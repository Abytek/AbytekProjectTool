
AMJS.ImportNamespace("../Utilities");
AMJS.ImportNamespace("../../CMake/ProjectComponents");

// Dependent components:
//      APT.Templates.Common.ProjectComponents.F_PlatformTags
//      APT.Templates.CMake.ProjectComponents.F_ProjectStructure
//
// Constructor-phase properties:
//      InstanceData.APT.Templates.AbytekCMake.ProjectComponents.ProjectStructure.AProjectType
//
// Init-phase properties:
AMJS.Namespace.F_ProjectStructure = class extends APT.Core.A_ProjectComponent
{
    constructor(Project)
    {
        super(Project);

        let PlatformTags = Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_ProjectStructure).PlatformTags;
        let CMakeProjectStructure = Project.EnsureComponent(APT.Templates.CMake.ProjectComponents.F_ProjectStructure);
        let Config = CMakeProjectStructure.Config;
        let Generator = CMakeProjectStructure.Generator;

        const AProjectType = APT.Common.ForwardString(
            APT.Common.TrySetPropertyByPath(
                Project.AdditionalOptions,
                "InstanceData.APT.Templates.AbytekCMake.ProjectComponents.ProjectStructure.AProjectType",
                APT.Templates.AbytekCMake.Utilities.GetDefaultAProjectType(PlatformTags)
            )
        );
        this.AProjectType = AProjectType;

        let CalculateBuildDirectoryParams =
        {
            ProjectEntryDirectory: Project.EntryDirectory,
            PlatformTags,
            AProjectType,
            Config,
            Generator
        };
        const BuildDirectory = APT.Common.ForwardString(
            APT.Common.TrySetPropertyByPath(
                Project.AdditionalOptions,
                "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.BuildDirectory",
                APT.Templates.AbytekCMake.Utilities.CalculateBuildDirectory(CalculateBuildDirectoryParams)
            )
        );

        this.DefaultDirectConfig = APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.AbytekCMake.ProjectComponents.ProjectStructure.DefaultDirectConfig",
            APT.Templates.CMake.Utilities.GetDefaultDirectConfig()
        );
    }
    Init()
    {
        if (APT.Templates.AbytekCMake.Utilities.ShouldGenerateCMakeLists(this))
        {
            APT.Templates.AbytekCMake.Utilities.GenerateCMakeLists(this);
        }
    }
}