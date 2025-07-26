
AMJS.Import("../Editors");
AMJS.Import("../Templates/Common/Utilities");

AMJS.Namespace.OpenEditor = function(CommandManager)
{
    if (CommandManager.CLIInput.has("OpenEditor"))
    {
        const MainProjectEntryFile = APT.Templates.Common.Utilities.GetDefaultProjectEntryFile();
        if (MainProjectEntryFile == null)
        {
            throw new Error("Invalid MainProjectEntryFile");
        }
        
        let ProjectManager = CommandManager.System.ProjectManager;
        let Project = ProjectManager.ImportProject(null, MainProjectEntryFile);
        
        if (!APT.Editors.OpenEditor(Project))
        {
            throw new Error("Invalid editor");
        }
        return true;
    }
    return false;
}