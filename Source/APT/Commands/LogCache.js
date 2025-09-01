
const path = require('path');
const fs = require('fs');

AMJS.Namespace.LogCache = function(CommandManager)
{
    if (CommandManager.CLIInput.has("LogCache"))
    {
        let AllCache = APT.Common.GatherCache();
        APT.Log("APT", "APT Cache:");
        APT.Log("APT", AllCache);
        return true;
    }
    return false;
}
AMJS.Namespace.LogCache.LogHelp = function(Logger)
{
    Logger.SetCommandName("LogCache");
    Logger.SetDescription("log APT cache");
}