
AMJS.Import("../Templates/Common/Utilities");

AMJS.Namespace.ImportMainProject = function(CommandManager)
{
    if (CommandManager.CLIInput.has("MainProjectEntryDirectory"))
    {
        const MainProjectEntryDirectory = APT.Templates.Common.Utilities.GetDefaultProjectEntryDirectory();
        if (MainProjectEntryDirectory == null)
        {
            console.warn("No main project entry file specified");
            return false;
        }
        
        let ProjectManager = CommandManager.System.ProjectManager;
        ProjectManager.ImportProject([], MainProjectEntryDirectory);
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