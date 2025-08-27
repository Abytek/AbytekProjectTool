
const path = require('path');
const fs = require('fs');

AMJS.Namespace.CleanCache = function(CommandManager)
{
    if (CommandManager.CLIInput.has("CleanCache"))
    {
        const CacheDir = APT.Common.GetCacheDirectory();
        if (fs.existsSync(CacheDir))
        {
            fs.rmSync(CacheDir, { recursive: true });
        }
        return true;
    }
    return false;
}
AMJS.Namespace.CleanCache.LogHelp = function(Logger)
{
    Logger.SetCommandName("CleanCache");
    Logger.SetDescription("clean APT cache");
}