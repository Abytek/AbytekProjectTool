
const path = require("path");

AMJS.Import("../Utilities/ProjectStructure");
AMJS.Import("../Utilities/Generator");
AMJS.Import("../../Common/ProjectComponents/ProjectStructure");

// Dependent components:
//
// Constructor-phase properties:
//      InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.Generator
//      InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.Config
//      InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.ExtraArguments
//
// Init-phase properties:
//      InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.SourceDirectory
//      InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.BuildDirectory
AMJS.Namespace.F_ProjectStructure = class extends APT.Core.A_ProjectComponent
{
    constructor(Project)
    {
        super(Project);

        let PlatformTags = Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_ProjectStructure).PlatformTags;

        this.Generator = APT.Common.ForwardString(
            APT.Common.TrySetPropertyByPath(
                Project.AdditionalOptions,
                "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.Generator",
                APT.Templates.CMake.Utilities.GetDefaultGenerator(PlatformTags)
            )
        );
        this.Config = APT.Common.ForwardString(
            APT.Common.TrySetPropertyByPath(
                Project.AdditionalOptions,
                "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.Config",
                APT.Templates.CMake.Utilities.GetDefaultConfig(this.Generator)
            )
        );
        this.Config = APT.Templates.CMake.Utilities.ParseConfig(
            this.Config,
            this.Generator,
            PlatformTags
        );
        this.ExtraArguments = APT.Common.FindPropertyByPath(
            this.Project.AdditionalOptions,
            "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.ExtraArguments"
        ) ?? [];
    }

    Init()
    {
        this.SourceDirectory = APT.Common.ForwardString(
            APT.Common.FindPropertyByPath(
                this.Project.AdditionalOptions,
                "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.SourceDirectory"
            ) ?? this.Project.EntryDirectory
        );
        const BuildDirectoryFromOptions = APT.Common.ForwardString(
            APT.Common.FindPropertyByPath(
                this.Project.AdditionalOptions,
                "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.BuildDirectory"
            )
        );
        // this.BuildDirectory = APT.Common.Assert(
        //     BuildDirectoryFromOptions,
        //     "requires InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.BuildDirectory"
        // );
        if (BuildDirectoryFromOptions)
        {
            this.BuildDirectory = BuildDirectoryFromOptions;
        }
        else
        {
            this.BuildDirectory = path.join(this.Project.EntryDirectory, "Build/CMake/Auto");
        }
    }
    Start()
    {
        let CommonProjectStruccture = this.Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_ProjectStructure);
        if (CommonProjectStruccture.ShouldConfigureProject && this.Project.IsMain)
        {
            APT.Templates.CMake.Utilities.GenerateProjectFiles(this);
        }
        if (APT.Templates.CMake.Utilities.ShouldBuildTargetOnThisProjectStructure(this))
        {
            const GlobalDefault = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault');
            let TargetToBuild = GlobalDefault.TargetToBuild;
            if (TargetToBuild == null)
            {
                throw new Error("requires GlobalDefault.TargetToBuild to build main project");
            }
            TargetToBuild = APT.Common.ForwardString(TargetToBuild[0]);
            let DirectConfig = GlobalDefault.DirectConfig;
            if (DirectConfig == null)
            {
                throw new Error("requires GlobalDefault.DirectConfig to build main project");
            }
            DirectConfig = APT.Common.ForwardString(DirectConfig[0]);
            APT.Templates.CMake.Utilities.Build(this, TargetToBuild, DirectConfig);
        }
    }
}