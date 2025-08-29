const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

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

        const response = {
            project: {
                name: projectName,
                entryDirectory: absoluteDirectoryPath
            },
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

app.listen(port, () => {
    console.log(`APT GUI Server running on port ${port}`);
});