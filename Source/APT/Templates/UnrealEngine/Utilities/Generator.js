
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.Import("./ProjectStructure");

AMJS.Namespace.SetupEngine = function(ProjectStructure)
{
    let Project = ProjectStructure.Project;

    APT.Log("APT.Templates.UnrealEngine", `Begin setting up engine ${Project.EntryDirectory}`);
    if (!ProjectStructure.IsEngine)
    {
        throw new Error(`Project is not an engine ${Project.EntryDirectory}`);
    }
    execSync(
        `Setup.bat`, { 
            stdio: 'inherit',
            cwd: Project.EntryDirectory
        }
    );
    APT.Log("APT.Templates.UnrealEngine", `Setup engine ${Project.EntryDirectory} successfully`);
}

AMJS.Namespace.GenerateProjectFiles = function(ProjectStructure)
{
    let Project = ProjectStructure.Project;

    APT.Log("APT.Templates.UnrealEngine", `Begin generating project files for ${Project.EntryDirectory}`);
    if (ProjectStructure.IsEngine)
    {
        execSync(
            `GenerateProjectFiles.bat`, { 
                stdio: 'inherit',
                cwd: Project.EntryDirectory
            }
        );
    }
    else
    {
        let EngineProject = ProjectStructure.EngineProject;
        let EngineProjectStructure = EngineProject.GetComponent(APT.Templates.UnrealEngine.ProjectComponents.F_ProjectStructure);
        
        const UnrealBuildToolExecutableFile = EngineProjectStructure.UnrealBuildToolExecutableFile;

        execSync(
            `${UnrealBuildToolExecutableFile} -projectfiles -project="${ProjectStructure.UProjectFile}" -game -rocket -progress`, { 
                stdio: 'inherit',
                cwd: ProjectStructure.MainDirectory
            }
        );
    }
    APT.Log("APT.Templates.UnrealEngine", `Generated project files for ${Project.EntryDirectory} successfully`);
}