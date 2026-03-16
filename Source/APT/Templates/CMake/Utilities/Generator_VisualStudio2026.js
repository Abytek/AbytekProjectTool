
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.Import("./CommonGenerator");

AMJS.Namespace.GenerateProjectFiles_VisualStudio2026 = function(ProjectStructure)
{
    execSync(
        `cmake -G "Visual Studio 18 2026" -S "${
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
    APT.Log("APT.Templates.CMake", "Visual Studio 2026 project files generated successfully");
}