
const path = require('path');
const fs = require('fs');

AMJS.Namespace.CleanData = function(CommandManager)
{
    if (CommandManager.CLIInput.has("CleanData"))
    {
        const DataDir = APT.Common.GetDataDirectory();
        if (fs.existsSync(DataDir))
        {
            fs.rmSync(DataDir, { recursive: true });
        }
        return true;
    }
    return false;
}
AMJS.Namespace.CleanData.LogHelp = function(Logger)
{
    Logger.SetCommandName("CleanData");
    Logger.SetDescription("clean APT data (cache, dependencies, project links,...)");
}