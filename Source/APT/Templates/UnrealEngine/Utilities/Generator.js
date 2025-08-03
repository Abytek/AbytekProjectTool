
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.Import("./ProjectStructure");

AMJS.Namespace.GenerateProjectFiles = function(ProjectStructure)
{
    let Project = ProjectStructure.Project;

    console.log(`<APT.Templates.UnrealEngine> Begin generating project files for ${Project.AbsoluteEntryFile}`);
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
        
        const UnrealBuildToolExecutable = EngineProjectStructure.UnrealBuildToolExecutable;

        execSync(
            `${UnrealBuildToolExecutable} -projectfiles -project="${ProjectStructure.UProjectFile}" -game -rocket -progress`, { 
                stdio: 'inherit',
                cwd: ProjectStructure.MainDirectory
            }
        );
    }
    console.log(`<APT.Templates.UnrealEngine> Generated project files for ${Project.AbsoluteEntryFile} successfully`);
}