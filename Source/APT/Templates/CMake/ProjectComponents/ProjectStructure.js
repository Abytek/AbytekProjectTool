
AMJS.Import("../Utilities/ProjectStructure");
AMJS.Import("../Utilities/Generator");
AMJS.Import("../../Common/ProjectComponents/PlatformTags");

AMJS.Namespace.F_ProjectStructure = class extends APT.Core.A_ProjectComponent
{
    constructor(Project)
    {
        super(Project);

        let PlatformTags = Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_PlatformTags).Value;

        this.Config = APT.Common.ForwardString(
            APT.Common.TrySetPropertyByPath(
                Project.AdditionalOptions,
                "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.Config",
                APT.Templates.CMake.Utilities.GetDefaultConfig(PlatformTags)
            )
        );
        this.Generator = APT.Common.ForwardString(
            APT.Common.TrySetPropertyByPath(
                Project.AdditionalOptions,
                "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.Generator",
                APT.Templates.CMake.Utilities.GetDefaultGenerator(PlatformTags)
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
        this.SourceDirectoryPath = APT.Common.ForwardString(
            APT.Common.FindPropertyByPath(
                this.Project.AdditionalOptions,
                "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.SourceDirectoryPath"
            ) ?? this.Project.EntryDirectoryPath
        );
        this.BuildDirectoryPath = APT.Common.Assert(
            APT.Common.ForwardString(
                APT.Common.FindPropertyByPath(
                    this.Project.AdditionalOptions,
                    "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.BuildDirectoryPath"
                )
            ),
            "requires InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.BuildDirectoryPath"
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