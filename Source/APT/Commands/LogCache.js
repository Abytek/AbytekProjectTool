
const path = require('path');
const fs = require('fs');

AMJS.Namespace.LogCache = function(CommandManager)
{
    if (CommandManager.CLIInput.has("LogCache"))
    {
        let AllCache = APT.Common.GatherCache();
        console.log("APT Cache:");
        console.log(AllCache);
        return true;
    }
    return false;
}
AMJS.Namespace.LogCache.LogHelp = function(Logger)
{
    Logger.SetCommandName("LogCache");
    Logger.SetDescription("log APT cache");
}