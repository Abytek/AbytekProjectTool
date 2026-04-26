
AMJS.Import("./Assert");
AMJS.Import("./Copy");


/**
 * Sets a property in an object using a dot-notation path, creating intermediate objects if needed.
 * Only sets the value if it doesn't already exist.
 * @param {Object} InObject - Target object
 * @param {string} Key - Dot-notation path (e.g. "a.b.c")
 * @param {*} Value - Value to set
 * @returns {*} Existing value if key exists, or new value if key was created
 */
APT.Common.TrySetPropertyByPath = function(InObject, Key, Value)
{
    let KeyParts = Key.split(".");
    let ParsedKeyParts = [];
    for(let KeyPart of KeyParts)
    {
        if (KeyPart != "")
        {
            ParsedKeyParts.push(KeyPart);
        }
    }

    let NumKeyParts = ParsedKeyParts.length;
    let Subobject = InObject;
    APT.Common.Assert(NumKeyParts > 0, `invalid key ${Key}`);
    for(let Idx = 0; Idx < (NumKeyParts - 1); ++Idx)
    {
        let KeyPart = ParsedKeyParts[Idx];
        if (!(KeyPart in Subobject))
        {
            Subobject[KeyPart] = new Object();
        }
        Subobject = Subobject[KeyPart];
    }
    let LastKeyPart = ParsedKeyParts[NumKeyParts - 1];
    if (LastKeyPart in Subobject)
    {
        return Subobject[LastKeyPart];
    }
    else
    {
        Subobject[LastKeyPart] = Value;
    }
    return Value;
}

/**
 * Sets a property in an object using a dot-notation path, creating intermediate objects if needed.
 * Always sets the value, overwriting any existing value.
 * @param {Object} InObject - Target object
 * @param {string} Key - Dot-notation path (e.g. "a.b.c")
 * @param {*} Value - Value to set
 * @returns {*} The set value
 */
APT.Common.SetPropertyByPath = function(InObject, Key, Value)
{
    let KeyParts = Key.split(".");
    let ParsedKeyParts = [];
    for(let KeyPart of KeyParts)
    {
        if (KeyPart != "")
        {
            ParsedKeyParts.push(KeyPart);
        }
    }

    let NumKeyParts = ParsedKeyParts.length;
    let Subobject = InObject;
    APT.Common.Assert(NumKeyParts > 0, `invalid key ${Key}`);
    for(let Idx = 0; Idx < (NumKeyParts - 1); ++Idx)
    {
        let KeyPart = ParsedKeyParts[Idx];
        if (!(KeyPart in Subobject))
        {
            Subobject[KeyPart] = new Object();
        }
        Subobject = Subobject[KeyPart];
    }
    let LastKeyPart = ParsedKeyParts[NumKeyParts - 1];
    Subobject[LastKeyPart] = Value;
    return Value;
}

/**
 * Gets a property from an object using a dot-notation path.
 * Throws error if any part of the path doesn't exist.
 * @param {Object} InObject - Source object
 * @param {string} Key - Dot-notation path (e.g. "a.b.c")
 * @returns {*} The value at the specified path
 * @throws {Error} If path doesn't exist
 */
APT.Common.GetPropertyByPath = function(InObject, Key)
{
    let KeyParts = Key.split(".");
    let ParsedKeyParts = [];
    for(let KeyPart of KeyParts)
    {
        if (KeyPart != "")
        {
            ParsedKeyParts.push(KeyPart);
        }
    }

    let NumKeyParts = ParsedKeyParts.length;
    let Subobject = InObject;
    APT.Common.Assert(NumKeyParts > 0, `invalid key ${Key}`);
    for(let Idx = 0; Idx < (NumKeyParts - 1); ++Idx)
    {
        let KeyPart = ParsedKeyParts[Idx];
        APT.Common.Assert(KeyPart in Subobject, `key ${Key} not added`);
        Subobject = Subobject[KeyPart];
    }
    let LastKeyPart = ParsedKeyParts[NumKeyParts - 1];
    APT.Common.Assert(LastKeyPart in Subobject, `key ${Key} not added`);
    return Subobject[LastKeyPart];
}

/**
 * Attempts to find a property in an object using a dot-notation path.
 * Returns null if any part of the path doesn't exist.
 * @param {Object} InObject - Source object
 * @param {string} Key - Dot-notation path (e.g. "a.b.c")
 * @returns {*|null} The value at the specified path or null if not found
 */
APT.Common.FindPropertyByPath = function(InObject, Key)
{
    let KeyParts = Key.split(".");
    let ParsedKeyParts = [];
    for(let KeyPart of KeyParts)
    {
        if (KeyPart != "")
        {
            ParsedKeyParts.push(KeyPart);
        }
    }

    let NumKeyParts = ParsedKeyParts.length;
    let Subobject = InObject;
    if (!(NumKeyParts > 0))
    {
        return null;
    }
    for(let Idx = 0; Idx < (NumKeyParts - 1); ++Idx)
    {
        let KeyPart = ParsedKeyParts[Idx];
        if (!(KeyPart in Subobject))
        {
            return null;
        }
        Subobject = Subobject[KeyPart];
    }
    let LastKeyPart = ParsedKeyParts[NumKeyParts - 1];
    if (!(LastKeyPart in Subobject))
    {
        return null;
    }
    return Subobject[LastKeyPart];
}

APT.Common.FindPropertyByPathThenReset = function(InObject, Key)
{
    let KeyParts = Key.split(".");
    let ParsedKeyParts = [];
    for(let KeyPart of KeyParts)
    {
        if (KeyPart != "")
        {
            ParsedKeyParts.push(KeyPart);
        }
    }

    let NumKeyParts = ParsedKeyParts.length;
    let Subobject = InObject;
    if (!(NumKeyParts > 0))
    {
        return null;
    }
    for(let Idx = 0; Idx < (NumKeyParts - 1); ++Idx)
    {
        let KeyPart = ParsedKeyParts[Idx];
        if (!(KeyPart in Subobject))
        {
            return null;
        }
        Subobject = Subobject[KeyPart];
    }
    let LastKeyPart = ParsedKeyParts[NumKeyParts - 1];
    if (!(LastKeyPart in Subobject))
    {
        return null;
    }
    let FinalResult = Subobject[LastKeyPart];
    Subobject[LastKeyPart] = null;
    return FinalResult;
}

APT.Common.MergeData = function(ResultObject, AObject)
{
    if (typeof ResultObject != "object")
    {
        return APT.Common.SimpleDeepCopy(AObject);
    }
    for (let Key in AObject)
    {
        let AProperty = AObject[Key];

        if (typeof AProperty == "object")
        {
            if (Key in ResultObject)
            {
                let ResultPropertySrc = ResultObject[Key];
                if (typeof ResultPropertySrc == "object")
                {
                    let ResultPropertyDst = APT.Common.SimpleDeepCopy(ResultPropertySrc);
                    APT.Common.MergeData(ResultPropertyDst, AProperty);
                    ResultObject[Key] = ResultPropertyDst;
                    continue;
                }
            }
        }
        
        ResultObject[Key] = AProperty;
    }
    return ResultObject;
}