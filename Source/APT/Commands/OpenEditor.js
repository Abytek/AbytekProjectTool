
AMJS.Import("../Editors");
AMJS.Import("../Templates/Common/Utilities");

AMJS.Namespace.OpenEditor = function(CommandManager)
{
    if (CommandManager.CLIInput.has("OpenEditor"))
    {
        const MainProjectEntryDirectory = APT.Templates.Common.Utilities.GetDefaultProjectEntryDirectory();
        if (MainProjectEntryDirectory == null)
        {
            throw new Error("Invalid MainProjectEntryDirectory");
        }
        
        let ProjectManager = CommandManager.System.ProjectManager;
        let Project = ProjectManager.ImportProject(null, [], MainProjectEntryDirectory);
        
        if (!APT.Editors.OpenEditor(Project))
        {
            throw new Error("Invalid editor");
        }
        return true;
    }
    return false;
}
AMJS.Namespace.OpenEditor.LogHelp = function(Logger)
{
    Logger.SetCommandName("OpenEditor");
    Logger.SetDescription("clean APT cache");
    Logger.SetDescription("import and open editor for the main project through its passed entry file CLI argument");
}