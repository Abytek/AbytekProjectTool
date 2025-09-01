
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.Import("./CommonGenerator");

AMJS.Namespace.GenerateProjectFiles_VisualStudio2022 = function(ProjectStructure)
{
    execSync(
        `cmake -G "Visual Studio 17 2022" -S "${
            ProjectStructure.SourceDirectory
        }" -B "${
            ProjectStructure.BuildDirectory
        }" ${
            ProjectStructure.ExtraArguments.join(' ')
        } ${
            APT.Templates.CMake.Utilities.GetCommonArguments()
        }
        `, { 
            stdio: 'inherit' 
        }
    );
    APT.Log("APT.Templates.CMake", "Visual Studio 2022 project files generated successfully");
}