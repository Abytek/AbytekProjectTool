AMJS.Import("../Editors");
AMJS.Import("../Templates/Common/Utilities");

AMJS.Namespace.OpenGUI = function(CommandManager)
{
    if (CommandManager.CLIInput.has("OpenGUI"))
    {
        const path = require('path');
        const { execSync, spawn } = require('child_process');
        
        // Get the GUI directory path relative to the current script
        const guiPath = path.join(__dirname, '../../../GUI');
        
        try {
            // Check if we need to install serve
            try {
                execSync('npm list -g serve', { stdio: 'ignore' });
            } catch {
                // serve is not installed globally, install it
                APT.Log("APT", 'Installing serve package globally...');
                execSync('npm install -g serve', { stdio: 'inherit' });
            }

            // Check if development or production
            const isProduction = process.env.NODE_ENV === 'production';
            const port = isProduction ? 5000 : 3000;
            const browserUrl = `http://localhost:${port}`;
            let server;

            if (isProduction) {
                // Check if build exists
                const fs = require('fs');
                const buildPath = path.join(guiPath, 'build');
                if (!fs.existsSync(buildPath)) {
                    APT.Log("APT", 'Production build not found. Please run "apt :BuildGUI" first.');
                    return true;
                }
                
                // Start production server using serve
                APT.Log("APT", `Starting production server on port ${port}...`);
                const serveCmd = process.platform === 'win32' ? 'serve.cmd' : 'serve';
                server = spawn(serveCmd, ['-s', buildPath, '-l', port], {
                    stdio: 'inherit',
                    shell: true,
                    windowsHide: true
                });
                
                APT.Log("APT", 'Starting production server...');
            } else {
                // Start development server using npm
                APT.Log("APT", `Starting development server on port ${port}...`);
                const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
                server = spawn(npmCmd, ['run', 'dev'], {
                    cwd: guiPath,
                    stdio: 'inherit',
                    shell: true,
                    windowsHide: true
                });
                
                APT.Log("APT", 'Starting development server...');
            }
            
            APT.Core.System.AutomaticExit = false;

            // Handle server cleanup on exit
            process.on('SIGINT', () => {
                APT.Log("APT", `Shutting down ${isProduction ? 'production' : 'development'} server...`);
                server.kill();
                process.exit(0);
            });
        } catch (error) {
            console.error('Error starting GUI:', error.message);
            throw error;
        }

        return true;
    }
    return false;
}

AMJS.Namespace.OpenGUI.LogHelp = function(Logger)
{
    Logger.SetCommandName("OpenGUI");
    Logger.SetAutomaticDetect(false);
    Logger.SetNeedMainProjectEntryDirectory(false);
    Logger.SetDescription("launch the APT GUI web interface");
}
