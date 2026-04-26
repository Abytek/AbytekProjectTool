
const path = require("path");
const fs = require("fs");
const simpleGit = require('simple-git');
const Ajv = require("ajv");
const deasync = require('deasync');

AMJS.Import("./Common");


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
        // if ("GitDetails" in Query)
        // {
        //     let FinderGitDetails = Finder.GitDetails;
        //     let LastGitDetails = Last.GitDetails;

        //     let TryMatchGitRemoteURL = (A, B) => {
        //         if (A == null)
        //         {
        //             return false;
        //         }
        //         if (B == null)
        //         {
        //             return false;
        //         }
        //         let AClone = "" + A;
        //         let BClone = "" + B;
        //         if (!AClone.endsWith(".git"))
        //         {
        //             AClone += ".git";
        //         }
        //         if (!BClone.endsWith(".git"))
        //         {
        //             BClone += ".git";
        //         }
        //         return AClone == BClone;
        //     };

        //     if (!TryMatchGitRemoteURL(FinderGitDetails.RemoteURL, LastGitDetails.RemoteURL))
        //     {
        //         return false;
        //     }
        //     if ("Commit" in FinderGitDetails)
        //     {
        //         if (FinderGitDetails.Commit != LastGitDetails.Commit)
        //         {
        //             return false;
        //         }
        //     }
        //     if ("Branch" in FinderGitDetails)
        //     {
        //         if (FinderGitDetails.Branch != LastGitDetails.Branch)
        //         {
        //             return false;
        //         }
        //     }
        //     return true;
        // }
    }
    return null;
}