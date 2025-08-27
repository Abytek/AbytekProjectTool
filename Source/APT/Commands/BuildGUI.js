AMJS.Import("../Templates/Common/Utilities");

AMJS.Namespace.BuildGUI = function(CommandManager)
{
    if (CommandManager.CLIInput.has("BuildGUI"))
    {
        const path = require('path');
        const { execSync } = require('child_process');
        
        // Get the GUI directory path relative to the current script
        const guiPath = path.join(__dirname, '../../../GUI');
        
        try {
            console.log('Installing GUI dependencies...');
            execSync(`cd "${guiPath}" && npm install`, { stdio: 'inherit' });
            console.log('Dependencies installed successfully');
            
            // Build the GUI
            console.log('Building GUI...');
            execSync(`cd "${guiPath}" && npm run build`, { stdio: 'inherit' });
            console.log('GUI built successfully');
        } catch (error) {
            console.error('Error building GUI:', error.message);
            throw error;
        }

        return true;
    }
    return false;
}

AMJS.Namespace.BuildGUI.LogHelp = function(Logger)
{
    Logger.SetCommandName("BuildGUI");
    Logger.SetAutomaticDetect(false);
    Logger.SetNeedMainProjectEntryFile(false);
    Logger.SetDescription("build the APT GUI web interface for production use");
}
