const { execSync, execFile, spawn } = require('child_process');

AMJS.Namespace.BuildEditor = function(ProjectStructure)
{
    APT.Log("APT.Templates.UnrealEngine", `Building Unreal Editor for ${ProjectStructure.MainDirectory}`);

    let UnrealBuildToolExecutableFile = ProjectStructure.IsEngine ? ProjectStructure.UnrealBuildToolExecutableFile : ProjectStructure.EngineProject.UnrealBuildToolExecutableFile;

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

    APT.Log("APT.Templates.UnrealEngine", `Unreal Editor was successfully built.`);
}
AMJS.Namespace.OpenEditor = function(ProjectStructure)
{
    APT.Log("APT.Templates.UnrealEngine", `Opening Unreal Editor for ${ProjectStructure.MainDirectory}`);
    
    let UnrealEditorExecutableFile = ProjectStructure.IsEngine ? ProjectStructure.UnrealEditorExecutableFile : ProjectStructure.EngineProject.UnrealEditorExecutableFile;

    let OpenEditorArgs = [];
    if (!ProjectStructure.IsEngine)
    {
        OpenEditorArgs.push(`"${ProjectStructure.UProjectFile}"`);
    }
    OpenEditorArgs.push('-skipcompile');

    const spawnOptions = {
        stdio: 'ignore',
        cwd: ProjectStructure.MainDirectory,
        detached: true,
        env: { ...process.env },
        shell: true // Use shell to execute commands
    };
    try
    {
        const proccess = spawn(
            UnrealEditorExecutableFile, 
            OpenEditorArgs, 
            spawnOptions
        );
        process.unref();
    }
    catch (error)
    {
        throw new Error(error);
    }
    APT.Log("APT.Templates.UnrealEngine", `Unreal Editor opened in ${ProjectStructure.MainDirectory}`);
}