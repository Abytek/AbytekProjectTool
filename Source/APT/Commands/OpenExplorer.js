AMJS.Import("../Templates/Common/Utilities");

AMJS.Namespace.OpenExplorer = function(CommandManager)
{
    if (CommandManager.CLIInput.has("OpenExplorer"))
    {
        const path = require('path');
        const { execSync } = require('child_process');
        
        const MainProjectEntryDirectory = APT.Templates.Common.Utilities.GetDefaultProjectEntryDirectory();
        if (MainProjectEntryDirectory == null)
        {
            throw new Error("Invalid MainProjectEntryDirectory");
        }

        const { spawn } = require('child_process');
        const { platform } = require('os');
        
        function OpenFileExplorer(path) 
        {
            let explorerCommand;
            switch (platform()) {
                case 'win32':
                explorerCommand = 'explorer';
                break;
                case 'linux':
                explorerCommand = 'xdg-open'; // Common on many Linux distributions
                break;
                case 'darwin':
                explorerCommand = 'open'; // macOS
                break;
                default:
                console.error('Unsupported operating system.');
                return;
            }
            
            // Use { detached: true } and .unref() to allow the Node.js process to exit
            // independently of the opened file explorer window.
            const child = spawn(explorerCommand, [path], { detached: true });
            child.unref();
            
            child.on('error', (err) => {
                console.error(`Failed to open file explorer: ${err}`);
            });
        }

        OpenFileExplorer(MainProjectEntryDirectory);
        return true;
    }
    return false;
}

AMJS.Namespace.OpenExplorer.LogHelp = function(Logger)
{
    Logger.SetCommandName("OpenExplorer");
    Logger.SetAutomaticDetect(false);
    Logger.SetNeedMainProjectEntryDirectory(false);
    Logger.SetDescription("open the project in explorer");
}
