
AMJS.Import("./ProjectComponent");

AMJS.Namespace.F_Project = class
{
    constructor(AbsoluteEntryFilePath, AdditionalOptions)
    {
        this.AbsoluteEntryFilePath = AbsoluteEntryFilePath;
        this.Name = AbsoluteEntryFilePath;
        this.Label = this.Name;
        this.AdditionalOptions = AdditionalOptions | new Object();
        this.Components = new Object();
    }

    AddComponent(ComponentClass, ...Args)
    {
        let Component = new ComponentClass(this, ...Args);
        this.Components[ComponentClass] = Component;
        return Component;
    }
    FindComponent(ComponentClass)
    {
        if (ComponentClass in this.Components)
        {
            return this.Components[ComponentClass];
        }
        return null;
    }
    GetComponent(ComponentClass)
    {
        if (ComponentClass in this.Components)
        {
            return this.Components[ComponentClass];
        }
        throw new Error(`not found project component ${ComponentClass}`);
    }

    ApplyPrototype(Prototype)
    {
        Prototype(this);
        return this;
    }
};