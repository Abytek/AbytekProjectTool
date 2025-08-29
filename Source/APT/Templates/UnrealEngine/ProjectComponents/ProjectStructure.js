
const path = require("path");

AMJS.Import("../Utilities/ProjectStructure");
AMJS.Import("../Utilities/Generator");
AMJS.Import("../../Common/ProjectComponents/ProjectStructure");

// Dependent components:
//      APT.Templates.Common.ProjectComponents.F_ProjectStructure
//
// Constructor-phase properties:
//
// Init-phase properties:
//      APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.MainDirectory
AMJS.Namespace.F_ProjectStructure = class extends APT.Core.A_ProjectComponent
{
    constructor(Project)
    {
        super(Project);

        let CommonProjectStructure = Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_ProjectStructure);
    
        this.EngineProjectEntryDirectory = Project.AdditionalOptions.EngineProjectEntryDirectory;
        this.EngineProjectAdditionalOptions = Project.AdditionalOptions.EngineProjectAdditionalOptions;
    }

    Init()
    {
        this.MainDirectory = APT.Common.ForwardString(
            APT.Common.FindPropertyByPath(
                this.Project.AdditionalOptions,
                "APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.MainDirectory"
            ) ?? this.Project.EntryDirectory
        );

        this.UProjectFile = APT.Templates.UnrealEngine.Utilities.SearchUProjectFile(this.Project.EntryDirectory);
        this.IsEngine = (this.UProjectFile == null);

        if (this.IsEngine)
        {
            this.UnrealBuildToolExecutableFile = APT.Templates.UnrealEngine.Utilities.CalculateUnrealBuildToolExecutableFile(this.MainDirectory);
            this.UnrealEditorExecutableFile = APT.Templates.UnrealEngine.Utilities.CalculateUnrealEditorExecutableFile(this.MainDirectory);
        }
        else
        {
            if (!this.Project.AdditionalOptions.EngineProjectEntryDirectory)
            {
                throw new Error("Invalid engine project");
            }
        }
    }
    Start()
    {
        if (!this.IsEngine)
        {
            this.EngineProject = APT.Core.System.ProjectManager.ImportProject(AMJS.Module, this.EngineProjectEntryDirectory, this.EngineProjectAdditionalOptions);
        }
        if (this.Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_ProjectStructure).ShouldConfigureProject)
        {
            APT.Templates.UnrealEngine.Utilities.GenerateProjectFiles(this);
        }
    }
}