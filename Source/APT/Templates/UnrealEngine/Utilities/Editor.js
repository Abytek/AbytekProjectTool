const { execSync, execFile } = require('child_process');

AMJS.Namespace.OpenEditor = function(ProjectStructure)
{
    let UnrealBuildToolExecutableFile = ProjectStructure.IsEngine ? ProjectStructure.UnrealBuildToolExecutableFile : ProjectStructure.EngineProject.UnrealBuildToolExecutableFile;
    let UnrealEditorExecutableFile = ProjectStructure.IsEngine ? ProjectStructure.UnrealEditorExecutableFile : ProjectStructure.EngineProject.UnrealEditorExecutableFile;

    execSync(
        `${UnrealBuildToolExecutableFile} UnrealEditor Win64 ${ProjectStructure.Config}`, 
        { 
            stdio: 'inherit',
            cwd: ProjectStructure.MainDirectory
        }
    );

    let OpenEditorArgs = [];
    if (!ProjectStructure.IsEngine)
    {
        OpenEditorArgs.push(`"${ProjectStructure.UProjectFile}"`);
    }
    OpenEditorArgs.push('-skipcompile');

    execFile(
        UnrealEditorExecutableFile, 
        OpenEditorArgs, 
        { 
            stdio: 'inherit',
            cwd: ProjectStructure.MainDirectory
        }, 
        (error, stdout, stderr) => {
            if (error) {
                throw error;
            }
            console.log(stdout);
        }
    );
}