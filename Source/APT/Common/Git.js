
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync } = require('child_process');
const simpleGit = require('simple-git');
const deasync = require('deasync');

AMJS.Import("./Assert");
AMJS.Import("./Files");

APT.Common.LoadGitDetails = function(Directory)
{
    if (!fs.existsSync(path.join(Directory, ".git")))
    {
        return null;
    }
    try 
    {
        const GitRemoteURLOutput = execSync('git remote get-url origin', { cwd: Directory });
        const GitBranchOutput = execSync('git rev-parse --abbrev-ref HEAD', { cwd: Directory });
        const GitCommitOutput = execSync('git rev-parse HEAD', { cwd: Directory });
        return {
            RemoteURL: GitRemoteURLOutput.toString().trim(),
            Branch: GitBranchOutput.toString().trim(),
            Commit: GitCommitOutput.toString().trim()
        };
    } 
    catch (err) 
    {
    }
    return null;
}
APT.Common.TryMatchGitDetails = function(Current, Query)
{
    let TryMatchGitRemoteURL = (A, B) => {
        if (A == null)
        {
            return false;
        }
        if (B == null)
        {
            return false;
        }
        let AClone = "" + A;
        let BClone = "" + B;
        if (!AClone.endsWith(".git"))
        {
            AClone += ".git";
        }
        if (!BClone.endsWith(".git"))
        {
            BClone += ".git";
        }
        return AClone == BClone;
    };

    if (!TryMatchGitRemoteURL(Query.RemoteURL, Current.RemoteURL))
    {
        return false;
    }
    if ("Commit" in Query)
    {
        if (Query.Commit != Current.Commit)
        {
            return false;
        }
    }
    if ("Branch" in Query)
    {
        if (Query.Branch != Current.Branch)
        {
            return false;
        }
    }
    return true;
}
APT.Common.GitClone = function(GitDetails, Directory)
{
    APT.Log("APT", `Start cloning repo:`);
    APT.Log("APT", `\t- GitDetails: ${GitDetails}`);
    APT.Log("APT", `\t- Directory: ${Directory}`);

    let Succeeded = false;
    let Done = false;
    let AsyncClone = async function()
    {
        const Git = simpleGit();
        await Git.clone(GitDetails.RemoteURL, Directory)
            .then(
                () => {
                    APT.Log("APT", `Repo cloned to ${Directory}`);
                    Succeeded = true;
                }
            )
            .catch(
                err => {
                    if (fs.existsSync(Directory))
                    {
                        fs.rmSync(Directory, { recursive: true, force: true });
                    }
                    Succeeded = false;
                    console.error('Clone failed:', err)
                }
            );
    }
    AsyncClone()
        .then(
            () => { 
                Done = true; 
            }
        );
    while (!Done)
    {
        deasync.runLoopOnce();
    }
    return Succeeded;
}