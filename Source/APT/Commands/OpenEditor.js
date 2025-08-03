
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
AMJS.Namespace.OpenEditor.LogHelp = function(Logger)
{
    Logger.SetCommandName("OpenEditor");
    Logger.SetDescription("clean APT cache");
    Logger.SetDescription("import and open editor for the main project through its passed entry file CLI argument");
}