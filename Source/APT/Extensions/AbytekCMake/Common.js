
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


// Editor
{
    APT.Extensions.AbytekCMake.E_Editor = {
        VISUAL_STUDIO_2026: "VisualStudio2026", 
        VISUAL_STUDIO_2022: "VisualStudio2022", 
        ANDROID_STUDIO: "AndroidStudio",   
    }
    APT.Extensions.AbytekCMake.GetDefaultEditorForPlatformTags = function(PlatformTags)
    {
        if (PlatformTags == null)
        {
            PlatformTags = APT.Common.GetHostPlatformTags();
        }
        if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
        {
            let InstalledVSVersions = APT.Common.GetInstalledVSVersions();
            if (InstalledVSVersions.includes("2026"))
            {
                return APT.Extensions.AbytekCMake.E_Editor.VISUAL_STUDIO_2026;
            }
            if (InstalledVSVersions.includes("2022"))
            {
                return APT.Extensions.AbytekCMake.E_Editor.VISUAL_STUDIO_2022;
            }
        }
        if (PlatformTags.includes(APT.Common.E_PlatformTag.MACOS))
        {
            return APT.Extensions.AbytekCMake.E_Editor.XCODE;
        }
        if (PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
        {
            return APT.Extensions.AbytekCMake.E_Editor.ANDROID_STUDIO;
        }
        APT.FatalError("APT", `Unknown platform tags: ${PlatformTags}`);
    }
    APT.Extensions.AbytekCMake.GetDefaultCMakeGeneratorForEditor = function(Editor)
    {
        if (Editor.includes(APT.Extensions.AbytekCMake.E_Editor.VISUAL_STUDIO_2026))
        {
            return APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2026;
        }
        if (Editor.includes(APT.Extensions.AbytekCMake.E_Editor.VISUAL_STUDIO_2022))
        {
            return APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2026;
        }
        if (Editor.includes(APT.Extensions.AbytekCMake.E_Editor.ANDROID_STUDIO))
        {
            return APT.Extensions.CMake.E_Generator.NINJA;
        }
        APT.FatalError("APT", `Unknown editor: ${Editor}`);
    }
    APT.Extensions.AbytekCMake.GetDefaultCMakeConfigForEditor = function(Editor)
    {
        let CMakeGenerator = APT.Extensions.AbytekCMake.GetDefaultCMakeGeneratorForEditor(Editor);
        return APT.Extensions.CMake.GetDefaultConfigForGenerator(CMakeGenerator);
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
                }
            },
            additionalProperties: false,
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
        APT.Common.Assert(Validation.Status, Validation);
        APT.Common.Assert(InstanceConfig.Environment, `Missing environment`);
        APT.Common.Assert(InstanceConfig.Platform, `Missing platform`);
        APT.Common.Assert(InstanceConfig.Editor, `Missing editor`);

        let Result = APT.Common.SimpleDeepCopy(InstanceConfig);
        if (Result.CMakeGenerator == null)
        {
            Result.CMakeGenerator = APT.Extensions.AbytekCMake.GetDefaultCMakeGeneratorForEditor(Result.Editor);
        }
        if (Result.CMakeConfig == null)
        {
            Result.CMakeConfig = APT.Extensions.AbytekCMake.GetDefaultCMakeConfigForEditor(Result.Editor);
        }
        return Result;
    }
    APT.Extensions.AbytekCMake.FinalizeDirectInstanceConfig = function(InstanceConfig, DirectInstanceConfig)
    {
        return APT.Common.MergeData(InstanceConfig, DirectInstanceConfig);
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
            InstanceConfig.Editor,
            InstanceConfig.CMakeGenerator,
            InstanceConfig.CMakeConfig,
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
        APT.Common.Assert(Validation.Status, Validation);

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
        APT.Common.Assert(Validation.Status, Validation);

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
        APT.Common.Assert(Validation.Status, Validation);

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
        Result.push(`-DABYTEK_CMAKE_EDITOR="${InstanceConfig.Editor}"`);
        Result.push(`-DABYTEK_CMAKE_GENERATOR="${InstanceConfig.CMakeGenerator}"`);
        Result.push(`-DABYTEK_CMAKE_CONFIG="${InstanceConfig.CMakeConfig}"`);

        return Result;
    }
}