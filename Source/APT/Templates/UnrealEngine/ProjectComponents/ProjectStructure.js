
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
        
        this.AutomaticSetupEngine = APT.Common.ForwardBool(
            APT.Common.FindPropertyByPath(
                this.Project.AdditionalOptions,
                "APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.AutomaticSetupEngine"
            ) ?? this.IsEngine
        );
        this.AutomaticGenerateProjectFiles = APT.Common.ForwardBool(
            APT.Common.FindPropertyByPath(
                this.Project.AdditionalOptions,
                "APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.AutomaticGenerateProjectFiles"
            ) ?? true
        );
        
        this.Config = APT.Common.ForwardString(
            APT.Common.FindPropertyByPath(
                this.Project.AdditionalOptions,
                "APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.Config"
            ) ?? APT.Templates.UnrealEngine.Utilities.Configs.DEFAULT
        );

        let ThisComponent = this;
        let CheckIfProjectEntryDirectoryForCasting = function(PropertyPath)
        {
            let ProjectEntryDirectoryForCasting = APT.Common.ForwardString(
                APT.Common.FindPropertyByPath(
                    ThisComponent.Project.AdditionalOptions,
                    PropertyPath
                ) ?? ""
            );
            return path.normalize(ProjectEntryDirectoryForCasting) == path.normalize(ThisComponent.Project.EntryDirectory);
        }

        this.BuildEditor = (
            CheckIfProjectEntryDirectoryForCasting(
                "APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.ProjectEntryDirectoryForBuildingEditor"
            )
            && APT.Common.ForwardBool(
                APT.Common.FindPropertyByPath(
                    this.Project.AdditionalOptions,
                    "APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.BuildEditor"
                ) ?? false
            )
        );
        this.OpenEditor = (
            CheckIfProjectEntryDirectoryForCasting(
                "APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.ProjectEntryDirectoryForOpeningEditor"
            )
            && APT.Common.ForwardBool(
                APT.Common.FindPropertyByPath(
                    this.Project.AdditionalOptions,
                    "APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.OpenEditor"
                ) ?? false
            )
        );


        if (this.IsEngine)
        {
            this.UnrealBuildToolExecutableFile = APT.Templates.UnrealEngine.Utilities.CalculateUnrealBuildToolExecutableFile(this.MainDirectory);
            this.UnrealEditorExecutableFile = APT.Templates.UnrealEngine.Utilities.CalculateUnrealEditorExecutableFile(this.MainDirectory);
        }
        else
        {
            this.EngineProjectEntryDirectory = APT.Common.ForwardString(
                APT.Common.FindPropertyByPath(
                    this.Project.AdditionalOptions,
                    "APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.EngineProjectEntryDirectory"
                ) ?? false
            );
            this.EngineProjectAdditionalOptions = (
                APT.Common.FindPropertyByPath(
                    this.Project.AdditionalOptions,
                    "APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.EngineProjectAdditionalOptions"
                ) ?? new Object()
            );
            if (!this.EngineProjectEntryDirectory)
            {
                throw new Error("Invalid engine project");
            }
        }
    }
    Start()
    {
        if (!this.IsEngine)
        {
            this.EngineProject = APT.Core.System.ProjectManager.ImportProject(this.Project, [], this.EngineProjectEntryDirectory, this.EngineProjectAdditionalOptions);
        }
        if (this.Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_ProjectStructure).ShouldConfigureProject)
        {
            if (this.IsEngine)
            {
                if (this.AutomaticSetupEngine)
                {
                    APT.Templates.UnrealEngine.Utilities.SetupEngine(this);
                }
            }
            if (this.AutomaticGenerateProjectFiles)
            {
                APT.Templates.UnrealEngine.Utilities.GenerateProjectFiles(this);
            }
        }
        if (this.BuildEditor)
        {
            APT.Templates.UnrealEngine.Utilities.BuildEditor(this);
        }
        if (this.OpenEditor)
        {
            APT.Templates.UnrealEngine.Utilities.OpenEditor(this);
        }
    }

    GenerateActions(Actions)
    {
        if (this.IsEngine)
        {
            Actions.push(
                {
                    Name: "Setup Engine",
                    Description: "Setup engine",
                    Category: "[Unreal Engine] Build & Setup",
                    Commands: [
                        `${this.Project.GenerateAPTCommandOnThis()} `
                        + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.AutomaticSetupEngine true `
                        + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.AutomaticGenerateProjectFiles false `
                    ]
                }
            );
        }
        Actions.push(
            {
                Name: "Generate Project Files",
                Description: "Generate project files",
                Category: "[Unreal Engine] Build & Setup",
                Commands: [
                    `${this.Project.GenerateAPTCommandOnThis()} `
                    + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.AutomaticSetupEngine false `
                    + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.AutomaticGenerateProjectFiles true `
                ]
            }
        );
        Actions.push(
            {
                Name: "Build Unreal Editor",
                Description: "Build Unreal Editor",
                Category: "[Unreal Engine] Build & Setup",
                Commands: [
                    `${this.Project.GenerateAPTCommandOnThis()} `
                    + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.AutomaticSetupEngine false `
                    + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.AutomaticGenerateProjectFiles false `
                    + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.BuildEditor true `
                    + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.OpenEditor false `
                    + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.ProjectEntryDirectoryForBuildingEditor "${this.Project.EntryDirectory}" `
                ]
            }
        );
        Actions.push(
            {
                Name: "Open Unreal Editor",
                Description: "Open Unreal Editor",
                Category: "[Unreal Engine] Editors",
                Commands: [
                    `${this.Project.GenerateAPTCommandOnThis()} `
                    + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.AutomaticSetupEngine false `
                    + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.AutomaticGenerateProjectFiles false `
                    + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.BuildEditor true `
                    + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.OpenEditor true `
                    + `:ProjectDefault.APT.Templates.UnrealEngine.ProjectComponents.ProjectStructure.ProjectEntryDirectoryForOpeningEditor "${this.Project.EntryDirectory}" `
                ]
            }
        );
        Actions.push(
            {
                Name: "Open Visual Studio 2022",
                Description: "Open Visual Studio 2022",
                Category: "[Unreal Engine] Editors",
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
                Category: "[Unreal Engine] Editors",
                Commands: [
                    `${this.Project.GenerateAPTCommandOnThis()} `
                    + `:OpenEditor `
                    + `:GlobalDefault.Editor VisualStudio2026 `
                    + `:GlobalDefault.ShouldConfigureProjects false `
                ]
            }
        );
        Actions.push(
            {
                Name: "Open Visual Studio Code",
                Description: "Open Visual Studio Code",
                Category: "[Unreal Engine] Editors",
                Commands: [
                    `${this.Project.GenerateAPTCommandOnThis()} `
                    + `:OpenEditor `
                    + `:GlobalDefault.Editor VisualStudioCode `
                    + `:GlobalDefault.ShouldConfigureProjects false `
                ]
            }
        );
    }
}