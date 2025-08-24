const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

AMJS.Import("./Project")

/**
 * Manages project instances and their lifecycle.
 * Handles project importing, instantiation, and instance data management.
 * 
 * Key Features:
 * - Project instance management
 * - Instance data handling
 * - Project dependency resolution
 * - Project context setup
 * 
 * @class F_ProjectManager
 * @memberof APT.Core
 */
AMJS.Namespace.F_ProjectManager = class
{
    /**
     * Creates a new ProjectManager instance
     * @param {APT.Core.F_System} System - Parent system instance
     */
    constructor(System)
    {
        /** @type {APT.Core.F_System} Parent system reference */
        this.System = System;

        /** @type {Map<Object, APT.Core.F_Project>} Map of project keys to project instances */
        this.Projects = new Map();

        /** @type {Object} Default instance data for new projects */
        this.DefaultInstanceData = this.System.CommandManager.CLIInput.get('ProjectDefault').InstanceData ?? new Object();
    }

    /**
     * Calculates a unique key for a project based on its file and instance data
     * @param {string} AbsoluteProjectEntryFile - Absolute path to project entry file
     * @param {Object} [InstanceData={}] - Project instance configuration
     * @returns {Object} Project key object
     * @private
     */
    CalculateProjectKey(AbsoluteProjectEntryFile, InstanceData = new Object())
    {
        return { AbsoluteProjectEntryFile, InstanceData };
    }

    /**
     * Imports a project from a JS entry file
     * 
     * Process:
     * 1. Resolves instance data
     * 2. Locates project entry file
     * 3. Creates or retrieves project instance
     * 4. Sets up project context
     * 5. Finalizes project setup
     * 
     * @param {AMJS.Module} BaseModule - Base module for relative path resolution
     * @param {string} ProjectEntryFile - Path to project entry file
     * @param {Object} [AdditionalOptions={}] - Additional project options
     * @param {boolean} [Required=true] - Whether the project is required
     * @returns {APT.Core.F_Project|false} Project instance or false if not found/required
     * @throws {Error} If Required is true and project entry file is not found
     */
    ImportProject(BaseModule, ProjectEntryFile, AdditionalOptions = new Object(), Required = true)
    {
        // Parse additional options and merge instance data
        let ParsedAdditionalOptions = { ...AdditionalOptions };

        let InstanceData = APT.Common.SimpleDeepCopy(this.DefaultInstanceData);
        if (AdditionalOptions.InstanceData)
        {
            for(let Key in AdditionalOptions.InstanceData)
            {
                InstanceData[Key] = AdditionalOptions.InstanceData[Key];
            }
        }
        ParsedAdditionalOptions.InstanceData = InstanceData;

        // Resolve absolute project file path
        let AbsoluteProjectEntryFile = AMJS.ModuleSystem.SearchModuleAbsoluteFile(BaseModule, ProjectEntryFile);
        if (!AbsoluteProjectEntryFile)
        {
            if (Required)
            {
                throw new Error(`Project entry file ${ProjectEntryFile} not found`);
            }
            return false;
        }

        // Check for existing project instance
        const ProjectKey = this.CalculateProjectKey(AbsoluteProjectEntryFile, InstanceData);
        if (this.Projects.has(ProjectKey))
        {
            return this.Projects.get(ProjectKey);
        }

        // Create new project instance
        let Project = new AMJS.Namespace.F_Project(AbsoluteProjectEntryFile, ParsedAdditionalOptions);

        let ProjectManager = this;

        // Import project module and set up context
        let ProjectContext = AMJS.ModuleSystem.Import(
            BaseModule,
            ProjectEntryFile,
            Required,
            {
                ModifyContext(Context)
                {
                    Context.APT = {
                        ...Context.APT
                    };
                    Project.Context = Context;
                    Context.APT.Project = Project;
                    Context.APT.ImportProject = function(ProjectEntryFile2, AdditionalOptions2 = new Object(), Required2 = true)
                    {
                        return ProjectManager.ImportProject(Context.AMJS.Module, ProjectEntryFile2, AdditionalOptions2, Required2);
                    }
                    Context.APT.LoadEnvironmentConfig = function(EnvName, ConfigDirectoryPath)
                    {
                        return APT.Core.System.Environment.LoadEnvironmentConfig(Context.AMJS.Module, EnvName, ConfigDirectoryPath);
                    }
                    Context.APT.AsyncSetupEnvironment = async function(EnvName, ConfigDirectoryPath)
                    {
                        return await APT.Core.System.Environment.AsyncSetupEnvironment(Context.AMJS.Module, EnvName, ConfigDirectoryPath);
                    }
                },
                IsAnonymous: true
            }
        );

        if (!ProjectContext)
        {
            return false;
        }

        // Store and finalize project
        this.Projects.set(ProjectKey, Project);
        Project.TryFinalize();
        return Project;
    }

    LoadProjectLinks()
    {
        const dirPath = APT.Common.GetProjectLinksDirectory();

        function readAllJsonFiles(directory) {
            const files = fs.readdirSync(directory);
            const jsonData = [];

            files.forEach(file => {
                if (path.extname(file) === '.json') {
                const fullPath = path.join(directory, file);
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const parsed = JSON.parse(content);
                    jsonData.push(parsed);
                } catch (err) {
                    console.error(`❌ Error reading ${file}:`, err.message);
                }
                }
            });

            return jsonData;
        }
        if (fs.existsSync(dirPath))
        {
            return readAllJsonFiles(dirPath);
        }
        return [];
    }
    SearchProjectLink(ProjectLink)
    {        
        console.log(`Search project link:`, ProjectLink);
        let LastProjectLinks = this.LoadProjectLinks();
        for(let LastProjectLink of LastProjectLinks)
        {
            if (this.TryMatchProjectLinks(ProjectLink, LastProjectLink))
            {
                console.log(`Found last project link:`, LastProjectLink);
                return LastProjectLink;
            }
        }
        return null;
    }
    TryMatchProjectLinks(Finder, Last)
    {
        if ("EntryFile" in Finder)
        {
            if (Finder.EntryFile != Last.EntryFile)
            {
                return false;
            }
        }
        if (("GitDetails" in Finder) && ("GitDetails" in Last))
        {
            let FinderGitDetails = Finder.GitDetails;
            let LastGitDetails = Last.GitDetails;
            if (FinderGitDetails.RemoteURL != LastGitDetails.RemoteURL)
            {
                return false;
            }
            if ("Commit" in FinderGitDetails)
            {
                if (FinderGitDetails.Commit != LastGitDetails.Commit)
                {
                    return false;
                }
            }
            if ("Branch" in FinderGitDetails)
            {
                if (FinderGitDetails.Branch != LastGitDetails.Branch)
                {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    UpdateProjectLink(ProjectLink)
    {
        console.log(`Update project link:`, ProjectLink);
        let SearchedProjectLink = this.SearchProjectLink(ProjectLink);
        if (!SearchedProjectLink)
        {
            this.AddProjectLink(ProjectLink);
        }
    }
    AddProjectLink(ProjectLink)
    {
        console.log(`Add project link:`, ProjectLink);
        const ProjectLinksDirectory = APT.Common.GetProjectLinksDirectory();
        const ProjectLinkFile = path.join(APT.Common.GetProjectLinksDirectory(), uuidv4() + ".json");
        if (!fs.existsSync(ProjectLinksDirectory))
        {
            fs.mkdirSync(ProjectLinksDirectory, { recursive: true });
        }
        fs.writeFileSync(ProjectLinkFile, JSON.stringify(ProjectLink), {  });
    }
}