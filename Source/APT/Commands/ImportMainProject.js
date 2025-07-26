
AMJS.Import("../Templates/Common/Utilities");

AMJS.Namespace.ImportMainProject = function(CommandManager)
{
    if (CommandManager.CLIInput.has("MainProjectEntryFile"))
    {
        const MainProjectEntryFile = APT.Templates.Common.Utilities.GetDefaultProjectEntryFile();
        if (MainProjectEntryFile == null)
        {
            throw new Error("Invalid MainProjectEntryFile");
        }
        
        let ProjectManager = CommandManager.System.ProjectManager;
        ProjectManager.ImportProject(null, MainProjectEntryFile);
        return true;
    }
    return false;
}