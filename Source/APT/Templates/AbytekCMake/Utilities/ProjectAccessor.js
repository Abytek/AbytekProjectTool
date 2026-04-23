
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.Import("./ProjectStructure");

AMJS.Namespace.F_ProjectAccessor = class
{
    constructor(DirectConfig)
    {
        APT.Templates.AbytekCMake.Utilities.ImportedResults = APT.Templates.AbytekCMake.Utilities.ImportedResults ?? new Map();

        this.Config = DirectConfig;
        if (this.Config == null)
        {
            this.Config = APT.Templates.CMake.Utilities.GetDefaultDirectConfig();
        }
        if (this.Config == null)
        {
            throw new Error(`Invalid config(null)`);
        }
    }

    GetCMakeBuildDirectory(Project)
    {
        let CMakeProjectStructure = Project.GetComponent(APT.Templates.CMake.ProjectComponents.F_ProjectStructure);
        return APT.Templates.CMake.Utilities.CalculateCMakeBuildDirectory(
            CMakeProjectStructure.BuildDirectory, 
            CMakeProjectStructure.Generator,
            this.Config
        );
    }
    GetImportJSFile(Project)
    {
        return path.join(this.GetCMakeBuildDirectory(Project), "AbytekCMake/Import.js");
    }
    GetImportedResult(Project)
    {
        let ImportKey = {
            Project,
            Config: this.Config
        };
        let ImportedResult = null;
        if (APT.Templates.AbytekCMake.Utilities.ImportedResults.has(ImportKey))
        {
            ImportedResult = APT.Templates.AbytekCMake.Utilities.ImportedResults.get(ImportKey);
        }
        else
        {
            let ImportJSFile = this.GetImportJSFile(Project);
            if (!fs.existsSync(ImportJSFile))
            {
                throw new Error(`Not found AbytekCMake/Import.js for ${Project.EntryDirectory}`);
            }

            let JSListFiles = require(ImportJSFile);
            ImportedResult = new Object();
            
            let JSContexts = [];
            for(let JSListFile of JSListFiles)
            {
                let JSList = require(JSListFile);
                let JSContextFile = JSList.JSContextFile;
                if (JSContextFile)
                {
                    if (fs.existsSync(JSContextFile))
                    {
                        let JSContext = require(JSContextFile);
                        JSContexts.push(JSContext);
                    }
                }
            }

            ImportedResult.JSContexts = JSContexts;

            APT.Templates.AbytekCMake.Utilities.ImportedResults.set(ImportKey, ImportedResult);
        }
        return ImportedResult;
    }
    GetModule(Project, TargetName, Required = true)
    {
        let ImportedResult = this.GetImportedResult(Project);
        for(let JSContext of ImportedResult.JSContexts)
        {
            if (TargetName in JSContext.ModuleFiles)
            {
                return JSContext.RequireModule(TargetName);
            }
        }
        if (Required)
        {
            throw new Error(`Not found target module ${TargetName}`);
        }
        return null;
    }
    ResolveModuleAutoProperty(Project, TargetName, AutoPropertyName)
    {
        let Module = this.GetModule(Project, TargetName);
        return Module.GetResolvedGeneratorExpression(AutoPropertyName, this.Config);
    }
    ResolveModuleRuntimeOutputDirectory(Project, TargetName)
    {
        return this.ResolveModuleAutoProperty(Project, TargetName, "RuntimeOutputDirectory");
    }
    ResolveModuleLibraryOutputDirectory(Project, TargetName)
    {
        return this.ResolveModuleAutoProperty(Project, TargetName, "LibraryOutputDirectory");
    }
    ResolveModuleArchiveOutputDirectory(Project, TargetName)
    {
        return this.ResolveModuleAutoProperty(Project, TargetName, "ArchiveOutputDirectory");
    }
    ResolveModuleTargetFile(Project, TargetName)
    {
        return this.ResolveModuleAutoProperty(Project, TargetName, "TargetFile");
    }

    Build(Project, TargetName)
    {
        if (Project == null)
        {
            throw new Error(`Invalid project`);
        }
        if (TargetName == null)
        {
            throw new Error(`Invalid target name`);
        }

        let CMakeProjectStructure = Project.GetComponent(APT.Templates.CMake.ProjectComponents.F_ProjectStructure);
        APT.Templates.CMake.Utilities.Build(CMakeProjectStructure, TargetName, this.Config);
    }
}