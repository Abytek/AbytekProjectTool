const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Ajv = require("ajv");
const { execSync } = require('child_process');

AMJS.Import("./Project")

// for automatic project pre-import setup
// function signature: (Project) => {}
AMJS.Namespace.PreImportProjectCallbacks = [];

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
     * @param {string} EntryDirectory - Path to project entry directory
     * @param {Object} [InstanceData={}] - Project instance configuration
     * @returns {Object} Project key object
     * @private
     */
    CalculateProjectKey(EntryDirectory, InstanceData = new Object())
    {
        return APT.Common.NiceJSONStringify({ EntryDirectory, InstanceData });
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
     * @param {string[]} BaseDirectories - Base directories for relative path resolution
     * @param {string} RelativeProjectEntryDirectory - Relative path to project entry directory
     * @param {Object} [AdditionalOptions={}] - Additional project options
     * @param {boolean} [Required=true] - Whether the project is required
     * @returns {APT.Core.F_Project|false} Project instance or false if not found/required
     * @throws {Error} If Required is true and project entry file is not found
     */
    ImportProject(BaseDirectories, RelativeProjectEntryDirectory, AdditionalOptions = new Object(), Required = true)
    {
        APT.Log("APT", `Import project ${RelativeProjectEntryDirectory}`);

        // Parse additional options and merge instance data
        let ParsedAdditionalOptions = APT.Common.SimpleDeepCopy(this.System.CommandManager.CLIInput.get('ProjectDefault') ?? new Object());
        APT.Common.MergeData(ParsedAdditionalOptions, AdditionalOptions);

        let InstanceData = APT.Common.SimpleDeepCopy(this.DefaultInstanceData);
        if (AdditionalOptions.InstanceData)
        {
            for(let Key in AdditionalOptions.InstanceData)
            {
                InstanceData[Key] = AdditionalOptions.InstanceData[Key];
            }
        }
        ParsedAdditionalOptions.InstanceData = InstanceData;

        // Resolve absolute project directory path
        let AbsoluteProjectEntryDirectory = AMJS.ModuleSystem.SearchAbsoluteDirectory(BaseDirectories, RelativeProjectEntryDirectory);
        if (!AbsoluteProjectEntryDirectory)
        {
            if (Required)
            {
                throw new Error(`Project entry directory ${RelativeProjectEntryDirectory} not found`);
            }
            return false;
        }

        APT.Log("APT", `Found project entry directory ${AbsoluteProjectEntryDirectory}`);

        // Check for existing project instance
        const ProjectKey = this.CalculateProjectKey(AbsoluteProjectEntryDirectory, InstanceData);
        APT.Log("APT", `Calculated project key for ${AbsoluteProjectEntryDirectory}:`, ProjectKey);
        APT.Log("APT", `Previous project maps:`, APT.Common.NiceJSONStringify(this.Projects.keys()));
        if (this.Projects.has(ProjectKey))
        {
            APT.Log("APT", `Found imported project ${AbsoluteProjectEntryDirectory}`);
            return this.Projects.get(ProjectKey);
        }

        APT.Log("APT", `Project was not imported => Import ${AbsoluteProjectEntryDirectory}`);

        // Create new project instance
        let Project = new AMJS.Namespace.F_Project(AbsoluteProjectEntryDirectory, ParsedAdditionalOptions);
        this.Projects.set(ProjectKey, Project);

        let ProjectManager = this;

        if (Project.HasEntryFile)
        {
            // Import project module and set up context
            let ProjectContext = AMJS.ModuleSystem.Import(
                BaseDirectories,
                Project.EntryFile,
                Required,
                {
                    ModifyContext(Context)
                    {
                        Context.APT = {
                            ...Context.APT
                        };
                        Project.Context = Context;
                        Context.APT.Project = Project;
                        Context.APT.ImportProject = function(RelativeProjectEntryDirectory2, AdditionalOptions2 = new Object(), Required2 = true)
                        {
                            return ProjectManager.ImportProject([ AbsoluteProjectEntryDirectory ], RelativeProjectEntryDirectory2, AdditionalOptions2, Required2);
                        }
                        Context.APT.LoadEnvironmentConfig = function(EnvName, ConfigDirectoryPath)
                        {
                            return APT.Core.System.Environment.LoadEnvironmentConfig([ AbsoluteProjectEntryDirectory ], EnvName, ConfigDirectoryPath);
                        }
                        Context.APT.AsyncSetupEnvironment = async function(EnvName, ConfigDirectoryPath)
                        {
                            return await APT.Core.System.Environment.AsyncSetupEnvironment([ AbsoluteProjectEntryDirectory ], EnvName, ConfigDirectoryPath);
                        }
                        Context.APT.SetupEnvironment = function(EnvName, ConfigDirectoryPath)
                        {
                            return APT.Core.System.Environment.SetupEnvironment([ AbsoluteProjectEntryDirectory ], EnvName, ConfigDirectoryPath);
                        }

                        Project.PreImport();
                    },
                    IsAnonymous: true
                }
            );

            if (!ProjectContext)
            {
                this.Projects.delete(ProjectKey);
                return false;
            }
        }
        else
        {
            Project.PreImport();
        }

        // Store and finalize project
        Project.TryFinalize();
        return Project;
    }

    LoadProjectLinks()
    {
        APT.Log("APT", `Load project links`);

        const dirPath = APT.Common.GetProjectLinksDirectory();

        const ThisProjectManager = this;

        function readAllJsonFiles(directory) {
            const files = fs.readdirSync(directory);
            const jsonData = [];

            files.forEach(file => {
                if (path.extname(file) === '.json') {
                const fullPath = path.join(directory, file);
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const parsed = JSON.parse(content);

                    APT.Log("APT", `Check project link for loading:`, APT.Common.NiceJSONStringify(parsed));

                    const ValidatedResult = ThisProjectManager.ValidateProjectLink(parsed);
                    if (!ValidatedResult.Status)
                    {
                        console.error(`❌ Error reading ${file}:`, APT.Common.NiceJSONStringify(ValidatedResult.Errors));
                        return;
                    }
                    if (fs.existsSync(parsed.EntryDirectory))
                    {
                        jsonData.push(ThisProjectManager.GenerateProjectLink(parsed.EntryDirectory));
                    }
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
    ValidateProjectLink(ProjectLink)
    {
        const ajv = new Ajv();
        const Schema = {
            type: "object",
            properties: {
                GitDetails : {
                    type: "object",
                    properties: {
                        RemoteURL: {
                            type: "string"
                        },
                        Commit: {
                            type: "string"
                        },
                        Branch: {
                            type: "string"
                        }
                    },
                    required: ["RemoteURL"],
                    additionalProperties: false
                },
                EntryDirectory: {
                    type: "string"
                }
            },
            additionalProperties: false,
        };
        const Validator = ajv.compile(Schema);

        let Result = {
            Status: true,
            Errors: []
        };
        
        if (!Validator(ProjectLink)) 
        {
            Result.Status = false;
            Result.Errors.push({
                Message: "Invalid syntax",
                ChildErrors: Validator.errors
            });
            return Result;
        }
        return Result;
    }
    SearchProjectLink(ProjectLink)
    {        
        APT.Log("APT", `Search project link:`, ProjectLink);
        let LastProjectLinks = this.LoadProjectLinks();
        for(let LastProjectLink of LastProjectLinks)
        {
            if (this.TryMatchProjectLinks(ProjectLink, LastProjectLink))
            {
                APT.Log("APT", `Found last project link:`, LastProjectLink);
                return LastProjectLink;
            }
        }
        return null;
    }
    TryMatchProjectLinks(Finder, Last)
    {
        if ("EntryDirectory" in Finder)
        {
            if (Finder.EntryDirectory != Last.EntryDirectory)
            {
                return false;
            }
            if (!fs.existsSync(Last.EntryDirectory))
            {
                return false;
            }
        }
        if (("GitDetails" in Finder) && ("GitDetails" in Last))
        {
            let FinderGitDetails = Finder.GitDetails;
            let LastGitDetails = Last.GitDetails;

            let TryMatchGitRemoteURL = (A, B) => {
                if (A == null)
                {
                    return false;
                }
                if (B == null)
                {
                    return false;
                }
                let AClone = "" + A;
                let BClone = "" + B;
                if (!AClone.endsWith(".git"))
                {
                    AClone += ".git";
                }
                if (!BClone.endsWith(".git"))
                {
                    BClone += ".git";
                }
                return AClone == BClone;
            };

            if (!TryMatchGitRemoteURL(FinderGitDetails.RemoteURL, LastGitDetails.RemoteURL))
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
    GenerateProjectLink(EntryDirectory)
    {
        let ProjectLink = 
        {
            EntryDirectory: EntryDirectory
        };

        if (fs.existsSync(path.join(EntryDirectory, ".git")))
        {
            try 
            {
                const GitRemoteURLOutput = execSync('git remote get-url origin', { cwd: EntryDirectory });
                const GitBranchOutput = execSync('git rev-parse --abbrev-ref HEAD', { cwd: EntryDirectory });
                const GitCommitOutput = execSync('git rev-parse HEAD', { cwd: EntryDirectory });
                ProjectLink.GitDetails =
                {
                    RemoteURL: GitRemoteURLOutput.toString().trim(),
                    Branch: GitBranchOutput.toString().trim(),
                    Commit: GitCommitOutput.toString().trim()
                };
            } 
            catch (err) 
            {
                throw new Error(err);
            }
        }

        return ProjectLink;
    }
    SetupProjectLink(ProjectEntryDirectory)
    {
        const ProjectLink = this.GenerateProjectLink(ProjectEntryDirectory);

        APT.Log("APT", `Setup project link:`, ProjectLink);

        let SearchedProjectLink = this.SearchProjectLink(ProjectLink);
        if (!SearchedProjectLink)
        {
            this.AddProjectLink(ProjectLink);
            return ProjectLink;
        }
        return SearchedProjectLink;
    }
    AddProjectLink(ProjectLink)
    {
        APT.Log("APT", `Add project link:`, ProjectLink);
        const ProjectLinksDirectory = APT.Common.GetProjectLinksDirectory();
        const ProjectLinkFile = path.join(APT.Common.GetProjectLinksDirectory(), APT.Common.StringToUUID(ProjectLink.EntryDirectory) + ".json");
        if (!fs.existsSync(ProjectLinksDirectory))
        {
            fs.mkdirSync(ProjectLinksDirectory, { recursive: true });
        }
        fs.writeFileSync(ProjectLinkFile, APT.Common.NiceJSONStringify(ProjectLink), {  });
    }

    ValidateProjectPreset(Preset)
    {
        const ajv = new Ajv();
        const Schema = {
            type: "object",
            properties: {
                EnvironmentConfigDirectory: {
                    type: "string",
                },
            },
            additionalProperties: false,
        };
        const Validator = ajv.compile(Schema);

        let Result = {
            Status: true,
            Errors: []
        };
        
        if (!Validator(Preset)) 
        {
            Result.Status = false;
            Result.Errors.push({
                Message: "Invalid syntax",
                ChildErrors: Validator.errors
            });
            return Result;
        }
        return Result;
    }
    GenerateProjectPreset(ProjectEntryDirectory)
    {
        APT.Log("APT", `Generating/finding project preset for ${ProjectEntryDirectory}`);
        const PresetFile = path.join(ProjectEntryDirectory, "APTPreset.json");
        let Result = {
            EnvironmentConfigDirectory: "Config/Environment",
        };
        if (fs.existsSync(PresetFile))
        {
            let Preset = require(PresetFile);
            const ValidatedResult = this.ValidateProjectPreset(Preset);
            if (!ValidatedResult.Status)
            {
                console.error(`❌ Invalid preset file ${PresetFile}:`, APT.Common.NiceJSONStringify(ValidatedResult.Errors));
                return null;
            }
            Result = APT.Common.MergeData(Result, Preset);
            APT.Log("APT", `Found project preset for ${ProjectEntryDirectory}:`, APT.Common.NiceJSONStringify(Result));
        }
        else
        {
            APT.Log("APT", `Generated project preset for ${ProjectEntryDirectory}:`, APT.Common.NiceJSONStringify(Result));
        }
        return Result;
    }

    ValidateActions(EntryDirectory, Actions)
    {
        const ajv = new Ajv();
        const Schema = {
            type: "array",
            items: {
                type: "object",
                properties: {
                    Name: {
                        type: "string"
                    },
                    Description: {
                        type: "string"
                    },
                    ShouldRefreshPage: {
                        type: "boolean"
                    },
                    Category: {
                        type: "string"
                    },
                    Commands: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    }
                },
                additionalProperties: false,
            }
        };
        const Validator = ajv.compile(Schema);
        let Result = {
            Status: true,
            Errors: []
        };
        if (!Validator(Actions))
        {
            Result.Status = false;
            Result.Errors.push({
                Message: "Invalid syntax",
                ChildErrors: Validator.errors
            });
        }
        return Result;
    }
    SearchActions(EntryDirectory)
    {
        APT.Log("APT", `Search actions(${EntryDirectory})`);
        const ProjectImportedDirectory = APT.Common.GetProjectImportedDirectory(EntryDirectory);
        const ActionsFile = path.join(ProjectImportedDirectory, "Actions.json");
        if (fs.existsSync(ActionsFile))
        {
            APT.Log("APT", `Found actions file(${EntryDirectory}):`, ActionsFile);
            const ActionsFileContent = fs.readFileSync(ActionsFile).toString();
            APT.Log("APT", `Actions file content:`, ActionsFileContent);
            return JSON.parse(ActionsFileContent);
        }
        APT.Log("APT", `Not found actions file(${EntryDirectory}):`, ActionsFile);
        return [ this.GenerateImportAction(EntryDirectory) ];
    }
    SaveActions(EntryDirectory, Actions)
    {
        APT.Log("APT", `Save actions(${EntryDirectory}):`, APT.Common.NiceJSONStringify(Actions));
        const ValidatedResult = this.ValidateActions(EntryDirectory, Actions);
        if (!ValidatedResult.Status)
        {
            console.error(`❌ Invalid actions(${EntryDirectory}):`, APT.Common.NiceJSONStringify(ValidatedResult.Errors));
            return false;
        }
        const ProjectImportedDirectory = APT.Common.GetProjectImportedDirectory(EntryDirectory);
        if (!fs.existsSync(ProjectImportedDirectory))
        {
            fs.mkdirSync(ProjectImportedDirectory, { recursive: true });
        }
        fs.writeFileSync(path.join(ProjectImportedDirectory, "Actions.json"), APT.Common.NiceJSONStringify(Actions), {  });
        return true;
    }
    GenerateImportAction(EntryDirectory)
    {
        return {
            Name: "Import",
            Description: "Import the project",
            ShouldRefreshPage: true,
            Commands: [
                `abytekpt ${EntryDirectory.replaceAll("\\", "/")}`
            ],
            Category: "Base"
        };
    }
    GenerateRefreshAction(EntryDirectory)
    {
        return {
            Name: "Refresh",
            Description: "Refresh the project",
            ShouldRefreshPage: true,
            Commands: [
                `abytekpt ${EntryDirectory.replaceAll("\\", "/")} :GlobalDefault.ShouldConfigureProjects false`
            ],
            Category: "Base"
        };
    }
    GenerateOpenExplorerAction(EntryDirectory)
    {
        return {
            Name: "Open Explorer",
            Description: "Open the project in explorer",
            ShouldRefreshPage: false,
            Commands: [
                `abytekpt ${EntryDirectory.replaceAll("\\", "/")} :OpenExplorer`
            ],
            Category: "Base"
        };
    }
}