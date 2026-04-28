
const path = require("path");
const fs = require("fs");
const Ajv = require("ajv");


// Environment
{
    APT.Extensions.AbytekCMake.E_Environment = {
        DEVELOPMENT: "Development", 
        COOKED: "Cooked",
        COOKED_MAX_OPTIMIZED: "CookedMaxOptimized",
    }
    APT.Extensions.AbytekCMake.GetDefaultEnvironmentForPlatformTags = function(PlatformTags)
    {
        if (PlatformTags == null)
        {
            PlatformTags = APT.Common.GetHostPlatformTags();
        }
        if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
        {
            return APT.Extensions.AbytekCMake.E_Environment.DEVELOPMENT;
        }
        if (PlatformTags.includes(APT.Common.E_PlatformTag.MACOS))
        {
            return APT.Extensions.AbytekCMake.E_Environment.DEVELOPMENT;
        }
        if (PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
        {
            return APT.Extensions.AbytekCMake.E_Environment.COOKED;
        }
        APT.FatalError("APT", `Unknown platform tags: ${PlatformTags}`);
    }
}


// ProcessorArch
{
    APT.Extensions.AbytekCMake.GetDefaultProcessorArchForPlatformTags = function(PlatformTags)
    {
        // WebAssembly
        if (PlatformTags.includes(APT.Common.E_PlatformTag.EMSCRIPTEN) || PlatformTags.includes(APT.Common.E_PlatformTag.WEB))
        {
            return APT.Common.E_ProcessorArch.WASM;
        }

        // Mobile ARM
        if (PlatformTags.includes(APT.Common.E_PlatformTag.IOS) ||
            PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
        {
            return APT.Common.E_ProcessorArch.ARM_64; // modern default
        }

        // Desktop Linux/macOS
        if (PlatformTags.includes(APT.Common.E_PlatformTag.MACOS) ||
            PlatformTags.includes(APT.Common.E_PlatformTag.LINUX) ||
            PlatformTags.includes(APT.Common.E_PlatformTag.UNIX))
        {
            return APT.Common.E_ProcessorArch.X86_64; // default assumption
        }

        // Windows
        if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
        {
            return APT.Common.E_ProcessorArch.X86_64;
        }

        APT.FatalError("APT", `Cannot resolve processor arch from platform tags: ${PlatformTags}`);
    }
}


// Instance Config
{
    APT.Extensions.AbytekCMake.ValidateInstanceConfig = function(InstanceConfig)
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
                ProcessorArch: {
                    type: "string"
                }
            },
            additionalProperties: false,
            required: [
                "Environment",
                "Platform",
                "CMakeGenerator",
                "CMakeConfig",
                "ProcessorArch",
            ]
        };
        const Validator = ajv.compile(Schema);

        let Result = {
            Status: true,
            Errors: []
        };
        
        if (!Validator(InstanceConfig)) 
        {
            Result.Status = false;
            Result.Errors.push({
                Message: "Invalid syntax",
                ChildErrors: Validator.errors
            });
            return Result;
        }
        return Result;
    }
    APT.Extensions.AbytekCMake.FinalizeInstanceConfig = function(InstanceConfig)
    {
        let Validation = APT.Extensions.AbytekCMake.ValidateInstanceConfig(InstanceConfig);
        APT.Common.Assert(Validation.Status, APT.Common.NiceJSONStringify(Validation));
        let Result = APT.Common.SimpleDeepCopy(InstanceConfig);
        APT.Common.Assert(Result.CMakeConfig != APT.Extensions.CMake.E_Config.AUTO, "APT.Extensions.CMake.E_Config.AUTO is not allowed");
        APT.Common.Assert(Result.ProcessorArch != APT.Common.E_ProcessorArch.AUTO, "APT.Common.E_ProcessorArch.AUTO is not allowed");
        return Result;
    }
}


// Signature
{
    APT.Extensions.AbytekCMake.GetSignatureDataKeys = function()
    {
        return [
            "AbytekCMake.InstanceConfig",
        ];
    }
    APT.Extensions.AbytekCMake.CalculateSignature = function(InstanceConfig)
    {
        return [ 
            InstanceConfig.Environment,
            InstanceConfig.Platform,
            InstanceConfig.CMakeGenerator,
            InstanceConfig.CMakeConfig,
            InstanceConfig.ProcessorArch,
        ].join('-');
    }
}


// Build Directory
{
    APT.Extensions.AbytekCMake.CalculateBuildDirectory = function(EntryDirectory)
    {
        return path.join(EntryDirectory, "Build");
    }
    APT.Extensions.AbytekCMake.EnsureBuildDirectory = function(EntryDirectory)
    {
        const Path = APT.Extensions.AbytekCMake.CalculateBuildDirectory(EntryDirectory);
        fs.mkdirSync(Path, { recursive: true });
        return Path;
    }
}


// CMake Build Directory
{
    APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectoryConfig = function(
        EntryDirectory,
        InstanceConfig
    )
    {
        APT.Common.Assert(EntryDirectory, "Invalid entry directory");
        let Validation = APT.Extensions.AbytekCMake.ValidateInstanceConfig(InstanceConfig);
        APT.Common.Assert(Validation.Status, APT.Common.NiceJSONStringify(Validation));

        const BuildDirectory = APT.Extensions.AbytekCMake.CalculateBuildDirectory(EntryDirectory);
        const Signature = APT.Extensions.AbytekCMake.CalculateSignature(InstanceConfig);

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
        const SignatureHash = ShortHash(Signature);

        return {
            Path: path.join(BuildDirectory, SignatureHash),
            Signature,
            SignatureHash,
        };
    }
    APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectorySignatureFile = function(BuildDirectory, Signature)
    {
        return path.join(
            BuildDirectory,
            "CMakeBuildDirectorySignature-" + Signature + ".txt"
        );
    }
    APT.Extensions.AbytekCMake.GenerateCMakeBuildDirectorySignatureFile = function(EntryDirectory, InstanceConfig)
    {
        let Validation = APT.Extensions.AbytekCMake.ValidateInstanceConfig(InstanceConfig);
        APT.Common.Assert(Validation.Status, APT.Common.NiceJSONStringify(Validation));

        const CMakeBuildDirectoryConfig = APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectoryConfig(
            EntryDirectory,
            InstanceConfig
        );

        const CMakeBuildDirectorySignatureFile = APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectorySignatureFile(
            APT.Extensions.AbytekCMake.CalculateBuildDirectory(EntryDirectory),
            CMakeBuildDirectoryConfig.Signature
        );
        fs.writeFileSync(CMakeBuildDirectorySignatureFile, CMakeBuildDirectoryConfig.SignatureHash);
    }
}


// Engine Path File
{
    APT.Extensions.AbytekCMake.CalculateEnginePathFileName = function(InstanceConfig)
    {
        let Validation = APT.Extensions.AbytekCMake.ValidateInstanceConfig(InstanceConfig);
        APT.Common.Assert(Validation.Status, APT.Common.NiceJSONStringify(Validation));

        return "AbytekEnginePath-" + APT.Extensions.AbytekCMake.CalculateSignature(InstanceConfig) + ".txt";
    }
    APT.Extensions.AbytekCMake.CalculateEnginePathFile = function(EntryDirectory, InstanceConfig)
    {
        return path.join(
            APT.Extensions.AbytekCMake.CalculateBuildDirectory(EntryDirectory),
            APT.Extensions.AbytekCMake.CalculateEnginePathFileName(InstanceConfig)
        );
    }
    APT.Extensions.AbytekCMake.GenerateEnginePathFile = function(EntryDirectory, EngineEntryDirectory, InstanceConfig)
    {
        APT.Log("APT", `Generating engine path file, entry directory: ${EntryDirectory}, instance config: ${InstanceConfig}`);

        const EnginePathFile = APT.Extensions.AbytekCMake.CalculateEnginePathFile(EntryDirectory, InstanceConfig);
        APT.Extensions.AbytekCMake.EnsureBuildDirectory(EntryDirectory);
        
        fs.writeFileSync(EnginePathFile, EngineEntryDirectory.replaceAll("\\", "/"));

        APT.Log("APT", `Generated engine path file at: ${EnginePathFile}`);
    }
}


// CMakeLists.txt & CMake Configure
{
    APT.Extensions.AbytekCMake.CalculateCMakeListsFile = function(EntryDirectory)
    {
        return path.join(EntryDirectory, "CMakeLists.txt");
    }
    APT.Extensions.AbytekCMake.GenerateCMakeListsFile = function(Project)
    {
        APT.Extensions.AbytekCMake.EnsureBuildDirectory(Project.EntryDirectory);

        let ProjectName = Project.Data.Get("AbytekCMake.Name");

        const AbytekCMakeFile = path.join(Project.EntryDirectory, "AbytekCMake.txt");
        const AbytekCMakeFileContent = "";
        if (fs.existsSync(AbytekCMakeFile))
        {
            AbytekCMakeFileContent = fs.readFileSync(AbytekCMakeFile, "utf8");
        }

        const CMakeListsFile = APT.Extensions.AbytekCMake.CalculateCMakeListsFile(Project.EntryDirectory);
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

            Abytek_SetGlobal(ABYTEK_PROJECT_CMAKE_DEFINITIONS_FILE "\${ABYTEK_PROJECT_DIR}/Build/CMakeDefinitions-\${ABYTEK_CMAKE_SIGNATURE}.txt")
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

            ${AbytekCMakeFileContent}
        `;
        fs.writeFileSync(CMakeListsFile, CMakeListsFileContent);
    }
    APT.Extensions.AbytekCMake.CalculateCMakeConfigureExtraArguments = function(
        Project,
        InstanceConfig
    )
    {
        let EngineProject = Project.Data.Get("AbytekCMake.Engine");

        let EntryDirectory = Project.EntryDirectory;
        let EngineEntryDirectory = EngineProject.EntryDirectory;

        const ProjectCMakeBuildDirectoryConfig = APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectoryConfig(
            EntryDirectory,
            InstanceConfig
        );
        const EngineCMakeBuildDirectoryConfig = APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectoryConfig(
            EngineEntryDirectory,
            InstanceConfig
        );
        
        const Signature = APT.Extensions.AbytekCMake.CalculateSignature(InstanceConfig);

        let Result = [];
        Result.push(`-DCMAKE_POLICY_VERSION_MINIMUM="3.5"`);

        Result.push(`-DABYTEK_PROJECT_DIR="${APT.Common.ToCLIArgument(EntryDirectory)}"`);
        Result.push(`-DABYTEK_PROJECT_BUILD_DIR="${APT.Common.ToCLIArgument(ProjectCMakeBuildDirectoryConfig.Path)}"`);

        Result.push(`-DABYTEK_ENGINE_DIR="${APT.Common.ToCLIArgument(EngineEntryDirectory)}"`);
        Result.push(`-DABYTEK_ENGINE_BUILD_DIR="${APT.Common.ToCLIArgument(EngineCMakeBuildDirectoryConfig.Path)}"`);

        Result.push(`-DABYTEK_CMAKE_SIGNATURE="${Signature}"`);
        Result.push(`-DABYTEK_CMAKE_ENVIRONMENT="${InstanceConfig.Environment}"`);
        Result.push(`-DABYTEK_CMAKE_GENERATOR="${InstanceConfig.CMakeGenerator}"`);
        Result.push(`-DABYTEK_CMAKE_CONFIG="${InstanceConfig.CMakeConfig}"`);
        Result.push(`-DABYTEK_CMAKE_PROCESSOR_ARCH="${InstanceConfig.ProcessorArch}"`);

        return Result;
    }
}