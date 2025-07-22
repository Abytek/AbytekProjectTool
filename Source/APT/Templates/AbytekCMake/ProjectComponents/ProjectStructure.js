
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.ImportNamespace("../Utilities");
AMJS.ImportNamespace("../../CMake/ProjectComponents");

// Dependent components:
//      APT.Templates.Common.ProjectComponents.F_PlatformTags
//      APT.Templates.CMake.ProjectComponents.F_ProjectStructure
//
// Constructor-phase properties:
//      InstanceData.APT.Templates.AbytekCMake.ProjectComponents.ProjectStructure.AProjectType
//
// Init-phase properties:
AMJS.Namespace.F_ProjectStructure = class extends APT.Core.A_ProjectComponent
{
    constructor(Project)
    {
        super(Project);

        let PlatformTags = Project.EnsureComponent(APT.Templates.Common.ProjectComponents.F_ProjectStructure).PlatformTags;
        let CMakeProjectStructure = Project.EnsureComponent(APT.Templates.CMake.ProjectComponents.F_ProjectStructure);
        let Config = CMakeProjectStructure.Config;
        let Generator = CMakeProjectStructure.Generator;

        const AProjectType = APT.Common.ForwardString(
            APT.Common.TrySetPropertyByPath(
                Project.AdditionalOptions,
                "InstanceData.APT.Templates.AbytekCMake.ProjectComponents.ProjectStructure.AProjectType",
                APT.Templates.AbytekCMake.Utilities.GetDefaultAProjectType(PlatformTags)
            )
        );
        this.AProjectType = AProjectType;

        let CalculateBuildDirectoryParams =
        {
            AbsoluteProjectEntryFile: Project.AbsoluteEntryFile,
            PlatformTags,
            AProjectType,
            Config,
            Generator
        };
        const BuildDirectory = APT.Common.ForwardString(
            APT.Common.TrySetPropertyByPath(
                Project.AdditionalOptions,
                "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.BuildDirectory",
                APT.Templates.AbytekCMake.Utilities.CalculateBuildDirectory(CalculateBuildDirectoryParams)
            )
        );

        this.DefaultDirectConfig = APT.Common.TrySetPropertyByPath(
            Project.AdditionalOptions,
            "InstanceData.APT.Templates.AbytekCMake.ProjectComponents.ProjectStructure.DefaultDirectConfig",
            APT.Templates.CMake.Utilities.GetDefaultDirectConfig()
        );
    }

    Build(DirectConfig, TargetName)
    {
        let ParsedDirectConfig = DirectConfig;
        if (DirectConfig == null)
        {
            ParsedDirectConfig = this.DefaultDirectConfig;
        }

        let CMakeProjectStructure = this.Project.GetComponent(APT.Templates.CMake.ProjectComponents.F_ProjectStructure);
        let CMakeBuildDirectory = APT.Templates.AbytekCMake.Utilities.CalculateCMakeBuildDirectory(
            CMakeProjectStructure.BuildDirectory, 
            CMakeProjectStructure.Generator,
            ParsedDirectConfig
        );

        let TargetNameArgument = '';
        if (TargetName)
        {
            TargetNameArgument = `--target ${TargetName}`;   
        }
            
        execSync(
            `cmake --build "${CMakeBuildDirectory}" --config "${ParsedDirectConfig}" ${TargetNameArgument}
            `, { 
                stdio: 'inherit' 
            }
        );
        console.log(`Built ${this.Project.AbsoluteEntryFile} (Config: ${ParsedDirectConfig})`);
    }
}