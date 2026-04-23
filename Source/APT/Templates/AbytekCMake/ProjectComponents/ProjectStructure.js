
const path = require("path");

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

        this.IsEngine = (APT.Templates.AbytekCMake.Utilities.GetEngineProject() == this.Project);

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
            Generator,
            EnvironmentName: Project.EnvironmentName
        };
        const BuildDirectoryConfig = APT.Templates.AbytekCMake.Utilities.CalculateBuildDirectoryConfig(CalculateBuildDirectoryParams);
        const BuildDirectory = APT.Common.ForwardString(
            APT.Common.TrySetPropertyByPath(
                Project.AdditionalOptions,
                "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.BuildDirectory",
                BuildDirectoryConfig.Path
            )
        );
        this.BuildDirectory = BuildDirectory;
        this.BuildDirectorySignature = BuildDirectoryConfig.Signature;
        this.BuildDirectorySignatureHash = BuildDirectoryConfig.SignatureHash;

        this.DefaultDirectConfig = APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.AbytekCMake.ProjectComponents.ProjectStructure.DefaultDirectConfig",
            APT.Templates.CMake.Utilities.GetDefaultDirectConfig()
        );

        this.Project.EnsureComponent(
            APT.Templates.Windows.ProjectComponents.F_Support
        );
        this.Project.EnsureComponent(
            APT.Templates.Android.ProjectComponents.F_Support
        );
        
        if (this.IsEngine)
        {
            APT.Templates.AbytekCMake.Utilities.CleanCMakeDefinitionsFile(this);
        }

        APT.Templates.AbytekCMake.Utilities.AddCMakeDefinition(
            "ABYTEK_ENGINE_ENVIRONMENT_NAME",
            Project.EnvironmentName
        );
        APT.Templates.AbytekCMake.Utilities.AddCMakeDefinition(
            "ABYTEK_APROJECT_TYPE",
            AProjectType
        );
        APT.Templates.AbytekCMake.Utilities.AddCMakeDefinition(
            "ABYTEK_CMAKE_CONFIG",
            Config
        );
        APT.Templates.AbytekCMake.Utilities.AddCMakeDefinition(
            "ABYTEK_CMAKE_GENERATOR",
            Generator
        );
    }
    Init()
    {
        if (APT.Templates.AbytekCMake.Utilities.ShouldGenerateCMakeLists(this))
        {
            APT.Templates.AbytekCMake.Utilities.GenerateCMakeLists(this);
        }
        APT.Templates.AbytekCMake.Utilities.GenerateBuildDirectorySignatureFile(this);
        APT.Templates.AbytekCMake.Utilities.GenerateEnginePathFile(this);
    }
    
    GenerateActions(Actions)
    {
        Actions.push(
            {
                Name: "Open Visual Studio 2022",
                Description: "Open Visual Studio 2022",
                Category: "Abytek",
                Commands: [
                    `${this.Project.GenerateAPTCommandOnThis()} `
                    + `:OpenEditor `
                    + `:GlobalDefault.Editor VisualStudio2022 `
                    + `:GlobalDefault.ShouldConfigureProjects false `
                ]
            }
        );
        Actions.push(
            {
                Name: "Open Visual Studio 2026",
                Description: "Open Visual Studio 2026",
                Category: "Abytek",
                Commands: [
                    `${this.Project.GenerateAPTCommandOnThis()} `
                    + `:OpenEditor `
                    + `:GlobalDefault.Editor VisualStudio2026 `
                    + `:GlobalDefault.ShouldConfigureProjects false `
                ]
            }
        );
    }
}