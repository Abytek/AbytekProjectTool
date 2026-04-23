
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.Namespace.ShouldBuildTargetOnThisProjectStructure = function(ProjectStructure)
{
    const GlobalDefault = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault');
    return (
        ProjectStructure.Project.IsMain
        && APT.Common.ForwardBool(GlobalDefault.BuildTargetOnMainProject)
    );
}

AMJS.Namespace.Build = function(ProjectStructure, TargetName, DirectConfig)
{
    if (ProjectStructure == null)
    {
        throw new Error(`Invalid project structure`);
    }
    if (TargetName == null)
    {
        throw new Error(`Invalid target name`);
    }

    let CMakeBuildDirectory = APT.Templates.CMake.Utilities.CalculateCMakeBuildDirectory(
        ProjectStructure.BuildDirectory, 
        ProjectStructure.Generator,
        DirectConfig
    );

    let TargetNameArgument = `--target ${TargetName}`;   
        
    execSync(
        `cmake --build "${CMakeBuildDirectory}" --config "${DirectConfig}" ${TargetNameArgument}
        `, { 
            stdio: 'inherit' 
        }
    );
    APT.Log("APT.Templates.AbytekCMake", `Built ${ProjectStructure.Project.EntryDirectory} (Config: ${DirectConfig})`);
}