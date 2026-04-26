
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

APT.Extensions.ProjectLinker.Link = function(EntryDirectory)
{
    let LockHandle = APT.Extensions.ProjectLinker.LockLinkDirectory();

    if (APT.Extensions.ProjectLinker.Find({ EntryDirectory }))
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

APT.Extensions.ProjectLinker.Find = function(Query)
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
APT.Extensions.ProjectLinker.Ensure = function(Query)
{
    // If available
    {
        let EntryDirectory = APT.Extensions.ProjectLinker.Find(Query);
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
    }
    return null;
}