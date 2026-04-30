
const path = require("path");
const fs = require("fs");

AMJS.Import("./Logger");
AMJS.Import("./ProjectData");

APT.Core.F_Project = class
{
    constructor(EntryDirectory, Data, IsMain = false)
    {
        this.EntryDirectory = EntryDirectory;
        this.EntryFile = path.join(EntryDirectory, "APT.js");
        this.Context = null;
        this.HasEntryFile = fs.existsSync(this.EntryFile);
        this.Data = Data;
        this.SignatureData = new APT.Core.F_ProjectData();
        this.IsMain = IsMain;

        this.Events = {
            PrepareSignature: [],
            Import: []
        };
    }

    PreImport()
    {
    }
    PostImport()
    {
    }

    ExecuteEvent(EventName, ...Args)
    {
        APT.Common.Assert(EventName in this.Events, `Not found event: ${EventName}`);
        let Event = this.Events[EventName];
        for (let Listener of Event)
        {
            Listener(...Args);
        }
    }
    
    HasPublic(Key, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.HasPublic(Key);
        }
        else
        {
            return this.Data.HasPublic(Key);
        }
    }
    AddPublic(Key, Value, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.AddPublic(Key, Value);
        }
        else
        {
            return this.Data.AddPublic(Key, Value);
        }
    }
    GetPublic(Key, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.GetPublic(Key);
        }
        else
        {
            return this.Data.GetPublic(Key);
        }
    }
    FindPublic(Key, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.FindPublic(Key);
        }
        else
        {
            return this.Data.FindPublic(Key);
        }
    }
    GetOrAddPublic(Key, DefaultValue, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.GetOrAddPublic(Key, DefaultValue);
        }
        else
        {
            return this.Data.GetOrAddPublic(Key, DefaultValue);
        }
    }
    SetPublic(Key, Value, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.SetPublic(Key, Value);
        }
        else
        {
            return this.Data.SetPublic(Key, Value);
        }
    }
    PushPublic(Key, Element, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.PushPublic(Key, Element);
        }
        else
        {
            return this.Data.PushPublic(Key, Element);
        }
    }

    HasPrivate(Key, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.HasPrivate(Key);
        }
        else
        {
            return this.Data.HasPrivate(Key);
        }
    }
    AddPrivate(Key, Value, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.AddPrivate(Key, Value);
        }
        else
        {
            return this.Data.AddPrivate(Key, Value);
        }
    }
    GetPrivate(Key, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.GetPrivate(Key);
        }
        else
        {
            return this.Data.GetPrivate(Key);
        }
    }
    FindPrivate(Key, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.FindPrivate(Key);
        }
        else
        {
            return this.Data.FindPrivate(Key);
        }
    }
    GetOrAddPrivate(Key, DefaultValue, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.GetOrAddPrivate(Key, DefaultValue);
        }
        else
        {
            return this.Data.GetOrAddPrivate(Key, DefaultValue);
        }
    }
    SetPrivate(Key, Value, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.SetPrivate(Key, Value);
        }
        else
        {
            return this.Data.SetPrivate(Key, Value);
        }
    }
    PushPrivate(Key, Element, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.PushPrivate(Key, Element);
        }
        else
        {
            return this.Data.PushPrivate(Key, Element);
        }
    }

    Has(Key, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.Has(Key);
        }
        else
        {
            return this.Data.Has(Key);
        }
    }
    Get(Key, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.Get(Key);
        }
        else
        {
            return this.Data.Get(Key);
        }
    }
    Find(Key, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.Find(Key);
        }
        else
        {
            return this.Data.Find(Key);
        }
    }
    GetOrAdd(Key, DefaultValue, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.GetOrAdd(Key, DefaultValue);
        }
        else
        {
            return this.Data.GetOrAdd(Key, DefaultValue);
        }
    }
    Set(Key, Value, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.Set(Key, Value);
        }
        else
        {
            return this.Data.Set(Key, Value);
        }
    }
    Push(Key, Element, IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.Push(Key, Element);
        }
        else
        {
            return this.Data.Push(Key, Element);
        }
    }

    GetSignature(IsSignature = false)
    {
        if (IsSignature)
        {
            return this.SignatureData.GetSignature(this.EntryDirectory);
        }
        else
        {
            return this.Data.GetSignature(this.EntryDirectory);
        }
    }

    TransferSignature(Key, DefaultValue)
    {
        return this.Context.APT.TransferSignature(Key, DefaultValue);
    }

    Import(RelativeEntryDirectory2, Data2, Required2 = true)
    {
        return this.Context.APT.Import(RelativeEntryDirectory2, Data2, Required2);
    }
    On(EventName, Callback)
    {
        return this.Context.APT.On(EventName, Callback);
    }
}