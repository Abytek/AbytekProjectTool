
AMJS.Namespace.ImportMainProject = function(CommandManager)
{
    if (CommandManager.CLIInput.has("main_project_entry_file_path"))
    {
        const Slot = CommandManager.CLIInput.get("main_project_entry_file_path");
        if (Slot.length != 1)
        {
            throw new Error("Invalid main_project_entry_file_path");
        }

        const MainProjectEntryFilePath = Slot[0];
        
        let ProjectManager = CommandManager.System.ProjectManager;
        ProjectManager.ImportProject(null, MainProjectEntryFilePath);
    }
}