
const path = require("path");

AMJS.Import("./ProjectComponent");

AMJS.Namespace.F_Project = class
{
    constructor(AbsoluteEntryFilePath, AdditionalOptions)
    {
        this.AbsoluteEntryFilePath = AbsoluteEntryFilePath;
        this.EntryDirectoryPath = path.dirname(AbsoluteEntryFilePath);
        this.Name = AbsoluteEntryFilePath;
        this.Label = this.Name;
        this.AdditionalOptions = AdditionalOptions ?? new Object();
        this.Components = new Map();

        this.IsFinalized = false;
    }

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