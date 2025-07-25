
AMJS.Import("../Editors");

AMJS.Namespace.OpenEditor = function(CommandManager)
{
    if (CommandManager.CLIInput.has("OpenEditor"))
    {
        const Slot = CommandManager.CLIInput.get("OpenEditor");
        if (Slot.length != 1)
        {
            throw new Error("Invalid project entry file");
        }

        const ProjectEntryFile = Slot[0];
        
        let ProjectManager = CommandManager.System.ProjectManager;
        let Project = ProjectManager.ImportProject(null, ProjectEntryFile);
        
        if (!APT.Editors.OpenEditor(Project))
        {
            throw new Error("Invalid editor");
        }
        return true;
    }
    return false;
}