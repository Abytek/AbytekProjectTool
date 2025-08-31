const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Convert = require('ansi-to-html');

// Import APT modules
const AMJS = require("../../Submodules/AbytekModuleJS/Source/AMJS/.js");

// Initialize APT Module System
const ModuleSystem = new AMJS.F_ModuleSystem();
ModuleSystem.SourceDirectories = [
    require('path').join(__dirname, '../../Source/APT')
];

// Import and initialize APT
const APT = ModuleSystem.Import([], ".js");
const System = new APT.Core.F_System();
APT.Core.System = System;

// Configure system defaults before starting
System.CommandManager.CLIInput.get("GlobalDefault").ShouldConfigureProjects = false;

// Start the system
System.AutomaticExit = false;
System.Start();

// Helper function to get environment config directory
const getEnvironmentConfigDir = (projectDirectoryPath) => {
    const absoluteDirectoryPath = path.resolve(projectDirectoryPath);
    const projectFilePath = path.join(absoluteDirectoryPath, 'APTProject.js');
    const projectPreset = APT.Core.System.ProjectManager.GenerateProjectPreset(projectFilePath);
    console.log(projectPreset);
    return path.join(absoluteDirectoryPath, projectPreset.EnvironmentConfigDirectory);
};

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const convert = new Convert();
const port = 3001; // Different from React dev server port

app.use(cors());
app.use(express.json());

// Get project data
app.get('/api/project/:projectPath', (req, res) => {
    console.log(`[API] GET /api/project/${req.params.projectPath}`);
    try {
        const projectDirectoryPath = decodeURIComponent(req.params.projectPath);
        const absoluteDirectoryPath = path.resolve(projectDirectoryPath);
        const projectFilePath = path.join(absoluteDirectoryPath, 'APTProject.js');
        
        if (!fs.existsSync(absoluteDirectoryPath)) {
            console.log(`[API] Project directory not found: ${absoluteDirectoryPath}`);
            return res.status(404).json({ error: 'Project directory not found' });
        }

        // Get project name from directory
        const projectName = path.basename(absoluteDirectoryPath);
        console.log(`[API] Reading project: ${projectName}`);
        
        // Get environment configs if they exist
        let envConfigs = {};
        const configPath = getEnvironmentConfigDir(projectDirectoryPath);
        if (fs.existsSync(configPath)) {
            // Read all JSON files in the Environment directory
            const files = fs.readdirSync(configPath);
            const envFiles = files.filter(file => file.endsWith('.json'));
            
            envFiles.forEach(file => {
                const envPath = path.join(configPath, file);
                const envName = path.parse(file).name;
                try {
                    const config = JSON.parse(fs.readFileSync(envPath, 'utf8'));
                    // Add _parentConfig field for UI if Parent exists
                    envConfigs[envName] = {
                        ...config,
                        _parentConfig: config.Parent // Add special field for UI
                    };
                    console.log(`[API] Loaded environment config: ${envName}`);
                } catch (err) {
                    console.error(`[API] Error loading environment config ${envName}:`, err);
                }
            });
        }

        // Try to load APT project metadata
        let projectMetadata = {
            name: projectName,
            entryDirectory: absoluteDirectoryPath
        };

        try {
            // Use APT system to generate project link for git details
            const projectLink = APT.Core.System.ProjectManager.GenerateProjectLink(absoluteDirectoryPath);
            console.log(`[API] Generated project link:`, APT.Common.NiceJSONStringify(projectLink));
            
            // Extract git details if available
            if (projectLink.GitDetails) {
                projectMetadata.gitDetails = {
                    remoteUrl: projectLink.GitDetails.RemoteURL,
                    branch: projectLink.GitDetails.Branch,
                    commit: projectLink.GitDetails.Commit
                };
            }

            // Try to get additional metadata from project preset if APTProject.js exists
            if (fs.existsSync(projectFilePath)) {
                try {
                    const projectPreset = APT.Core.System.ProjectManager.GenerateProjectPreset(projectFilePath);
                    console.log(`[API] Generated project preset:`, APT.Common.NiceJSONStringify(projectPreset));
                    
                    // Extract template information
                    if (projectPreset.TemplateInfo) {
                        projectMetadata.templateInfo = projectPreset.TemplateInfo;
                    }

                    // Extract prototype information  
                    if (projectPreset.PrototypeInfo) {
                        projectMetadata.prototypeInfo = projectPreset.PrototypeInfo;
                    }

                    // Extract components if available
                    if (projectPreset.Components && Array.isArray(projectPreset.Components)) {
                        projectMetadata.components = projectPreset.Components.map(component => ({
                            type: component.Type || 'Unknown',
                            data: component.Data || {}
                        }));
                    }
                } catch (presetError) {
                    console.warn(`[API] Could not extract project preset:`, presetError.message);
                }
            }

            console.log(`[API] Extracted project metadata:`, APT.Common.NiceJSONStringify(projectMetadata));
        } catch (error) {
            console.warn(`[API] Could not extract APT project metadata:`, error.message);
            // Continue with basic metadata
        }

        const response = {
            project: projectMetadata,
            environments: envConfigs
        };
        console.log(`[API] Sending project response for: ${projectName}`, APT.Common.NiceJSONStringify(response));
        res.json(response);
    } catch (error) {
        console.error(`[API] Error in /api/project:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Get cache data
app.get('/api/cache', (req, res) => {
    console.log(`[API] GET /api/cache`);
    try {
        // Use APT's built-in cache gathering function
        const cacheData = APT.Common.GatherCache();
        console.log(`[API] Found ${Object.keys(cacheData).length} cache entries`);
        console.log(`[API] Cache response data:`, APT.Common.NiceJSONStringify(cacheData));
        res.json(cacheData);
    } catch (error) {
        // If cache directory doesn't exist, return empty object
        if (error.message && error.message.includes('no such file or directory')) {
            console.log(`[API] Cache directory does not exist yet`);
            const emptyResponse = {};
            console.log(`[API] Cache response data (empty):`, APT.Common.NiceJSONStringify(emptyResponse));
            res.json(emptyResponse);
        } else {
            console.error(`[API] Error in /api/cache:`, error);
            const errorResponse = { error: error.message };
            console.log(`[API] Cache error response:`, APT.Common.NiceJSONStringify(errorResponse));
            res.status(500).json(errorResponse);
        }
    }
});

// Update cache entry
app.put('/api/cache/:key', (req, res) => {
    console.log(`[API] PUT /api/cache/${req.params.key}`);
    try {
        const { key } = req.params;
        const value = req.body.value;

        // Delete existing cache if it exists
        if (APT.Common.HasCache(key)) {
            APT.Common.Uncache(key, false);
        }

        // Write new cache value
        APT.Common.Cache(key, value, false);
        console.log(`[API] Updated cache entry: ${key}`);
        res.json({ success: true });
    } catch (error) {
        console.error(`[API] Error updating cache:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Delete cache entry
app.delete('/api/cache/:key', (req, res) => {
    console.log(`[API] DELETE /api/cache/${req.params.key}`);
    try {
        const { key } = req.params;
        APT.Common.Uncache(key, false);
        console.log(`[API] Deleted cache entry: ${key}`);
        res.json({ success: true });
    } catch (error) {
        console.error(`[API] Error deleting cache:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Get project links
app.get('/api/project-links', (req, res) => {
    console.log(`[API] GET /api/project-links`);
    try {
        // Use the proper method to load project links
        const projectLinks = APT.Core.System.ProjectManager.LoadProjectLinks();
        
        // Transform the links into our API format, filtering out invalid entries
        const formattedLinks = projectLinks
            .filter(link => link.EntryDirectory && typeof link.EntryDirectory === 'string')
            .map(link => ({
                path: link.EntryDirectory,
                name: path.basename(link.EntryDirectory),
                type: link.GitDetails ? 'Git' : 'Local',
                entryDirectory: link.EntryDirectory,
                gitDetails: link.GitDetails
            }));

        console.log(`[API] Found ${formattedLinks.length} project links`);
        console.log(`[API] Project links response data:`, APT.Common.NiceJSONStringify(formattedLinks));
        res.json(formattedLinks);
    } catch (error) {
        console.error(`[API] Error in /api/project-links:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Resolve project link
app.get('/api/resolve-project-link', (req, res) => {
    console.log(`[API] GET /api/resolve-project-link`, req.query);
    try {
        // Parse GitDetails if it's a string
        const dependency = { ...req.query };
        if (typeof dependency.GitDetails === 'string') {
            try {
                dependency.GitDetails = JSON.parse(dependency.GitDetails);
            } catch (e) {
                console.error('[API] Failed to parse GitDetails:', e);
            }
        }
        console.log('[API] Searching for project link with dependency:', dependency);
        
        const projectLink = APT.Core.System.ProjectManager.SearchProjectLink(dependency);
        
        if (projectLink && projectLink.EntryDirectory && typeof projectLink.EntryDirectory === 'string') {
            console.log(`[API] Found project link:`, projectLink);
            const response = {
                success: true,
                projectLink: {
                    entryDirectory: projectLink.EntryDirectory,
                    type: projectLink.Type || 'Unknown'
                }
            };
            console.log(`[API] Resolve project link response:`, APT.Common.NiceJSONStringify(response));
            res.json(response);
        } else {
            console.log(`[API] No project link found for:`, dependency);
            const response = {
                success: false,
                error: 'No matching project link found'
            };
            console.log(`[API] Resolve project link response:`, APT.Common.NiceJSONStringify(response));
            res.json(response);
        }
    } catch (error) {
        console.error(`[API] Error resolving project link:`, error);
        res.status(500).json({ error: error.message });
    }
});



// Get config names
app.get('/api/project/:projectPath/configs', (req, res) => {
    console.log(`[API] GET /api/project/${req.params.projectPath}/configs`);
    try {
        const projectDirectoryPath = decodeURIComponent(req.params.projectPath);
        const absoluteDirectoryPath = path.resolve(projectDirectoryPath);
        const projectFilePath = path.join(absoluteDirectoryPath, 'APTProject.js');
        
        if (!fs.existsSync(absoluteDirectoryPath)) {
            return res.status(404).json({ error: 'Project directory not found' });
        }

        // Read config directory
        const configPath = getEnvironmentConfigDir(projectDirectoryPath);
        if (fs.existsSync(configPath)) {
            const files = fs.readdirSync(configPath);
            const configNames = files
                .filter(file => file.endsWith('.json'))
                .map(file => path.parse(file).name);
            const response = configNames.length > 0 ? configNames : ['Base'];
            console.log(`[API] Config names response:`, APT.Common.NiceJSONStringify(response));
            res.json(response);
        } else {
            const response = ['Base'];
            console.log(`[API] Config names response (default):`, APT.Common.NiceJSONStringify(response));
            res.json(response);
        }
    } catch (error) {
        console.error(`[API] Error getting config names:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Get config
app.get('/api/project/:projectPath/configs/:name', (req, res) => {
    console.log(`[API] GET /api/project/${req.params.projectPath}/configs/${req.params.name}`);
    try {
        const projectDirectoryPath = decodeURIComponent(req.params.projectPath);
        const absoluteDirectoryPath = path.resolve(projectDirectoryPath);
        const projectFilePath = path.join(absoluteDirectoryPath, 'APTProject.js');
        const { name } = req.params;
        
        if (!fs.existsSync(absoluteDirectoryPath)) {
            return res.status(404).json({ error: 'Project directory not found' });
        }

        // Read the config file
        const configPath = path.join(getEnvironmentConfigDir(projectDirectoryPath), `${name}.json`);
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            // Add _parentConfig field for UI if Parent exists
            const response = {
                ...config,
                _parentConfig: config.Parent // Add special field for UI
            };
            console.log(`[API] Config '${name}' response:`, APT.Common.NiceJSONStringify(response));
            res.json(response);
        } else if (name === 'Base') {
            // Return default Base config
            const defaultConfig = {
                Dependencies: {},
                GlobalDefault: {},
                ProjectDefault: {}
            };
            console.log(`[API] Config '${name}' response (default):`, APT.Common.NiceJSONStringify(defaultConfig));
            res.json(defaultConfig);
        } else {
            const errorResponse = { error: 'Config file not found' };
            console.log(`[API] Config '${name}' error response:`, APT.Common.NiceJSONStringify(errorResponse));
            res.status(404).json(errorResponse);
        }
    } catch (error) {
        console.error(`[API] Error getting config:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Add config
app.post('/api/project/:projectPath/configs/:name', (req, res) => {
    console.log(`[API] POST /api/project/${req.params.projectPath}/configs/${req.params.name}`, req.body);
    try {
        const projectDirectoryPath = decodeURIComponent(req.params.projectPath);
        const absoluteDirectoryPath = path.resolve(projectDirectoryPath);
        const projectFilePath = path.join(absoluteDirectoryPath, 'APTProject.js');
        const { name } = req.params;
        const { config } = req.body;
        
        if (!fs.existsSync(absoluteDirectoryPath)) {
            return res.status(404).json({ error: 'Project directory not found' });
        }

        if (!config) {
            return res.status(400).json({ error: 'Missing required field: config' });
        }

        // Create config directory if it doesn't exist
        const configDir = getEnvironmentConfigDir(projectDirectoryPath);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        // Write the new config file, converting _parentConfig to Parent if it exists
        const configPath = path.join(configDir, `${name}.json`);
        const configToSave = { ...config };
        if ('_parentConfig' in configToSave) {
            configToSave.Parent = configToSave._parentConfig;
            delete configToSave._parentConfig;
        }
        fs.writeFileSync(configPath, JSON.stringify(configToSave, null, 2));

        res.json({ success: true });
    } catch (error) {
        console.error(`[API] Error adding config:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Delete config
app.delete('/api/project/:projectPath/configs/:name', (req, res) => {
    console.log(`[API] DELETE /api/project/${req.params.projectPath}/configs/${req.params.name}`);
    try {
        const projectDirectoryPath = decodeURIComponent(req.params.projectPath);
        const absoluteDirectoryPath = path.resolve(projectDirectoryPath);
        const projectFilePath = path.join(absoluteDirectoryPath, 'APTProject.js');
        const { name } = req.params;
        
        if (!fs.existsSync(absoluteDirectoryPath)) {
            return res.status(404).json({ error: 'Project directory not found' });
        }

        // Delete the config file
        const configPath = path.join(getEnvironmentConfigDir(projectDirectoryPath), `${name}.json`);
        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Config file not found' });
        }
    } catch (error) {
        console.error(`[API] Error deleting config:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Get project actions
app.get('/api/project/:projectPath/actions', (req, res) => {
    console.log(`[API] GET /api/project/${req.params.projectPath}/actions`);
    try {
        const projectDirectoryPath = decodeURIComponent(req.params.projectPath);
        const absoluteDirectoryPath = path.resolve(projectDirectoryPath);
        
        if (!fs.existsSync(absoluteDirectoryPath)) {
            return res.status(404).json({ error: 'Project directory not found' });
        }

        const actions = APT.Core.System.ProjectManager.SearchActions(absoluteDirectoryPath);
        console.log(`[API] Actions response:`, APT.Common.NiceJSONStringify(actions));
        res.json(actions);
    } catch (error) {
        console.error(`[API] Error getting project actions:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Execute command
app.post('/api/execute-command', (req, res) => {
    console.log(`[API] POST /api/execute-command`, req.body);
    
    const { command, commandType, projectPath } = req.body;
    
    if (!commandType) {
        return res.status(400).json({ error: 'Missing required field: commandType' });
    }

    let fullCommand;
    const execOptions = {
        cwd: projectPath && fs.existsSync(projectPath) ? projectPath : process.cwd(),
        env: { ...process.env },
        // No timeout - infinite timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
    };

    try {
        // Build the full command with specific prefixes: apt:, node:, python:, native (no prefix)
        switch (commandType) {
            case 'apt':
                if (command.trim()) {
                    fullCommand = `apt ${command}`;
                } else {
                    // Empty APT command - run help
                    fullCommand = 'apt';
                }
                break;
            
            case 'node':
                if (command.trim()) {
                    fullCommand = `node ${command}`;
                } else {
                    // Empty node command - show version
                    fullCommand = 'node';
                }
                break;
            
            case 'python':
                if (command.trim()) {
                    fullCommand = `python ${command}`;
                } else {
                    // Empty python command - show version
                    fullCommand = 'python';
                }
                break;
            
            case 'native':
            default:
                if (command.trim()) {
                    // Native commands have no prefix
                    fullCommand = command;
                } else {
                    // Empty native command - show current directory
                    fullCommand = process.platform === 'win32' ? 'cd' : 'pwd';
                }
                break;
        }

        console.log(`[API] Executing: ${fullCommand}`);
        console.log(`[API] Working directory: ${execOptions.cwd}`);

        exec(fullCommand, execOptions, (error, stdout, stderr) => {
            const output = stdout || stderr || '';
            const response = {
                output: output,
                exitCode: error ? error.code || 1 : 0,
                command: command,
                commandType: commandType
            };

            if (error) {
                console.log(`[API] Command failed:`, { error: error.message, ...response });
                
                // Handle errors (no timeout since we have infinite timeout)
                res.status(500).json({ 
                    error: stderr || error.message || `Command failed with exit code ${error.code}`,
                    ...response
                });
            } else {
                console.log(`[API] Command completed successfully:`, response);
                res.json(response);
            }
        });

    } catch (error) {
        console.error(`[API] Error setting up command execution:`, error);
        res.status(500).json({ 
            error: `Failed to setup command: ${error.message}`,
            command: command,
            commandType: commandType
        });
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] User connected: ${socket.id}`);
  
  // Handle real-time command execution
  socket.on('execute-command', (data) => {
    console.log(`[Socket.IO] Execute command:`, data);
    
    const { command, commandType, projectPath, sessionId } = data;
    
    if (!commandType) {
      socket.emit('command-error', { sessionId, error: 'Missing required field: commandType' });
      return;
    }

    let fullCommandString;
    const spawnOptions = {
      cwd: projectPath && fs.existsSync(projectPath) ? projectPath : process.cwd(),
      env: { ...process.env },
      shell: true // Use shell to execute commands
    };

    try {
      // Build the full command string with specific prefixes: apt:, node:, python:, native (no prefix)
      switch (commandType) {
        case 'apt':
          if (command.trim()) {
            fullCommandString = `apt ${command.trim()}`;
          } else {
            // Empty APT command - run help
            fullCommandString = 'apt';
          }
          break;
        
        case 'node':
          if (command.trim()) {
            fullCommandString = `node ${command.trim()}`;
          } else {
            // Empty node command - show version
            fullCommandString = 'node --version';
          }
          break;
        
        case 'python':
          if (command.trim()) {
            fullCommandString = `python ${command.trim()}`;
          } else {
            // Empty python command - show version
            fullCommandString = 'python --version';
          }
          break;
        
        default: // 'native' or any other type
          if (command.trim()) {
            fullCommandString = command.trim();
          } else {
            fullCommandString = 'echo Empty command executed';
          }
          break;
      }

      console.log(`[Socket.IO] Executing: "${fullCommandString}" in`, spawnOptions.cwd);
      
      // Use spawn with shell=true for streaming output
      const childProcess = spawn(fullCommandString, [], spawnOptions);
      
      // Send command start event
      socket.emit('command-start', { 
        sessionId, 
        command: fullCommandString,
        commandType,
        pid: childProcess.pid
      });

      // Stream stdout
      childProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Socket.IO] stdout chunk:`, output);
        socket.emit('command-output', { 
          sessionId, 
          output: output, // Send raw ANSI output, let client handle conversion
          error: false 
        });
      });

      // Stream stderr
      childProcess.stderr.on('data', (data) => {
        const output = data.toString();
        console.log(`[Socket.IO] stderr chunk:`, output);
        socket.emit('command-output', { 
          sessionId, 
          output: output, // Send raw ANSI output, let client handle conversion
          error: true 
        });
      });

      // Handle process completion
      childProcess.on('close', (code) => {
        console.log(`[Socket.IO] Command completed with code:`, code);
        socket.emit('command-complete', { 
          sessionId, 
          exitCode: code,
          success: code === 0
        });
      });

      // Handle process error
      childProcess.on('error', (err) => {
        console.error(`[Socket.IO] Command error:`, err);
        socket.emit('command-error', { 
          sessionId, 
          error: `Process error: ${err.message}` 
        });
      });

    } catch (err) {
      console.error(`[Socket.IO] Error setting up command:`, err);
      socket.emit('command-error', { 
        sessionId, 
        error: err.message 
      });
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] User disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
    console.log(`APT GUI Server with Socket.IO running on port ${port}`);
});