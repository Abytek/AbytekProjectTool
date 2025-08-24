
const path = require("path");
const fs = require("fs");
const simpleGit = require('simple-git');
const crypto = require('crypto');

function StringToUUID(input) {
  const hash = crypto.createHash('sha1').update(input).digest('hex'); // 40 chars

  // Format as UUIDv4-like string: 8-4-4-4-12
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16), // force version 4
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.substring(18, 20), // force variant
    hash.substring(20, 32)
  ].join('-');
}

AMJS.Import("./Project")

AMJS.Namespace.GetEnvironmentDependenciesDirectory = function()
{
    return path.join(__dirname, "../../../Data/Dependencies");
}

/**
 * @class F_Environment
 * @memberof APT.Core
 */
AMJS.Namespace.F_Environment = class
{
    /**
     * Creates a new F_Environment instance
     * @param {APT.Core.F_System} System - Parent system instance
     */
    constructor(System)
    {
        /** @type {APT.Core.F_System} Parent system reference */
        this.System = System;
    }

    LoadEnvironmentConfig(Module, EnvName, ConfigDirectoryPath)
    {
        let EnvConfig = AMJS.ModuleSystem.ImportJSON(Module, path.join(ConfigDirectoryPath, EnvName));
        if ("Parent" in EnvConfig)
        {
            let ParentEnvName = EnvConfig.Parent;
            let ParentEnvConfig = this.LoadEnvironmentConfig(Module, ParentEnvName, ConfigDirectoryPath);
            EnvConfig = this.MergeEnvironmentConfigs(EnvConfig, ParentEnvConfig);
        }
        return EnvConfig;
    }
    MergeEnvironmentConfigs(A, Base)
    {
        let Result = APT.Common.SimpleDeepCopy(Base);

        let MergeMapParam = function(ParamName)
        {
            if (ParamName in A)
            {
                let AParam = A[ParamName];
                if (!(ParamName in Result))
                {
                    Result[ParamName] = new Object();
                }
                let ResultParam = Result[ParamName];
                for (let Key in AParam)
                {
                    ResultParam[Key] = APT.Common.SimpleDeepCopy(AParam[Key]);
                }
            }
        }

        MergeMapParam("Dependencies");
        return Result;
    }
    async AsyncSetupEnvironment(Module, EnvName, ConfigDirectoryPath)
    {
        let EnvConfig = this.LoadEnvironmentConfig(Module, EnvName, ConfigDirectoryPath);
        console.log("APT.SetupEnvironment:\n", EnvConfig);
        await this.AsyncSetupEnvironmentDependencies(EnvConfig);
    }
    async AsyncSetupEnvironmentDependencies(EnvConfig)
    {
        for(let DependencyName in EnvConfig.Dependencies)
        {
            let Dependency = EnvConfig.Dependencies[DependencyName];

            let ProjectManager = APT.Core.System.ProjectManager;
            let ProjectLink = ProjectManager.SearchProjectLink(Dependency);
            if (ProjectLink)
            {
                if (fs.existsSync(ProjectLink.EntryFile))
                {
                    this.ImportDependentProject(ProjectLink.EntryFile, DependencyName, Dependency);
                    continue;
                }
            }

            {
                let TestProjectEntryFile = await this.AsyncSetupEnvironmentDependency_GitRepo(DependencyName, Dependency);
                if (TestProjectEntryFile)
                {
                    this.ImportDependentProject(TestProjectEntryFile, DependencyName, Dependency);
                }
            }
        }
    }
    async AsyncSetupEnvironmentDependency_GitRepo(DependencyName, Dependency)
    {
        if (!("GitDetails" in Dependency))
        {
            return null;
        }

        const StoreKey = { 
            DependencyName,
            Dependency
        };
        const StoreKeyJSON = JSON.stringify(StoreKey);
        const StoreKeyJSONEncoded = StringToUUID(StoreKeyJSON);

        const DependencyDirectoryPath = path.join(
            AMJS.Namespace.GetEnvironmentDependenciesDirectory(),
            StoreKeyJSONEncoded,
            DependencyName
        );

        if (fs.existsSync(DependencyDirectoryPath))
        {
            console.log(`Updating git repository ${Dependency.GitDetails.RemoteURL} at ${DependencyDirectoryPath}`);
            const Git = simpleGit(DependencyDirectoryPath);
            if ("Commit" in Dependency.GitDetails)
            {
                const Commit = Dependency.GitDetails.Commit;
                await Git.reset(['--hard', `${Commit}`]);
            }
            else
            if ("Branch" in Dependency.GitDetails)
            {
                const Branch = Dependency.GitDetails.Branch;
                await Git.reset(['--hard', `origin/${Branch}`]);
            }
        }
        else
        {
            console.log(`Cloning git repository ${Dependency.GitDetails.RemoteURL} into ${DependencyDirectoryPath}`);
            const Git = simpleGit();
            await Git.clone(Dependency.GitDetails.RemoteURL, DependencyDirectoryPath)
                .then(() => console.log(`✅ Repo cloned to ${DependencyDirectoryPath}`))
                .catch(
                    err => {
                        console.error('❌ Clone failed:', err)
                        if (fs.existsSync(DependencyDirectoryPath))
                        {
                            fs.rmdirSync(DependencyDirectoryPath);
                        }
                    }
                );
        }
        return path.join(DependencyDirectoryPath, "APTProject.js");
    }
    ImportDependentProject(EntryFile, DependencyName, Dependency)
    {
        let ProjectManager = APT.Core.System.ProjectManager;
        
        let AdditionalOptions = new Object();
        if ("AdditionalOptions" in Dependency)
        {
            AdditionalOptions = Dependency.AdditionalOptions;
        }
        let Required = true;
        if ("Required" in Dependency)
        {
            Required = Dependency.Required;
        }
        let DependentProject = ProjectManager.ImportProject(null, EntryFile, AdditionalOptions, Required);
        return DependentProject;
    }
}