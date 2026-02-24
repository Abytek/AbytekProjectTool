
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
        this.IsEnabled = PlatformTags.includes(APT.Common.PlatformTags.ANDROID);
    }
    Init()
    {
    }
    
    GenerateActions(Actions)
    {
        Actions.push(
            {
                Name: "Import",
                Description: "Import",
                ShouldRefreshPage: true,
                Category: "Android",
                Commands: [
                    `${this.Project.GenerateAPTCommandOnThis()} `
                    + `:ProjectDefault.InstanceData.APT.Templates.Common.ProjectComponents.ProjectStructure.PlatformTags ${APT.Templates.Android.Utilities.DefaultPlatformTags_AsString}`
                ]
            }
        );
    }
}