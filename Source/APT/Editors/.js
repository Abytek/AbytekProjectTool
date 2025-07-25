
AMJS.ImportSubnamespace("VisualStudio2022");
AMJS.ImportSubnamespace("VisualStudioCode");

AMJS.Namespace.GetDefaultEditor = function()
{
    return APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').Editor;
}

AMJS.Namespace.OpenEditor = function(Project, Editor)
{
    let ParsedEditor = Editor;
    if (ParsedEditor == null)
    {
        ParsedEditor = AMJS.Namespace.GetDefaultEditor();
    }

    if (ParsedEditor == "VisualStudio2022")
    {
        APT.Editors.VisualStudio2022.OpenEditor(Project);
        return true;
    }
    else if (ParsedEditor == "VisualStudioCode")
    {
        APT.Editors.VisualStudioCode.OpenEditor(Project);
        return true;
    }

    return false;
}