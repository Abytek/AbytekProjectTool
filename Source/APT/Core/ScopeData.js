
APT.Core.F_ScopeData = class
{
    constructor(Source)
    {
        this.Public = new Object();
        this.Private = new Object();

        this.Inherit(Source);
    }

    Inherit(Source)
    {
        if (Source)
        {
            for (let Key in Source.Public)
            {
                let SourceValue = Source.Get(Key);
                const Value = APT.Common.SimpleDeepCopy(SourceValue);
                this.GetOrAddPublic(Key, Value);
            }
        }
    }

    HasPublic(Key)
    {
        return (Key in this.Public);
    }
    AddPublic(Key, Value)
    {
        APT.Common.Assert(!this.Has(Key), `Key was already added: ${Key}`);
        this.Public[Key] = Value;
        return Value;
    }
    GetPublic(Key)
    {
        APT.Common.Assert(this.HasPublic(Key), `Not found public key: ${Key}`);
        return this.Public[Key];
    }
    FindPublic(Key)
    {
        if (Key in this.Public)
        {
            return this.Public[Key];
        }
        return null;
    }
    GetOrAddPublic(Key, DefaultValue)
    {
        if (!this.HasPublic(Key))
        {
            return this.AddPublic(Key, DefaultValue);
        }
        return this.GetPublic(Key);
    }
    SetPublic(Key, Value)
    {
        APT.Common.Assert(this.HasPublic(Key) || !this.Has(Key), `Cannot set public key: ${Key}`);
        this.Public[Key] = Value;
        return Value;
    }
    PushPublic(Key, Element)
    {
        let Value = this.GetOrAddPublic(Key, []);
        Value.push(Element);
        return this.SetPublic(Key, Value);
    }

    HasPrivate(Key)
    {
        return (Key in this.Private);
    }
    AddPrivate(Key, Value)
    {
        APT.Common.Assert(!this.Has(Key), `Key was already added: ${Key}`);
        this.Private[Key] = Value;
        return Value;
    }
    GetPrivate(Key)
    {
        APT.Common.Assert(this.HasPrivate(Key), `Not found private key: ${Key}`);
        return this.Private[Key];
    }
    FindPrivate(Key)
    {
        if (Key in this.Private)
        {
            return this.Private[Key];
        }
        return null;
    }
    GetOrAddPrivate(Key, DefaultValue)
    {
        if (!this.HasPrivate(Key))
        {
            return this.AddPrivate(Key, DefaultValue);
        }
        return this.GetPrivate(Key);
    }
    SetPrivate(Key, Value)
    {
        APT.Common.Assert(this.HasPrivate(Key) || !this.Has(Key), `Cannot set private key: ${Key}`);
        this.Private[Key] = Value;
        return Value;
    }
    PushPrivate(Key, Element)
    {
        let Value = this.GetOrAddPrivate(Key, []);
        Value.push(Element);
        return this.SetPrivate(Key, Value);
    }

    Has(Key)
    {
        if (this.HasPublic(Key))
        {
            return true;
        }
        if (this.HasPrivate(Key))
        {
            return true;
        }
        return false;
    }
    Get(Key)
    {
        if (this.HasPublic(Key))
        {
            return this.GetPublic(Key);
        }
        if (this.HasPrivate(Key))
        {
            return this.GetPrivate(Key);
        }
        APT.FatalError("APT", `Not found key: ${Key}`);
        return null;
    }
    Find(Key)
    {
        if (this.HasPublic(Key))
        {
            return this.FindPublic(Key);
        }
        if (this.HasPrivate(Key))
        {
            return this.FindPrivate(Key);
        }
        return null;
    }
    GetOrAdd(Key, DefaultValue)
    {
        return this.GetOrAddPrivate(Key, DefaultValue);
    }
    Set(Key, Value)
    {
        return this.SetPrivate(Key, Value);
    }
    Push(Key, Element)
    {
        return this.PushPrivate(Key, Element);
    }

    GetSignature(ScopeEntryDirectory = "")
    {
        return APT.Common.NiceJSONStringify({
            Public: this.Public,
            Private: this.Private,
            ScopeEntryDirectory
        });
    }
}