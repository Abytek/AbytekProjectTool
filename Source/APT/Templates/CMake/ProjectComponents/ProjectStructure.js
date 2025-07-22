
const path = require("path");

AMJS.Import("../Utilities/ProjectStructure");
AMJS.Import("../Utilities/Generator");
AMJS.Import("../../Common/ProjectComponents/ProjectStructure");

// Dependent components:
//
// Constructor-phase properties:
//      InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.Generator
//      InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.Config
//
// Init-phase properties:
//      InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.SourceDirectory
//      InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.BuildDirectory
//      InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.ExtraArguments
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
    }

    Init()
    {
        this.SourceDirectory = APT.Common.ForwardString(
            APT.Common.FindPropertyByPath(
                this.Project.AdditionalOptions,
                "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.SourceDirectory"
            ) ?? this.Project.EntryDirectory
        );
        this.BuildDirectory = APT.Common.Assert(
            APT.Common.ForwardString(
                APT.Common.FindPropertyByPath(
                    this.Project.AdditionalOptions,
                    "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.BuildDirectory"
                )
            ),
            "requires InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.BuildDirectory"
        );
        this.ExtraArguments = APT.Common.FindPropertyByPath(
            this.Project.AdditionalOptions,
            "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.ExtraArguments"
        ) ?? [];
    }
    Start()
    {
        APT.Templates.CMake.Utilities.GenerateProjectFiles(this);
    }
}