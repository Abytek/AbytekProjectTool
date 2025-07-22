
AMJS.Namespace.ImportMainProject = function(CommandManager)
{
    if (CommandManager.CLIInput.has("MainProjectEntryFile"))
    {
        const Slot = CommandManager.CLIInput.get("MainProjectEntryFile");
        if (Slot.length != 1)
        {
            throw new Error("Invalid MainProjectEntryFile");
        }

        const MainProjectEntryFile = Slot[0];
        
        let ProjectManager = CommandManager.System.ProjectManager;
        ProjectManager.ImportProject(null, MainProjectEntryFile);
    }
}