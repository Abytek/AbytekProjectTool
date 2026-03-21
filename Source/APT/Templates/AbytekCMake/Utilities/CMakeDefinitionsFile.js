
const path = require("path");
const fs = require("fs");

AMJS.Import("./GetEngineProject");

AMJS.Namespace.GetCMakeDefinitionsFile = function()
{
    return path.join(
       APT.Common.GetPropertyByPath(
            APT.Templates.AbytekCMake.Utilities.GetEngineProject().AdditionalOptions,
            "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.BuildDirectory"
       ), 
        "Abytek", 
        "CMakeDefinitions.txt"
    );
}
AMJS.Namespace.CleanCMakeDefinitionsFile = function()
{
    const CMakeDefinitionFile = AMJS.Namespace.GetCMakeDefinitionsFile();
    if (fs.existsSync(CMakeDefinitionFile))
    {
        fs.unlinkSync(CMakeDefinitionFile);
    }

    fs.mkdirSync(
        path.dirname(CMakeDefinitionFile),
        { recursive: true }
    );
    fs.writeFileSync(
        CMakeDefinitionFile,
        ""
    );
}
AMJS.Namespace.AddCMakeDefinition = function(Key, Value)
{
    const File = AMJS.Namespace.GetCMakeDefinitionsFile();
    fs.appendFileSync(
        File,
        `${Key}\n${Value}\n`
    );
}