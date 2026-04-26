
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");


APT.Extensions.ProjectLinker.GetLinkDirectory = function()
{
    return path.normalize(path.join(APT.Common.GetDataDirectory(), "ProjectLinks"));
}
APT.Extensions.ProjectLinker.EnsureLinkDirectory = function()
{
    const Path = APT.Extensions.ProjectLinker.GetLinkDirectory();
    fs.mkdirSync(Path, { recursive: true });
    return Path;
}
APT.Extensions.ProjectLinker.GetLockFileName = function()
{
    return ".Lock";
}
APT.Extensions.ProjectLinker.GetLockFileForLinkDirectory = function()
{
    return path.normalize(
        path.join(
            APT.Extensions.ProjectLinker.GetLinkDirectory(), 
            APT.Extensions.ProjectLinker.GetLockFileName()
        )
    );
}
APT.Extensions.ProjectLinker.LockLinkDirectory = function()
{
    return APT.Common.AcquireFileBasedLock(
        APT.Extensions.ProjectLinker.GetLockFileForLinkDirectory()
    );
}
APT.Extensions.ProjectLinker.UnlockLinkDirectory = function(Handle)
{
    return APT.Common.ReleaseFileBasedLock(Handle);
}
APT.Extensions.ProjectLinker.SearchLinks = function(EntryDirectory)
{
    let Result = [];
    const LinkDirectory = APT.Extensions.ProjectLinker.GetLinkDirectory();
    const FileNames = fs.readdirSync(LinkDirectory);
    for (let FileName of FileNames)
    {
        if (FileName == APT.Extensions.ProjectLinker.GetLockFileName())
        {
            continue;
        }
        const FilePath = path.join(LinkDirectory, FileName);
        const Link = fs.readFileSync(FilePath, 'utf8');
        Result.push(Link);
    }
    return Result;
}

APT.Extensions.ProjectLinker.ValidateQuery = function(Query)
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
APT.Extensions.ProjectLinker.FinalizeQuery = function(Query)
{
    let Validation = APT.Extensions.ProjectLinker.ValidateQuery(Query);
    APT.Common.Assert(Validation.Status, Validation);

    let Result = APT.Common.SimpleDeepCopy(Query);
    return Result;
}