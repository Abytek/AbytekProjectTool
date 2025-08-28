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
     * @param {string} AbsoluteEntryFile - Path to project entry file
     * @param {Object} AdditionalOptions - Project configuration options
     */
    constructor(AbsoluteEntryFile, AdditionalOptions)
    {
        this.AbsoluteEntryFile = AbsoluteEntryFile;
        this.EntryDirectory = path.dirname(AbsoluteEntryFile);
        this.Name = AbsoluteEntryFile;
        this.Label = this.Name;
        this.AdditionalOptions = AdditionalOptions ?? new Object();
        this.Components = new Map();

        this.IsFinalized = false;

        this.Preset = APT.Core.System.ProjectManager.GenerateProjectPreset(this.AbsoluteEntryFile);
        this.ProjectLink = APT.Core.System.ProjectManager.SetupProjectLink(this.AbsoluteEntryFile);
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
        if (this.IsFinalized)
        {
            return;
        }

        this.IsFinalized = true;
        this.PostLoad();
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
        this.Components.forEach(
            (Value, Key, Map) =>
            {
                Value.Start();
            }
        );
    }
};