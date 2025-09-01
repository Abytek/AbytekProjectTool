
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.Import("./CommonGenerator");

AMJS.Namespace.GenerateProjectFiles_UnixMakefiles = function(ProjectStructure)
{
    execSync(
        `cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=${
            ProjectStructure.Config
        } -S "${
            ProjectStructure.SourceDirectory
        }" -B "${
            ProjectStructure.BuildDirectory
        }" ${
            ProjectStructure.ExtraArguments.join(' ')
        } ${
            APT.Templates.CMake.Utilities.GetCommonArguments()
        }`, { 
            stdio: 'inherit' 
        }
    );
    APT.Log("APT.Templates.CMake", "Unix Makefiles project files generated successfully");
}