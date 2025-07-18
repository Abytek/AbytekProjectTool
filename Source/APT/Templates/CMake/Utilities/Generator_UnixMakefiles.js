
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.Namespace.GenerateProjectFiles_UnixMakefiles = function(ProjectStructure)
{
    execSync(
        `cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=${
            ProjectStructure.Config
        } -S "${
            ProjectStructure.SourceDirectoryPath
        }" -B "${
            ProjectStructure.BuildDirectoryPath
        }" ${
            ProjectStructure.ExtraArguments.join(' ')
        }`, { 
            stdio: 'inherit' 
        }
    );
    console.log("Unix Makefiles project files generated successfully");
}