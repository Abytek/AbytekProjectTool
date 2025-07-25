
AMJS.Import("../Editors");

AMJS.Namespace.OpenEditor = function(CommandManager)
{
    if (CommandManager.CLIInput.has("OpenEditor"))
    {
        const Slot = CommandManager.CLIInput.get("OpenEditor");
        if (Slot.length < 1)
        {
            throw new Error("Invalid editor");
        }
        if (Slot.length < 2)
        {
            throw new Error("Invalid project entry file");
        }

        const Editor = Slot[0];
        const ProjectEntryFile = Slot[1];
        
        let ProjectManager = CommandManager.System.ProjectManager;
        let Project = ProjectManager.ImportProject(null, ProjectEntryFile);
        
        if (Editor == "VisualStudio2022")
        {
            APT.Editors.VisualStudio2022.OpenEditor(Project);
            return true;
        }
        else if (Editor == "VisualStudioCode")
        {
            APT.Editors.VisualStudioCode.OpenEditor(Project);
            return true;
        }
        else if (Editor == "CLion")
        {
            APT.Editors.CLion.OpenEditor(Project);
            return true;
        }
        
        throw new Error(`Unknown editor ${Editor}`);
        return true;
    }
    return false;
}