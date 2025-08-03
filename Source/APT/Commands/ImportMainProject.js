
AMJS.Import("../Templates/Common/Utilities");

AMJS.Namespace.ImportMainProject = function(CommandManager)
{
    if (CommandManager.CLIInput.has("MainProjectEntryFile"))
    {
        const MainProjectEntryFile = APT.Templates.Common.Utilities.GetDefaultProjectEntryFile();
        if (MainProjectEntryFile == null)
        {
            console.warn("No main project entry file specified");
            return false;
        }
        
        let ProjectManager = CommandManager.System.ProjectManager;
        ProjectManager.ImportProject(null, MainProjectEntryFile);
        return true;
    }
    return false;
}
AMJS.Namespace.ImportMainProject.LogHelp = function(Logger)
{
    Logger.SetCommandName("ImportMainProject");
    Logger.SetAutomaticDetect(true);
    Logger.SetDescription("import the main project through its passed entry file CLI argument");
}