
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.Import("./ProjectStructure");

AMJS.Namespace.GenerateProjectFiles = function(ProjectStructure)
{
    let Project = ProjectStructure.Project;

    console.log(`<APT.Templates.UnrealEngine> Begin generating project files for ${Project.EntryDirectory}`);
    if (ProjectStructure.IsEngine)
    {
        execSync(
            `Setup.bat`, { 
                stdio: 'inherit',
                cwd: Project.EntryDirectory
            }
        );
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
    console.log(`<APT.Templates.UnrealEngine> Generated project files for ${Project.EntryDirectory} successfully`);
}