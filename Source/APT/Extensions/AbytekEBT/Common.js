
const path = require("path");
const fs = require("fs");
const Ajv = require("ajv");


// Environment
{
    APT.Extensions.AbytekEBT.E_Environment = {
        DEVELOPMENT: "Development", 
        COOKED: "Cooked",
        COOKED_MAX_OPTIMIZED: "CookedMaxOptimized",
    }
    APT.Extensions.AbytekEBT.GetDefaultEnvironmentForPlatformTags = function(PlatformTags)
    {
        if (PlatformTags == null)
        {
            PlatformTags = APT.Common.GetHostPlatformTags();
        }
        if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
        {
            return APT.Extensions.AbytekEBT.E_Environment.DEVELOPMENT;
        }
        if (PlatformTags.includes(APT.Common.E_PlatformTag.MACOS))
        {
            return APT.Extensions.AbytekEBT.E_Environment.DEVELOPMENT;
        }
        if (PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
        {
            return APT.Extensions.AbytekEBT.E_Environment.COOKED;
        }
        APT.FatalError("APT", `Unknown platform tags: ${PlatformTags}`);
    }
}


// ProcessorArch
{
    APT.Extensions.AbytekEBT.GetDefaultProcessorArchsForPlatformTags = function(PlatformTags)
    {
        // WebAssembly
        if (PlatformTags.includes(APT.Common.E_PlatformTag.EMSCRIPTEN) || PlatformTags.includes(APT.Common.E_PlatformTag.WEB))
        {
            return [ APT.Common.E_ProcessorArch.WASM ];
        }

        // Mobile ARM
        if (PlatformTags.includes(APT.Common.E_PlatformTag.IOS))
        {
            return [ APT.Common.E_ProcessorArch.ARM_64 ];
        }
        if (PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
        {
            return [ APT.Common.E_ProcessorArch.ARM_64 ];
        }

        // Desktop Linux/macOS
        if (PlatformTags.includes(APT.Common.E_PlatformTag.MACOS) ||
            PlatformTags.includes(APT.Common.E_PlatformTag.LINUX) ||
            PlatformTags.includes(APT.Common.E_PlatformTag.UNIX))
        {
            return [ APT.Common.E_ProcessorArch.X86_64 ];
        }

        // Windows
        if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
        {
            return [ APT.Common.E_ProcessorArch.X86_64 ];
        }

        APT.FatalError("APT", `Cannot resolve processor arch from platform tags: ${PlatformTags}`);
    }
}


// Instance Params
{
    APT.Extensions.AbytekEBT.ValidateProjectInstanceParams = function(InstanceParams)
    {
        const ajv = new Ajv();
        const Schema = {
            type: "object",
            properties: {
                Environment: {
                    type: "string"
                },
                Platform: {
                    type: "string"
                },
                Editor: {
                    type: "string"
                },
                CMakeGenerator: {
                    type: "string"
                },
                CMakeConfig: {
                    type: "string"
                },
                ProcessorArchs: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                }
            },
            additionalProperties: false,
            required: [
                "Environment",
                "Platform",
                "CMakeGenerator",
                "CMakeConfig",
                "ProcessorArchs",
            ]
        };
        const Validator = ajv.compile(Schema);

        let Result = {
            Status: true,
            Errors: []
        };
        
        if (!Validator(InstanceParams)) 
        {
            Result.Status = false;
            Result.Errors.push({
                Message: "Invalid syntax",
                ChildErrors: Validator.errors
            });
            return Result;
        }

        if (InstanceParams.CMakeConfig == APT.Extensions.CMake.E_Config.AUTO)
        {
            Result.Status = false;
            Result.Errors.push({
                Message: "APT.Extensions.CMake.E_Config.AUTO is not allowed",
                ChildErrors: []
            });
            return Result;
        };
        for (let ProcessorArch of InstanceParams.ProcessorArchs)
        {
            if (ProcessorArch == APT.Common.E_ProcessorArch.AUTO)
            {
                Result.Status = false;
                Result.Errors.push({
                    Message: "APT.Common.E_ProcessorArch.AUTO is not allowed",
                    ChildErrors: []
                });
                return Result;
            };
        }
        return Result;
    }
    APT.Extensions.AbytekEBT.FinalizeProjectInstanceParams = function(InstanceParams)
    {
        let Validation = APT.Extensions.AbytekEBT.ValidateProjectInstanceParams(InstanceParams);
        APT.Common.Assert(Validation.Status, APT.Common.NiceJSONStringify(Validation));
        let Result = APT.Common.SimpleDeepCopy(InstanceParams);
        return Result;
    }
}


// CMake Instance
{
    APT.Extensions.AbytekEBT.ValidateCMakeInstanceParams = function(CMakeInstanceParams)
    {
        const ajv = new Ajv();
        const Schema = {
            type: "object",
            properties: {
                ProjectInstanceParams: {
                    type: "object"
                },
                ProcessorArch: {
                    type: "string"
                }
            },
            additionalProperties: false,
            required: [
                "ProjectInstanceParams",
                "ProcessorArch"
            ]
        };
        const Validator = ajv.compile(Schema);

        let Result = {
            Status: true,
            Errors: []
        };
        
        if (!Validator(CMakeInstanceParams)) 
        {
            Result.Status = false;
            Result.Errors.push({
                Message: "Invalid syntax",
                ChildErrors: Validator.errors
            });
            return Result;
        }

        if (CMakeInstanceParams.ProcessorArch == APT.Common.E_ProcessorArch.AUTO)
        {
            Result.Status = false;
            Result.Errors.push({
                Message: "APT.Common.E_ProcessorArch.AUTO is not allowed",
                ChildErrors: []
            });
            return Result;
        };
        return Result;
    }
    APT.Extensions.AbytekEBT.FinalizeCMakeInstanceParams = function(CMakeInstanceParams)
    {
        let Validation = APT.Extensions.AbytekEBT.ValidateCMakeInstanceParams(CMakeInstanceParams);
        let Result = APT.Common.SimpleDeepCopy(CMakeInstanceParams);
        return Result;
    }
    APT.Extensions.AbytekEBT.ValidateCMakeInstanceQuery = function(CMakeInstanceQuery)
    {
        const ajv = new Ajv();
        const Schema = {
            type: "object",
            properties: {
                ProcessorArch: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                }
            },
            additionalProperties: false,
        };
        const Validator = ajv.compile(Schema);

        let Result = {
            Status: true,
            Errors: []
        };
        
        if (!Validator(CMakeInstanceQuery)) 
        {
            Result.Status = false;
            Result.Errors.push({
                Message: "Invalid syntax",
                ChildErrors: Validator.errors
            });
            return Result;
        }

        for (let ProcessorArch of CMakeInstanceQuery.ProcessorArchs)
        {
            if (ProcessorArch == APT.Common.E_ProcessorArch.AUTO)
            {
                Result.Status = false;
                Result.Errors.push({
                    Message: "APT.Common.E_ProcessorArch.AUTO is not allowed",
                    ChildErrors: []
                });
                return Result;
            };
        }
        return Result;
    }
    APT.Extensions.AbytekEBT.FinalizeCMakeInstanceQuery = function(CMakeInstanceQuery)
    {
        let Validation = APT.Extensions.AbytekEBT.ValidateCMakeInstanceQuery(CMakeInstanceQuery);
        let Result = APT.Common.SimpleDeepCopy(CMakeInstanceQuery);
        return Result;
    }
    APT.Extensions.AbytekEBT.F_CMakeInstance = class
    {
        constructor(Params)
        {
            let Validation = APT.Extensions.AbytekEBT.ValidateCMakeInstanceParams(Params);
            APT.Common.Assert(Validation.Status, APT.Common.NiceJSONStringify(Validation));

            this.Environment = Params.ProjectInstanceParams.Environment;
            this.Platform = Params.ProjectInstanceParams.Platform;
            this.CMakeGenerator = Params.ProjectInstanceParams.CMakeGenerator;
            this.CMakeConfig = Params.ProjectInstanceParams.CMakeConfig;
            this.ProcessorArch = Params.ProcessorArch;
        }
    }
}


// Project Instance
{
    APT.Extensions.AbytekEBT.F_ProjectInstance = class
    {
        constructor(Params)
        {
            let Validation = APT.Extensions.AbytekEBT.ValidateProjectInstanceParams(Params);
            APT.Common.Assert(Validation.Status, APT.Common.NiceJSONStringify(Validation));

            this.Environment = Params.Environment;
            this.Platform = Params.Platform;
            this.CMakeGenerator = Params.CMakeGenerator;
            this.CMakeConfig = Params.CMakeConfig;
            this.ProcessorArchs = Params.ProcessorArchs;

            // Generate processor archs
            this.CMakeInstances = [];
            for (let ProcessorArch of this.ProcessorArchs)
            {
                this.CMakeInstances.push(
                    new APT.Extensions.AbytekEBT.F_CMakeInstance(
                        APT.Extensions.AbytekEBT.FinalizeCMakeInstanceParams({
                            ProjectInstanceParams: Params,
                            ProcessorArch
                        })
                    )
                );
            }
        }

        FindCMakeInstances(Query)
        {
            let FinalizedQuery = APT.Extensions.AbytekEBT.FinalizeCMakeInstanceQuery(Query);
            let Result = [];
            for (let CMakeInstance of this.CMakeInstances)
            {
                if ("ProcessorArchs" in Query)
                {
                    if (!Query.ProcessorArchs.includes(CMakeInstance.ProcessorArch))
                    {
                        continue;
                    }
                }
                Result.push(CMakeInstance);
            }
            return Result;
        }
    }
}


// Signature
{
    APT.Extensions.AbytekEBT.GetSignatureDataKeys = function()
    {
        return [
            "AbytekEBT.Environment",
            "AbytekEBT.Platform",
            "AbytekEBT.CMakeGenerator",
            "AbytekEBT.CMakeConfig",
            "AbytekEBT.ProcessorArchs",
        ];
    }
    APT.Extensions.AbytekEBT.CalculateProjectSignature = function(ProjectInstance)
    {
        return [ 
            ProjectInstance.Environment,
            ProjectInstance.Platform,
            ProjectInstance.CMakeGenerator,
            ProjectInstance.CMakeConfig,
            ProjectInstance.ProcessorArchs.sort().join("."),
        ].join('-');
    }
    APT.Extensions.AbytekEBT.CalculateCMakeSignature = function(CMakeInstance)
    {
        return [ 
            CMakeInstance.Environment,
            CMakeInstance.Platform,
            CMakeInstance.CMakeGenerator,
            CMakeInstance.CMakeConfig,
            CMakeInstance.ProcessorArch,
        ].join('-');
    }
}


// Build Directory
{
    APT.Extensions.AbytekEBT.CalculateBuildDirectory = function(EntryDirectory)
    {
        return path.join(EntryDirectory, "Build");
    }
    APT.Extensions.AbytekEBT.EnsureBuildDirectory = function(EntryDirectory)
    {
        const Path = APT.Extensions.AbytekEBT.CalculateBuildDirectory(EntryDirectory);
        fs.mkdirSync(Path, { recursive: true });
        return Path;
    }
}


// CMake Build Directory
{
    APT.Extensions.AbytekEBT.CalculateCMakeBuildDirectoryConfig = function(
        EntryDirectory,
        CMakeInstance
    )
    {
        APT.Common.Assert(EntryDirectory, "Invalid entry directory");
        APT.Common.Assert(CMakeInstance, "Invalid cmake instance");
        
        const BuildDirectory = APT.Extensions.AbytekEBT.CalculateBuildDirectory(EntryDirectory);
        const CMakeSignature = APT.Extensions.AbytekEBT.CalculateCMakeSignature(CMakeInstance);

        function ShortHash(str) 
        {
            let hash = 0x811c9dc5;

            for (let i = 0; i < str.length; i++) {
                hash ^= str.charCodeAt(i);
                hash = Math.imul(hash, 0x01000193);
            }

            // unsigned 32-bit
            hash >>>= 0;

            // base36 + lấy 4 ký tự
            return hash.toString(36).slice(0, 4);
        }
        const CMakeSignatureHash = ShortHash(CMakeSignature);

        return {
            Directory: path.join(BuildDirectory, CMakeSignatureHash),
            CMakeSignatureHashFile: path.join(
                BuildDirectory,
                `CMakeBuildDirectorySignatureHash-${CMakeSignature}.txt`
            ),
            CMakeSignature,
            CMakeSignatureHash,
        };
    }
    APT.Extensions.AbytekEBT.GenerateCMakeBuildDirectorySignatureFiles = function(Project)
    {
        let ProjectInstance = Project.Data.Get("AbytekEBT.ProjectInstance");

        for (let CMakeInstance of ProjectInstance.CMakeInstances)
        {
            const CMakeBuildDirectoryConfig = APT.Extensions.AbytekEBT.CalculateCMakeBuildDirectoryConfig(
                Project.EntryDirectory,
                CMakeInstance
            );
            fs.writeFileSync(
                CMakeBuildDirectoryConfig.CMakeSignatureHashFile, 
                CMakeBuildDirectoryConfig.CMakeSignatureHash
            );
        }
    }
}


// Engine Path File
{
    APT.Extensions.AbytekEBT.CalculateEnginePathFileName = function(ProjectInstance)
    {
        return "AbytekEnginePath-" + APT.Extensions.AbytekEBT.CalculateProjectSignature(ProjectInstance) + ".txt";
    }
    APT.Extensions.AbytekEBT.CalculateEnginePathFile = function(EntryDirectory, ProjectInstance)
    {
        return path.join(
            APT.Extensions.AbytekEBT.CalculateBuildDirectory(EntryDirectory),
            APT.Extensions.AbytekEBT.CalculateEnginePathFileName(ProjectInstance)
        );
    }
    APT.Extensions.AbytekEBT.GenerateEnginePathFile = function(Project)
    {
        APT.Log("APT", `Generating engine path file, entry directory: ${Project.EntryDirectory}`);

        let ProjectInstance = Project.Data.Get("AbytekEBT.ProjectInstance");
        let EngineProject = Project.Data.Get("AbytekEBT.Engine");

        const EnginePathFile = APT.Extensions.AbytekEBT.CalculateEnginePathFile(Project.EntryDirectory, ProjectInstance);
        APT.Extensions.AbytekEBT.EnsureBuildDirectory(Project.EntryDirectory);
        
        fs.writeFileSync(EnginePathFile, EngineProject.EntryDirectory.replaceAll("\\", "/"));

        APT.Log("APT", `Generated engine path file at: ${EnginePathFile}`);
    }
}


// CMakeLists.txt & CMake Configure
{
    APT.Extensions.AbytekEBT.CalculateCMakeListsFile = function(EntryDirectory)
    {
        return path.join(EntryDirectory, "CMakeLists.txt");
    }
    APT.Extensions.AbytekEBT.GenerateCMakeListsFile = function(Project)
    {
        APT.Extensions.AbytekEBT.EnsureBuildDirectory(Project.EntryDirectory);

        let ProjectName = Project.Data.Get("AbytekEBT.Name");

        const AbytekEBTFile = path.join(Project.EntryDirectory, "AbytekEBT.txt");
        const AbytekEBTFileContent = "";
        if (fs.existsSync(AbytekEBTFile))
        {
            AbytekEBTFileContent = fs.readFileSync(AbytekEBTFile, "utf8");
        }

        const CMakeListsFile = APT.Extensions.AbytekEBT.CalculateCMakeListsFile(Project.EntryDirectory);
        const CMakeListsFileContent = `
            cmake_minimum_required(VERSION 3.14)

            if(APPLE)
                project("${ProjectName}" LANGUAGES C CXX OBJC OBJCXX)
            else()
                project("${ProjectName}" LANGUAGES C CXX)
            endif()

            set(CMAKE_MODULE_PATH "\${CMAKE_MODULE_PATH};\${ABYTEK_ENGINE_DIR}/CMake")
            include(Abytek/Utilities/SetGlobal)
            include(Abytek/Utilities/ReadKeyValueFile)

            Abytek_SetGlobal(ABYTEK_PROJECT_CMAKE_DEFINITIONS_FILE "\${ABYTEK_PROJECT_DIR}/Build/CMakeDefinitions-\${ABYTEK_EBT_PROJECT_SIGNATURE}.txt")
            Abytek_ReadKeyValueFile(\${ABYTEK_PROJECT_CMAKE_DEFINITIONS_FILE})

            add_subdirectory("\${ABYTEK_ENGINE_DIR}" "\${ABYTEK_ENGINE_BUILD_DIR}")

            set(FETCHCONTENT_BASE_DIR "\${CMAKE_CURRENT_BINARY_DIR}/Dependencies")

            include(Abytek/Utilities/SetupModules)

            include(Abytek/SetupIDE)
            include(Abytek/SetupCompiler)
            include(Abytek/SetupDependencies)

            Abytek_SetGlobal(CMAKE_MODULE_PATH "${"${CMAKE_MODULE_PATH}"};${"${CMAKE_CURRENT_LIST_DIR}"}/CMake")

            if(EXISTS "\${CMAKE_CURRENT_LIST_DIR}/Modules")
                Abytek_SetupModules_MultiplePhases(
                    "${ProjectName}" 
                    "\${CMAKE_CURRENT_LIST_DIR}/Modules"
                )
            endif()

            ${AbytekEBTFileContent}
        `;
        fs.writeFileSync(CMakeListsFile, CMakeListsFileContent);
    }
    APT.Extensions.AbytekEBT.CalculateCMakeConfigureExtraArguments = function(
        Project,
        CMakeInstance
    )
    {
        let ProjectInstance = Project.Data.Get("AbytekEBT.ProjectInstance");
        let EngineProject = Project.Data.Get("AbytekEBT.Engine");

        let EntryDirectory = Project.EntryDirectory;
        let EngineEntryDirectory = EngineProject.EntryDirectory;

        const ProjectCMakeBuildDirectoryConfig = APT.Extensions.AbytekEBT.CalculateCMakeBuildDirectoryConfig(
            EntryDirectory,
            CMakeInstance
        );
        const EngineCMakeBuildDirectoryConfig = APT.Extensions.AbytekEBT.CalculateCMakeBuildDirectoryConfig(
            EngineEntryDirectory,
            CMakeInstance
        );
        
        const ProjectSignature = APT.Extensions.AbytekEBT.CalculateProjectSignature(ProjectInstance);
        const CMakeSignature = APT.Extensions.AbytekEBT.CalculateCMakeSignature(CMakeInstance);
        
        let Result = [];
        Result.push(`-DCMAKE_POLICY_VERSION_MINIMUM="3.5"`);

        // The most important
        Result.push(`-DABYTEK_ENGINE_DIR="${APT.Common.ToCLIArgument(EngineEntryDirectory)}"`);
        Result.push(`-DABYTEK_PROJECT_DIR="${APT.Common.ToCLIArgument(EntryDirectory)}"`);
        Result.push(`-DABYTEK_EBT_ENVIRONMENT="${CMakeInstance.Environment}"`);
        Result.push(`-DABYTEK_EBT_PLATFORM="${CMakeInstance.Platform}"`);
        Result.push(`-DABYTEK_EBT_CMAKE_GENERATOR="${CMakeInstance.CMakeGenerator}"`);
        Result.push(`-DABYTEK_EBT_CMAKE_CONFIG="${CMakeInstance.CMakeConfig}"`);
        Result.push(`-DABYTEK_EBT_PROCESSOR_ARCHS="${APT.Extensions.CMake.CalculateCMakeValue_Array(ProjectInstance.ProcessorArchs)}"`);
        Result.push(`-DABYTEK_EBT_PROJECT_SIGNATURE="${ProjectSignature}"`);

        // For cmake instances to generate
        Result.push(`-DABYTEK_EBT_PROCESSOR_ARCH="${CMakeInstance.ProcessorArch}"`);
        Result.push(`-DABYTEK_EBT_CMAKE_SIGNATURE="${CMakeSignature}"`);

        //
        Result.push(`-DABYTEK_ENGINE_BUILD_DIR="${APT.Common.ToCLIArgument(EngineCMakeBuildDirectoryConfig.Directory)}"`);
        Result.push(`-DABYTEK_PROJECT_BUILD_DIR="${APT.Common.ToCLIArgument(ProjectCMakeBuildDirectoryConfig.Directory)}"`);

        return Result;
    }
}