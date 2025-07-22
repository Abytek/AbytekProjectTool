
const path = require("path");

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
            ImportedResult = require(this.GetImportJSFile(Project));
            APT.Templates.AbytekCMake.Utilities.ImportedResults.set(ImportKey, ImportedResult);
        }
        return ImportedResult;
    }
    GetTargetModule(Project, TargetName)
    {
        let ImportedResult = this.GetImportedResult(Project);
        return ImportedResult.Context.RequireModule(TargetName);
    }
}