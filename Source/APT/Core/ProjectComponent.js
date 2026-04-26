
APT.Core.A_ProjectComponent = class
{
    constructor(Context)
    {
        this.Context = Context;
        this.Project = Context.APT.Project;
    }
    
    HasPublic(Key, IsSignature = false)
    {
        return this.Context.APT.HasPublic(Key, IsSignature);
    }
    AddPublic(Key, Value, IsSignature = false)
    {
        return this.Context.APT.AddPublic(Key, Value, IsSignature);
    }
    GetPublic(Key, IsSignature = false)
    {
        return this.Context.APT.GetPublic(Key, IsSignature);
    }
    FindPublic(Key, IsSignature = false)
    {
        return this.Context.APT.FindPublic(Key, IsSignature);
    }
    GetOrAddPublic(Key, DefaultValue, IsSignature = false)
    {
        return this.Context.APT.GetOrAddPublic(Key, DefaultValue, IsSignature);
    }
    PushPublic(Key, Element, IsSignature = false)
    {
        return this.Context.APT.PushPublic(Key, Element, IsSignature);
    }

    HasPrivate(Key, IsSignature = false)
    {
        return this.Context.APT.HasPrivate(Key, IsSignature);
    }
    AddPrivate(Key, Value, IsSignature = false)
    {
        return this.Context.APT.AddPrivate(Key, Value, IsSignature);
    }
    GetPrivate(Key, IsSignature = false)
    {
        return this.Context.APT.GetPrivate(Key, IsSignature);
    }
    FindPrivate(Key, IsSignature = false)
    {
        return this.Context.APT.FindPrivate(Key, IsSignature);
    }
    GetOrAddPrivate(Key, DefaultValue, IsSignature = false)
    {
        return this.Context.APT.GetOrAddPrivate(Key, DefaultValue, IsSignature);
    }
    PushPrivate(Key, Element, IsSignature = false)
    {
        return this.Context.APT.PushPrivate(Key, Element, IsSignature);
    }

    Has(Key, IsSignature = false)
    {
        return this.Context.APT.Has(Key, IsSignature);
    }
    Get(Key, IsSignature = false)
    {
        return this.Context.APT.Get(Key, IsSignature);
    }
    Find(Key, IsSignature = false)
    {
        return this.Context.APT.Find(Key, IsSignature);
    }
    GetOrAdd(Key, DefaultValue, IsSignature = false)
    {
        return this.Context.APT.GetOrAdd(Key, DefaultValue, IsSignature);
    }
    Set(Key, Value, IsSignature = false)
    {
        return this.Context.APT.Set(Key, Value, IsSignature);
    }
    Push(Key, Element, IsSignature = false)
    {
        return this.Context.APT.Push(Key, Element, IsSignature);
    }

    GetSignature(IsSignature = false)
    {
        return this.Context.APT.GetSignature(IsSignature);
    }

    TransferSignature(Key, DefaultValue)
    {
        return this.Context.APT.TransferSignature(Key, DefaultValue);
    }

    ImportProject(RelativeEntryDirectory2, Data2, Required2 = true)
    {
        return this.Context.APT.ImportProject(RelativeEntryDirectory2, Data2, Required2);
    }
    On(EventName, Callback)
    {
        return this.Context.APT.On(EventName, Callback);
    }
}