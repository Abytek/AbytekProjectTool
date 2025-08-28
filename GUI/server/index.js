const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import APT modules
const AMJS = require("../../Submodules/AbytekModuleJS/Source/AMJS/.js");

// Initialize APT Module System
const ModuleSystem = new AMJS.F_ModuleSystem();
ModuleSystem.SourceDirectories = [
    require('path').join(__dirname, '../../Source/APT')
];

// Import and initialize APT
const APT = ModuleSystem.Import(null, ".js");
const System = new APT.Core.F_System();
APT.Core.System = System;

// Configure system defaults before starting
System.CommandManager.CLIInput.get("GlobalDefault").ShouldConfigureProjects = false;

// Start the system
System.Start();

const app = express();
const port = 3001; // Different from React dev server port

app.use(cors());
app.use(express.json());

// Get project data
app.get('/api/project/:projectPath', (req, res) => {
    console.log(`[API] GET /api/project/${req.params.projectPath}`);
    try {
        const projectPath = decodeURIComponent(req.params.projectPath);
        const absolutePath = path.resolve(projectPath);
        
        if (!fs.existsSync(absolutePath)) {
            console.log(`[API] Project not found: ${absolutePath}`);
            return res.status(404).json({ error: 'Project file not found' });
        }

        // Get project name from directory
        const projectName = path.basename(path.dirname(absolutePath));
        console.log(`[API] Reading project: ${projectName}`);
        
        // Get environment configs if they exist
        let envConfigs = {};
        const configPath = path.join(path.dirname(absolutePath), 'Config/Environment');
        if (fs.existsSync(configPath)) {
            // Read all JSON files in the Environment directory
            const files = fs.readdirSync(configPath);
            const envFiles = files.filter(file => file.endsWith('.json'));
            
            envFiles.forEach(file => {
                const envPath = path.join(configPath, file);
                const envName = path.parse(file).name;
                try {
                    const config = JSON.parse(fs.readFileSync(envPath, 'utf8'));
                    // If config has a Parent field, add it to the response
                    if (config.Parent) {
                        envConfigs[envName] = {
                            ...config,
                            _parentConfig: config.Parent // Add special field for UI
                        };
                    } else {
                        envConfigs[envName] = config;
                    }
                    console.log(`[API] Loaded environment config: ${envName}`);
                } catch (err) {
                    console.error(`[API] Error loading environment config ${envName}:`, err);
                }
            });
        }

        const response = {
            project: {
                name: projectName,
                entryFile: absolutePath,
                entryDirectory: path.dirname(absolutePath)
            },
            environments: envConfigs
        };
        console.log(`[API] Sending project response for: ${projectName}`);
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
        res.json(cacheData);
    } catch (error) {
        // If cache directory doesn't exist, return empty object
        if (error.message && error.message.includes('no such file or directory')) {
            console.log(`[API] Cache directory does not exist yet`);
            res.json({});
        } else {
            console.error(`[API] Error in /api/cache:`, error);
            res.status(500).json({ error: error.message });
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
        
        // Transform the links into our API format
        const formattedLinks = projectLinks.map(link => ({
            path: link.EntryFile,
            name: path.basename(path.dirname(link.EntryFile)),
            type: link.GitDetails ? 'Git' : 'Local',
            entryFile: link.EntryFile,
            gitDetails: link.GitDetails
        }));

        console.log(`[API] Found ${formattedLinks.length} project links`);
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
        
        if (projectLink) {
            console.log(`[API] Found project link:`, projectLink);
            res.json({
                success: true,
                projectLink: {
                    entryFile: projectLink.EntryFile,
                    type: projectLink.Type || 'Unknown'
                }
            });
        } else {
            console.log(`[API] No project link found for:`, dependency);
            res.json({
                success: false,
                error: 'No matching project link found'
            });
        }
    } catch (error) {
        console.error(`[API] Error resolving project link:`, error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`APT GUI Server running on port ${port}`);
});