
AMJS.ImportNamespace("../Utilities");
AMJS.ImportNamespace("../../CMake/ProjectComponents");

// Dependent components:
//
// Constructor-phase properties:
//
// Init-phase properties:
AMJS.Namespace.F_Support = class extends APT.Core.A_ProjectComponent
{
    constructor(Project)
    {
        super(Project);

        let PlatformTags = Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_ProjectStructure).PlatformTags;
        this.IsEnabled = PlatformTags.includes(APT.Common.PlatformTags.WINDOWS);
    }
    Init()
    {
    }
    
    GenerateActions(Actions)
    {
        Actions.push({
            Name: "Import (Windows)",
            Description: "Import (Windows)",
            ShouldRefreshPage: true,
            Commands: [
                `${this.Project.GenerateAPTCommandOnThis()} `
                + `:ProjectDefault.InstanceData.APT.Templates.Common.ProjectComponents.ProjectStructure.PlatformTags ${APT.Templates.Windows.Utilities.DefaultPlatformTags_AsString}`
            ],
            Category: "Base",
        });
        Actions.push({
            Name: "Refresh (Windows)",
            Description: "Refresh the project (Windows)",
            ShouldRefreshPage: true,
            Commands: [
                `${this.Project.GenerateAPTCommandOnThis()} `
                + `:GlobalDefault.ShouldConfigureProjects false `
                + `:ProjectDefault.InstanceData.APT.Templates.Common.ProjectComponents.ProjectStructure.PlatformTags ${APT.Templates.Windows.Utilities.DefaultPlatformTags_AsString}`
            ],
            Category: "Base"
        });
    }
}

APT.Core.RegisterPreImportProjectCallback(
    (Project) =>
    {
        if (
            Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_ProjectStructure).PlatformTags.includes(
                APT.Common.PlatformTags.WINDOWS
            )
        )
        {
            Project.EnsureComponent(AMJS.Namespace.F_Support);
        }
    }
);