
const path = require("path");

AMJS.Import("../Utilities/ProjectStructure");
AMJS.Import("./ProjectStructure");

AMJS.Namespace.F_DependencyAccessor = class extends APT.Core.A_ProjectComponent
{
    constructor(Project)
    {
        super(Project);

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

    GetCMakeBuildDirectoryPath(Project)
    {
        let CMakeProjectStructure = Project.GetComponent(APT.Templates.CMake.ProjectComponents.F_ProjectStructure);
        let AbytekCMakeProjectStructure = Project.GetComponent(APT.Templates.AbytekCMake.ProjectComponents.F_ProjectStructure);

        let Generator = CMakeProjectStructure.Generator;
        if (Generator == APT.Templates.CMake.Utilities.Generators.VS2022)
        {
            return Project.BuildDirectoryPath;
        }
        if (Generator == APT.Templates.CMake.Utilities.Generators.CLION)
        {
            if (this.Config == APT.Templates.CMake.Utilities.Configs.DEBUG)
            {
                return path.join(this.BuildDirectoryPath, "cmake-build-debug");
            }
            if (this.Config == APT.Templates.CMake.Utilities.Configs.RELEASE)
            {
                return path.join(this.BuildDirectoryPath, "cmake-build-release");
            }
            if (this.Config == APT.Templates.CMake.Utilities.Configs.REL_WITH_DEB_INFO)
            {
                return path.join(this.BuildDirectoryPath, "cmake-build-relwithdebinfo");
            }
            if (this.Config == APT.Templates.CMake.Utilities.Configs.MIN_SIZE_REL)
            {
                return path.join(this.BuildDirectoryPath, "cmake-build-minsizerel");
            }
        }
        return this.BuildDirectoryPath;
    }
    GetImportJSFilePath(Project)
    {
        return path.join(this.GetCMakeBuildDirectoryPath(Project), "APT.Import.js");
    }
    GetTargetFilePath(Project, TargetName)
    {
        let CMakeProjectStructure = Project.GetComponent(APT.Templates.CMake.ProjectComponents.F_ProjectStructure);
        let AbytekCMakeProjectStructure = Project.GetComponent(APT.Templates.AbytekCMake.ProjectComponents.F_ProjectStructure);

        let Generator = CMakeProjectStructure.Generator;
        if (Generator == APT.Templates.CMake.Utilities.Generators.VS2022)
        {
            
        }
    }
}