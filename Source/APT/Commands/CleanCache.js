
const path = require('path');
const fs = require('fs');

AMJS.Namespace.CleanCache = function(CommandManager)
{
    if (CommandManager.CLIInput.has("CleanCache"))
    {
        const CacheDir = APT.Common.GetCacheDirectory();
        if (fs.existsSync(CacheDir))
        {
            fs.rmdirSync(CacheDir, { recursive: true });
        }
        return true;
    }
    return false;
}