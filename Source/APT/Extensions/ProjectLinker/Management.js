
const path = require("path");
const fs = require("fs");
const simpleGit = require('simple-git');
const Ajv = require("ajv");
const deasync = require('deasync');

AMJS.Import("./Common");


APT.Extensions.ProjectLinker.AllocateProjectDirectory = function()
{
    let LockHandle = APT.Extensions.ProjectLinker.LockLinkDirectory();

    const DataDirectory = APT.Common.EnsureDataDirectory();
    const LinkDirectory = APT.Extensions.ProjectLinker.EnsureLinkDirectory();
    
    const NextProjectIndexFile = path.join(DataDirectory, ".NextProjectIndex");
    if (!fs.existsSync(NextProjectIndexFile))
    {
        fs.writeFileSync(NextProjectIndexFile, "0");
    }

    let ProjectIndex = fs.readFileSync(NextProjectIndexFile, "utf8");
    ProjectIndex = parseInt(ProjectIndex);
    if (ProjectIndex == NaN)
    {
        throw new Error("Project index is Nan, corrupted");
    }

    const ProjectDirectory = path.join(DataDirectory, "D", ProjectIndex.toString());
    fs.mkdirSync(ProjectDirectory, { recursive: true });

    fs.writeFileSync(NextProjectIndexFile, (ProjectIndex + 1).toString());

    APT.Extensions.ProjectLinker.UnlockLinkDirectory(LockHandle);
    return ProjectDirectory;
}

APT.Extensions.ProjectLinker.LinkDirectory = function(EntryDirectory)
{
    let LockHandle = APT.Extensions.ProjectLinker.LockLinkDirectory();

    if (APT.Extensions.ProjectLinker.FindDirectory({ EntryDirectory }))
    {
        APT.Extensions.ProjectLinker.UnlockLinkDirectory(LockHandle);
        return;
    }
    
    const DataDirectory = APT.Common.EnsureDataDirectory();
    const LinkDirectory = APT.Extensions.ProjectLinker.EnsureLinkDirectory();
    
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

    APT.Extensions.ProjectLinker.UnlockLinkDirectory(LockHandle);
}

APT.Extensions.ProjectLinker.FindDirectory = function(Query)
{
    const FinalizedQuery = APT.Extensions.ProjectLinker.FinalizeQuery(Query);

    Links = APT.Extensions.ProjectLinker.SearchLinks();
    
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
APT.Extensions.ProjectLinker.EnsureDirectory = function(Query)
{
    // If available
    {
        let EntryDirectory = APT.Extensions.ProjectLinker.FindDirectory(Query);
        if (EntryDirectory)
        {
            return EntryDirectory;
        }
    }

    // Git clone
    if ("GitDetails" in Query)
    {
        const GitDetails = Query.GitDetails;
        const ProjectEntryDirectory = APT.Extensions.ProjectLinker.AllocateProjectDirectory();
        let Result = APT.Common.GitClone(GitDetails, ProjectEntryDirectory);
        APT.Common.Assert(Result, `Failed to clone repo at: ${ProjectEntryDirectory}`);
        return ProjectEntryDirectory;
    }
    return null;
}

APT.Extensions.ProjectLinker.Find = function(Query, ...ProjectImportArgs)
{
    let EntryDirectory = APT.Extensions.ProjectLinker.FindDirectory(Query);
    if (!EntryDirectory)
    {
        return null;
    }
    return APT.Core.System.GetChild("ProjectManager").Import(
        [], 
        EntryDirectory, 
        ...ProjectImportArgs
    );
}
APT.Extensions.ProjectLinker.Ensure = function(Query, ...ProjectImportArgs)
{
    let EntryDirectory = APT.Extensions.ProjectLinker.EnsureDirectory(Query);
    APT.Common.Assert(EntryDirectory, `Not found project link for: ${APT.Common.NiceJSONStringify(Query)}`);
    return APT.Core.System.GetChild("ProjectManager").Import(
        null,
        [], 
        EntryDirectory, 
        ...ProjectImportArgs
    );
}