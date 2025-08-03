
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.Import("./ProjectStructure");

AMJS.Namespace.GenerateProjectFiles = function(ProjectStructure)
{
    let Project = ProjectStructure.Project;

    console.log(`<APT.Templates.UnrealEngine> Begin generating project files for ${Project.AbsoluteEntryFile}`);
    execSync(
        `GenerateProjectFiles.bat`, { 
            stdio: 'inherit',
            cwd: ProjectStructure.RootDirectory
        }
    );
    console.log(`<APT.Templates.UnrealEngine> Generated project files for ${Project.AbsoluteEntryFile} successfully`);
}