
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.Namespace.GenerateProjectFiles_VisualStudio2022 = function(ProjectStructure)
{
    execSync(
        `cmake -G "Visual Studio 17 2022" -S "${
            ProjectStructure.SourceDirectoryPath
        }" -B "${
            ProjectStructure.BuildDirectoryPath
        }" ${
            ProjectStructure.ExtraArguments.join(' ')
        }`, { 
            stdio: 'inherit' 
        }
    );
    console.log("Visual Studio 2022 project files generated successfully");
}