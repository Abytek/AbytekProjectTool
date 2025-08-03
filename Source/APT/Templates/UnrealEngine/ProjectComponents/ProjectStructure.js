
const path = require("path");

AMJS.Import("../Utilities/ProjectStructure");
AMJS.Import("../Utilities/Generator");
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

        let CommonProjectStructure = Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_ProjectStructure);
    }

    Init()
    {
        this.RootDirectory = APT.Common.ForwardString(
            APT.Common.FindPropertyByPath(
                this.Project.AdditionalOptions,
                "InstanceData.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.RootDirectory"
            ) ?? this.Project.EntryDirectory
        );

        this.UProjectFile = APT.Templates.UnrealEngine.Utilities.SearchUProjectFile(this.RootDirectory);
        this.IsEngine = (this.UProjectFile == null);
    }
    Start()
    {
        APT.Templates.UnrealEngine.Utilities.GenerateProjectFiles(this);
    }
}