const path = require("path");
const fs = require("fs");

AMJS.Import("./ProjectComponent");

/**
 * Core project class that represents a single project instance.
 * Each project is initialized from a JS entry file and can have multiple components.
 * 
 * @class F_Project
 * @memberof APT.Core
 */
AMJS.Namespace.F_Project = class
{
    /**
     * Creates a new project instance
     * @param {string} EntryDirectory - Path to project entry directory	
     * @param {Object} AdditionalOptions - Project configuration options
     */
    constructor(EntryDirectory, AdditionalOptions)
    {
        this.EntryDirectory = EntryDirectory;
        this.EntryFile = path.join(EntryDirectory, "APTProject.js");
        this.HasEntryFile = fs.existsSync(this.EntryFile);
        this.Name = EntryDirectory;
        this.Label = this.Name;
        this.AdditionalOptions = AdditionalOptions ?? new Object();
        this.Components = new Map();

        this.IsFinalized = false;

        this.Preset = APT.Core.System.ProjectManager.GenerateProjectPreset(this.EntryDirectory);
        this.ProjectLink = APT.Core.System.ProjectManager.SetupProjectLink(this.EntryDirectory);
    }

    /**
     * Adds a component to the project
     * @param {typeof APT.Core.A_ProjectComponent} ComponentClass - Component class to instantiate
     * @param {...*} Args - Additional arguments for component constructor
     * @returns {APT.Core.A_ProjectComponent} The created component instance
     */
    AddComponent(ComponentClass, ...Args)
    {
        let Component = new ComponentClass(this, ...Args);
        this.Components.set(ComponentClass, Component);
        return Component;
    }
    FindComponent(ComponentClass)
    {
        if (this.Components.has(ComponentClass))
        {
            return this.Components.get(ComponentClass);
        }
        return null;
    }
    GetComponent(ComponentClass)
    {
        if (this.Components.has(ComponentClass))
        {
            return this.Components.get(ComponentClass);
        }
        throw new Error(`not found project component ${ComponentClass}`);
    }
    EnsureComponent(ComponentClass, ...Args)
    {
        let Component = this.FindComponent(ComponentClass);
        if (Component)
        {
            return Component;
        }
        return this.AddComponent(ComponentClass, ...Args);
    }

    ApplyPrototype(...Prototypes)
    {
        for(let Prototype of Prototypes)
        {
            Prototype(this);
        }
        return this;
    }

    TryFinalize()
    {
        APT.Log("APT", `Try finalize project ${this.EntryDirectory}`);
        if (this.IsFinalized)
        {
            APT.Log("APT", `Project was finalized ${this.EntryDirectory}`);
            return;
        }

        APT.Log("APT", `Project was not finalized => Finalize ${this.EntryDirectory}`);
        this.IsFinalized = true;
        this.PostLoad();
    }

    GenerateDefaultActions()
    {
        return [
            APT.Core.System.ProjectManager.GenerateImportAction(this.EntryDirectory),
            APT.Core.System.ProjectManager.GenerateRefreshAction(this.EntryDirectory)
        ];
    }

    /**
     * Executes component lifecycle methods in order:
     * 1. Init() - Initial setup
     * 2. PostInit() - Post-initialization tasks
     * 3. Start() - Component startup
     */
    PostLoad()
    {
        this.Components.forEach(
            (Value, Key, Map) =>
            {
                Value.Init();
            }
        );
        this.Components.forEach(
            (Value, Key, Map) =>
            {
                Value.PostInit();
            }
        );
        {
            let Actions = this.GenerateDefaultActions();
            this.Components.forEach(
                (Value, Key, Map) =>
                {
                    Value.GenerateActions(Actions);
                }
            );
            APT.Core.System.ProjectManager.SaveActions(this.EntryDirectory, Actions);
        }
        this.Components.forEach(
            (Value, Key, Map) =>
            {
                Value.Start();
            }
        );
    }

    GenerateAPTCommandOnThis()
    {
        return `apt ${this.EntryDirectory.replaceAll("\\", "/")}`;
    }

    PreImport()
    {
        APT.Log("APT", `Pre import project ${this.EntryDirectory}`);

        this.EnvConfig = APT.Core.System.Environment.SetupEnvironment(
            [ this.EntryDirectory ],
            APT.Templates.Common.Utilities.GetDefaultEnvironmentName(),
            this.Preset.EnvironmentConfigDirectory
        ) || {
            Dependencies: new Object()
        };

        this.ImportDependencies();
    }
    ImportDependencies()
    {
        APT.Log("APT", `Importing dependencies for project ${this.EntryDirectory}`);

        this.Dependencies = new Object();
        for (let DependencyName in this.EnvConfig.Dependencies)
        {
            let Dependency = this.EnvConfig.Dependencies[DependencyName];
            let ProjectLink = APT.Core.System.ProjectManager.SearchProjectLink(Dependency);
            if (ProjectLink)
            {
                this.Dependencies[DependencyName] = APT.Core.System.ProjectManager.ImportProject(
                    [], 
                    ProjectLink.EntryDirectory
                );
            }
        }

        APT.Log("APT", `Imported dependencies for project ${this.EntryDirectory}:\n`, APT.Common.NiceJSONStringify(Object.keys(this.Dependencies)));
    }
};