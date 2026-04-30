
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");


APT.Extensions.ScopeLinker.GetLinkDirectory = function()
{
    return path.normalize(path.join(APT.Common.GetDataDirectory(), "ScopeLinks"));
}
APT.Extensions.ScopeLinker.EnsureLinkDirectory = function()
{
    const Path = APT.Extensions.ScopeLinker.GetLinkDirectory();
    fs.mkdirSync(Path, { recursive: true });
    return Path;
}
APT.Extensions.ScopeLinker.GetLockFileName = function()
{
    return ".Lock";
}
APT.Extensions.ScopeLinker.GetLockFileForLinkDirectory = function()
{
    return path.normalize(
        path.join(
            APT.Extensions.ScopeLinker.GetLinkDirectory(), 
            APT.Extensions.ScopeLinker.GetLockFileName()
        )
    );
}
APT.Extensions.ScopeLinker.LockLinkDirectory = function()
{
    return APT.Common.AcquireFileBasedLock(
        APT.Extensions.ScopeLinker.GetLockFileForLinkDirectory()
    );
}
APT.Extensions.ScopeLinker.UnlockLinkDirectory = function(Handle)
{
    return APT.Common.ReleaseFileBasedLock(Handle);
}
APT.Extensions.ScopeLinker.SearchLinks = function(EntryDirectory)
{
    let Result = [];
    const LinkDirectory = APT.Extensions.ScopeLinker.GetLinkDirectory();
    const FileNames = fs.readdirSync(LinkDirectory);
    for (let FileName of FileNames)
    {
        if (FileName == APT.Extensions.ScopeLinker.GetLockFileName())
        {
            continue;
        }
        const FilePath = path.join(LinkDirectory, FileName);
        const Link = fs.readFileSync(FilePath, 'utf8');
        Result.push(Link);
    }
    return Result;
}

APT.Extensions.ScopeLinker.ValidateQuery = function(Query)
{
    const ajv = new Ajv();
    const Schema = {
        type: "object",
        properties: {
            GitDetails: {
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
    
    if (!Validator(Query)) 
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
APT.Extensions.ScopeLinker.FinalizeQuery = function(Query)
{
    let Validation = APT.Extensions.ScopeLinker.ValidateQuery(Query);
    APT.Common.Assert(Validation.Status, Validation);

    let Result = APT.Common.SimpleDeepCopy(Query);
    return Result;
}