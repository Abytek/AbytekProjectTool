
const path = require("path");
const fs = require("fs");
const simpleGit = require('simple-git');
const Ajv = require("ajv");
const deasync = require('deasync');

AMJS.Import("./Common");


APT.Extensions.ScopeLinker.AllocateScopeDirectory = function()
{
    let LockHandle = APT.Extensions.ScopeLinker.LockLinkDirectory();

    const DataDirectory = APT.Common.EnsureDataDirectory();
    const LinkDirectory = APT.Extensions.ScopeLinker.EnsureLinkDirectory();
    
    const NextScopeIndexFile = path.join(DataDirectory, ".NextScopeIndex");
    if (!fs.existsSync(NextScopeIndexFile))
    {
        fs.writeFileSync(NextScopeIndexFile, "0");
    }

    let ScopeIndex = fs.readFileSync(NextScopeIndexFile, "utf8");
    ScopeIndex = parseInt(ScopeIndex);
    if (ScopeIndex == NaN)
    {
        throw new Error("Scope index is Nan, corrupted");
    }

    const ScopeDirectory = path.join(DataDirectory, "D", ScopeIndex.toString());
    fs.mkdirSync(ScopeDirectory, { recursive: true });

    fs.writeFileSync(NextScopeIndexFile, (ScopeIndex + 1).toString());

    APT.Extensions.ScopeLinker.UnlockLinkDirectory(LockHandle);
    return ScopeDirectory;
}

APT.Extensions.ScopeLinker.LinkDirectory = function(EntryDirectory)
{
    let LockHandle = APT.Extensions.ScopeLinker.LockLinkDirectory();

    if (APT.Extensions.ScopeLinker.FindDirectory({ EntryDirectory }))
    {
        APT.Extensions.ScopeLinker.UnlockLinkDirectory(LockHandle);
        return;
    }
    
    const DataDirectory = APT.Common.EnsureDataDirectory();
    const LinkDirectory = APT.Extensions.ScopeLinker.EnsureLinkDirectory();
    
    const NextLinkIndexFile = path.join(DataDirectory, ".NextLinkIndex");
    if (!fs.existsSync(NextLinkIndexFile))
    {
        fs.writeFileSync(NextLinkIndexFile, "0");
    }

    let LinkIndex = fs.readFileSync(NextLinkIndexFile, "utf8");
    LinkIndex = parseInt(LinkIndex);
    if (LinkIndex == NaN)
    {
        throw new Error("Link index is Nan, corrupted");
    }

    const LinkFile = path.join(LinkDirectory, LinkIndex.toString() + ".txt");
    fs.writeFileSync(LinkFile, EntryDirectory);

    fs.writeFileSync(NextLinkIndexFile, (LinkIndex + 1).toString());

    APT.Extensions.ScopeLinker.UnlockLinkDirectory(LockHandle);
}

APT.Extensions.ScopeLinker.FindDirectory = function(Query)
{
    const FinalizedQuery = APT.Extensions.ScopeLinker.FinalizeQuery(Query);

    Links = APT.Extensions.ScopeLinker.SearchLinks();
    
    for (let Link of Links)
    {
        if ("EntryDirectory" in Query)
        {
            if (Link == Query.EntryDirectory)
            {
                return Link;
            }
        }
        if ("GitDetails" in Query)
        {
            let LinkGitDetails = APT.Common.LoadGitDetails(Link);
            if (!LinkGitDetails)
            {
                continue;
            }
            if (APT.Common.TryMatchGitDetails(LinkGitDetails, Query.GitDetails))
            {
                return Link;
            }
        }
    }
    return null;
}
APT.Extensions.ScopeLinker.EnsureDirectory = function(Query)
{
    // If available
    {
        let EntryDirectory = APT.Extensions.ScopeLinker.FindDirectory(Query);
        if (EntryDirectory)
        {
            return EntryDirectory;
        }
    }

    // Git clone
    if ("GitDetails" in Query)
    {
        const GitDetails = Query.GitDetails;
        const ScopeEntryDirectory = APT.Extensions.ScopeLinker.AllocateScopeDirectory();
        let Result = APT.Common.GitClone(GitDetails, ScopeEntryDirectory);
        APT.Common.Assert(Result, `Failed to clone repo at: ${ScopeEntryDirectory}`);
        return ScopeEntryDirectory;
    }
    return null;
}

APT.Extensions.ScopeLinker.Find = function(Query, ...ScopeImportArgs)
{
    let EntryDirectory = APT.Extensions.ScopeLinker.FindDirectory(Query);
    if (!EntryDirectory)
    {
        return null;
    }
    return APT.Core.System.GetChild("ScopeManager").Import(
        [], 
        EntryDirectory, 
        ...ScopeImportArgs
    );
}
APT.Extensions.ScopeLinker.Ensure = function(Query, ...ScopeImportArgs)
{
    let EntryDirectory = APT.Extensions.ScopeLinker.EnsureDirectory(Query);
    APT.Common.Assert(EntryDirectory, `Not found scope link for: ${APT.Common.NiceJSONStringify(Query)}`);
    return APT.Core.System.GetChild("ScopeManager").Import(
        null,
        [], 
        EntryDirectory, 
        ...ScopeImportArgs
    );
}