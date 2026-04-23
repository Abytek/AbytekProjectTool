
const path = require("path");
const fs = require("fs");
const simpleGit = require('simple-git');
const Ajv = require("ajv");
var deasync = require('deasync');

AMJS.Import("./Project")

AMJS.Namespace.GetEnvironmentDependenciesDirectory = function()
{
    return path.join(APT.Common.GetDataDirectory(), "D");
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

        let This = this;
        this.SetupEnvironment = (Project, BaseDirectories, EnvName, ConfigDirectoryPath) => 
        {  
            let Result = null;
            let Done = false;
            This.AsyncSetupEnvironment(Project, BaseDirectories, EnvName, ConfigDirectoryPath)
                .then(
                    (TempResult) => { Result = TempResult; Done = true; }
                );
            while (!Done)
            {
                deasync.runLoopOnce();
            }
            return Result;
        };
    }

    ValidateEnvironmentConfig(EnvConfig)
    {
        const ajv = new Ajv();
        const Schema = {
            type: "object",
            properties: {
                Dependencies: {
                    type: "object",
                    additionalProperties: true,
                },
                GlobalDefault: {
                    type: "object",
                    additionalProperties: true,
                },
                ProjectDefault: {
                    type: "object",
                    additionalProperties: true,
                },
                Parent: {
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
        
        if (!Validator(EnvConfig)) 
        {
            Result.Status = false;
            Result.Errors.push({
                Message: "Invalid syntax",
                ChildErrors: Validator.errors
            });
            return Result;
        }

        let ProjectManager = APT.Core.System.ProjectManager;

        if ("Dependencies" in EnvConfig)
        {
            let Dependencies = EnvConfig.Dependencies;
            for(let DependencyName in Dependencies)
            {
                let Dependency = Dependencies[DependencyName];
                const DependencyValidatedResult = ProjectManager.ValidateProjectLink(Dependency);
                if (!DependencyValidatedResult.Status)
                {
                    Result.Status = false;
                    Result.Errors.push({
                        Message: `Invalid dependency "${DependencyName}"`,
                        ChildErrors: DependencyValidatedResult.Errors
                    });
                }
            }
        }
        return Result;
    }
    LoadEnvironmentConfig(BaseDirectories, EnvName, ConfigDirectoryPath)
    {
        const EnvConfigFile = path.join(ConfigDirectoryPath, EnvName);
        let EnvConfig = AMJS.ModuleSystem.ImportJSON(BaseDirectories, EnvConfigFile, false);
        if (!EnvConfig)
        {
            if (EnvName != "Base")
            {
                return this.LoadEnvironmentConfig(BaseDirectories, "Base", ConfigDirectoryPath);
            }
            return;
        }
        const ValidatedResult = this.ValidateEnvironmentConfig(EnvConfig);
        if (!ValidatedResult.Status)
        {
            console.error(`Invalid environment config ${EnvConfigFile}:\nConfig:${APT.Common.NiceJSONStringify(EnvConfig)}\nErrors:${APT.Common.NiceJSONStringify(ValidatedResult.Errors)}`);
            return null;
        }
        if ("Parent" in EnvConfig)
        {
            let ParentEnvName = EnvConfig.Parent;
            let ParentEnvConfig = this.LoadEnvironmentConfig(BaseDirectories, ParentEnvName, ConfigDirectoryPath);
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

        let MergeOptionParam = function(ParamName)
        {
            if (ParamName in A)
            {
                let AParam = A[ParamName];
                if (!(ParamName in Result))
                {
                    Result[ParamName] = new Object();
                }
                let ResultParam = APT.Common.SimpleDeepCopy(Result[ParamName]);
                Result[ParamName] = APT.Common.MergeData(ResultParam, AParam);
            }
        }

        MergeMapParam("Dependencies");
        MergeOptionParam("GlobalDefault");
        MergeOptionParam("ProjectDefault");
        return Result;
    }
    async AsyncSetupEnvironment(Project, BaseDirectories, EnvName, ConfigDirectoryPath)
    {
        if (!fs.existsSync(ConfigDirectoryPath))
        {
            return {
                Dependencies: new Object()
            };
        }

        let EnvConfig = this.LoadEnvironmentConfig(BaseDirectories, EnvName, ConfigDirectoryPath);
        if (!EnvConfig)
        {
            return {
                Dependencies: new Object()
            };
        }

        APT.Log("APT", `APT.SetupEnvironment(${APT.Common.NiceJSONStringify(BaseDirectories)}):\n`, APT.Common.NiceJSONStringify(EnvConfig));

        this.ApplyCLIInputs(EnvConfig);

        await this.AsyncSetupEnvironmentDependencies(Project, EnvConfig);
        return EnvConfig;
    }
    ApplyCLIInputs(EnvConfig)
    {
        function ApplyCLIInputList(Name)
        {
            if (Name in EnvConfig)
            {
                let CLIInput = APT.Core.System.CommandManager.CLIInput;
                let PreValue = CLIInput.get(Name);
                let Value = APT.Common.MergeData(PreValue, EnvConfig[Name]);
                CLIInput.set(Name, Value);
            }
        }
        ApplyCLIInputList("GlobalDefault", EnvConfig);
        ApplyCLIInputList("ProjectDefault", EnvConfig);
    }
    async AsyncSetupEnvironmentDependencies(Project, EnvConfig)
    {
        for(let DependencyName in EnvConfig.Dependencies)
        {
            let Dependency = EnvConfig.Dependencies[DependencyName];

            let ProjectManager = APT.Core.System.ProjectManager;
            let ProjectLink = ProjectManager.SearchProjectLink(Dependency);
            if (ProjectLink)
            {
                if (fs.existsSync(ProjectLink.EntryDirectory))
                {
                    this.ImportDependentProject(Project, ProjectLink.EntryDirectory, DependencyName, Dependency);
                    continue;
                }
                else
                {
                    throw new Error(`Cannot import dependency "${DependencyName}"`);
                }
            }

            {
                let TestProjectEntryDirectory = await this.AsyncSetupEnvironmentDependency_GitRepo(DependencyName, Dependency);
                if (TestProjectEntryDirectory)
                {
                    this.ImportDependentProject(Project, TestProjectEntryDirectory, DependencyName, Dependency);
                    continue;
                }
                else
                {
                    throw new Error(`Cannot import dependency "${DependencyName}"`);
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

        let GitDetails = Dependency.GitDetails;

        const StoreKey = { 
            DependencyName,
            Dependency
        };
        const StoreKeyJSON = JSON.stringify(StoreKey);

        // Generate a unique directory path for the dependency
        const ProjectLinks = APT.Core.System.ProjectManager.LoadProjectLinks();
        let DepID = 0; // APT.Common.StringToShortID(StoreKeyJSON);
        let DependencyDirectoryPath = null;
        while (DependencyDirectoryPath == null)
        {
            let TestDependencyDirectoryPath = path.normalize(
                path.join(
                    AMJS.Namespace.GetEnvironmentDependenciesDirectory(),
                    DepID.toString(),
                    DependencyName
                )
            );
            let Duplicate = false;
            if (fs.existsSync(TestDependencyDirectoryPath))
            {
                for (let ProjectLink of ProjectLinks)
                {
                    if (ProjectLink.EntryDirectory == TestDependencyDirectoryPath)
                    {
                        Duplicate = !(APT.Core.System.ProjectManager.TryMatchProjectLink(Dependency, ProjectLink));
                        break;
                    }
                }
            }
            DependencyDirectoryPath = Duplicate ? null : TestDependencyDirectoryPath;
            ++DepID;
        }

        if (!fs.existsSync(DependencyDirectoryPath))
        {
            APT.Log("APT", `Cloning git repository ${GitDetails.RemoteURL} into ${DependencyDirectoryPath}`);
            const Git = simpleGit();
            await Git.clone(GitDetails.RemoteURL, DependencyDirectoryPath)
                .then(() => APT.Log("APT", `✅ Repo cloned to ${DependencyDirectoryPath}`))
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
        // {
        //     APT.Log("APT", `Updating git repository ${GitDetails.RemoteURL} at ${DependencyDirectoryPath}`);
        //     const Git = simpleGit(DependencyDirectoryPath);
        //     if ("Commit" in GitDetails)
        //     {
        //         const Commit = GitDetails.Commit;
        //         await Git.reset(['--hard', `${Commit}`]);
        //     }
        //     else
        //     if ("Branch" in GitDetails)
        //     {
        //         const Branch = GitDetails.Branch;
        //         await Git.reset(['--hard', `origin/${Branch}`]);
        //     }
        // }
        return DependencyDirectoryPath;
    }
    ImportDependentProject(Project, EntryDirectory, DependencyName, Dependency)
    {
        let ProjectManager = APT.Core.System.ProjectManager;
        
        let AdditionalOptions = new Object();
        if ("AdditionalOptions" in Dependency)
        {
            AdditionalOptions = Dependency.AdditionalOptions;
        }
        AdditionalOptions = Project.ShareAdditionalOptions(AdditionalOptions);

        let Required = true;
        if ("Required" in Dependency)
        {
            Required = Dependency.Required;
        }
        let DependentProject = ProjectManager.ImportProject([], EntryDirectory, AdditionalOptions, Required);
        return DependentProject;
    }
}