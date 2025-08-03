
const path = require("path");

AMJS.Import("../Utilities/ProjectStructure");
AMJS.Import("../../Common/ProjectComponents/ProjectStructure");

// Dependent components:
//      APT.Templates.Common.ProjectComponents.F_ProjectStructure
//
// Constructor-phase properties:
//      InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.SourceDirectory
//
// Init-phase properties:
AMJS.Namespace.F_ProjectStructure = class extends APT.Core.A_ProjectComponent
{
    constructor(Project)
    {
        super(Project);

        let PlatformTags = Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_ProjectStructure).PlatformTags;

        this.SourceDirectory = APT.Common.ForwardString(
            APT.Common.FindPropertyByPath(
                this.Project.AdditionalOptions,
                "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.SourceDirectory"
            ) ?? this.Project.EntryDirectory
        );
    }

    Init()
    {
    }
    Start()
    {
    }
}