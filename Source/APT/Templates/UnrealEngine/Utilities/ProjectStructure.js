
const path = require('path');
const fs = require('fs');

AMJS.Namespace.SearchUProjectFile = function(EntryDirectory)
{
    let UProjectFile = null;
    const Items = fs.readdirSync(
        EntryDirectory,
        { withFileTypes: true, recursive: false }
    );

    for(let Item of Items)
    {
        const AbsoluteItem = path.join(EntryDirectory, Item.name);
        if (path.extname(Item.name) == '.uproject')
        {
            UProjectFile = AbsoluteItem;
            return UProjectFile;
        }
    }
    return null;
}

AMJS.Namespace.CalculateUnrealBuildToolExecutableFile = MainDirectory => path.join(MainDirectory, "Binaries/DotNET/UnrealBuildTool/UnrealBuildTool.exe");
AMJS.Namespace.CalculateUnrealEditorExecutableFile = MainDirectory => path.join(MainDirectory, "Binaries/Win64/UnrealEditor.exe");