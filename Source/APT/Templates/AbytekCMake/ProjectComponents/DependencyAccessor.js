
const path = require("path");
const fs = require("fs");

AMJS.Import("../Utilities/ProjectStructure");
AMJS.Import("./ProjectStructure");

// Dependent components:
//
// Constructor-phase properties:
//      InstanceData.APT.Templates.AbytekCMake.ProjectComponents.DependencyAccessor.Config
//
// Init-phase properties:
AMJS.Namespace.F_DependencyAccessor = class extends APT.Core.A_ProjectComponent
{
    constructor(Project)
    {
        super(Project);

        APT.Templates.AbytekCMake.Utilities.ImportedResults = APT.Templates.AbytekCMake.Utilities.ImportedResults ?? new Map();

        this.Config = APT.Templates.CMake.Utilities.EnsureDirectConfig(
            APT.Common.TrySetPropertyByPath(
                Project.AdditionalOptions,
                "InstanceData.APT.Templates.AbytekCMake.ProjectComponents.DependencyAccessor.Config",
                APT.Common.TrySetPropertyByPath(
                    Project.AdditionalOptions,
                    "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.Config",
                    APT.Templates.CMake.Utilities.GetDefaultDirectConfig()
                )
            )
        );
    }

    GetCMakeBuildDirectory(Project)
    {
        let CMakeProjectStructure = Project.GetComponent(APT.Templates.CMake.ProjectComponents.F_ProjectStructure);
        return APT.Templates.AbytekCMake.Utilities.CalculateCMakeBuildDirectory(
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
                throw new Error(`Not found AbytekCMake/Import.js for ${Project.AbsoluteEntryFile}`);
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
}