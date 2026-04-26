
AMJS.Namespace.F_Data = class
{
    constructor(Source)
    {
        this.Public = new Object();
        this.Private = new Object();

        if (Source)
        {
            for (Key in Source.Public)
            {
                let SourceValue = Source.Get();
                const Value = APT.Common.SimpleDeepCopy(SourceValue);
                this.AddPublic(Key, Value);
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
            return this.AddPublic(Key, Value);
        }
        return this.GetPublic(Key);
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
            return this.AddPrivate(Key, Value);
        }
        return this.GetPrivate(Key);
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
            return GetPrivate(Key);
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
            return FindPrivate(Key);
        }
        return null;
    }

    GetSignature()
    {
        return APT.Common.NiceJSONStringify({
            Public: this.Public,
            Private: this.Private,
        });
    }
}