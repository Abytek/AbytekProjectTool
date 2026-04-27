
const path = require("path");
const fs = require("fs");


APT.Extensions.AbytekCMake.E_Environment = {
    DEVELOPMENT: "Development", 
    COOKED: "Cooked",
    COOKED_MAX_OPTIMIZED: "CookedMaxOptimized",
}
APT.Extensions.AbytekCMake.GetDefaultEnvironment = function(PlatformTags)
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

APT.Extensions.AbytekCMake.E_Editor = {
    VISUAL_STUDIO_2026: "VisualStudio2026", 
    VISUAL_STUDIO_2022: "VisualStudio2022", 
    ANDROID_STUDIO: "AndroidStudio",   
}
APT.Extensions.AbytekCMake.GetDefaultEditor = function(PlatformTags)
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

APT.Extensions.AbytekCMake.GetSignatureDataKeys = function()
{
    return [
        "AbytekCMake.Environment",
        "AbytekCMake.PlatformTags",
        "AbytekCMake.Editor",
    ];
}
APT.Extensions.AbytekCMake.CalculateSignature = function(Environment, PlatformTags, Editor)
{
    return Environment + "-" + PlatformTags.join(".") + "-" + Editor;
}

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

APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectorySignature = function(
    Environment,
    PlatformTags,
    Generator,
    Config
)
{
    APT.Common.Assert(Environment, "Invalid environment");
    APT.Common.Assert(PlatformTags, "Invalid platform tags");
    APT.Common.Assert(Generator, "Invalid generator");
    APT.Common.Assert(Config, "Invalid config");

    return [Environment, PlatformTags.sort().join("."), Generator, Config].join("-");
}

APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectoryConfig = function(
    EntryDirectory,
    Environment,
    PlatformTags,
    Generator,
    Config
)
{
    APT.Common.Assert(EntryDirectory, "Invalid entry directory");
    APT.Common.Assert(Environment, "Invalid environment");
    APT.Common.Assert(PlatformTags, "Invalid platform tags");
    APT.Common.Assert(Generator, "Invalid generator");
    APT.Common.Assert(Config, "Invalid config");

    const BuildDirectory = APT.Extensions.AbytekCMake.CalculateBuildDirectory(EntryDirectory);
    const Signature = APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectorySignature(
        Environment,
        PlatformTags,
        Generator,
        Config
    );

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

APT.Extensions.AbytekCMake.GenerateCMakeBuildDirectorySignatureFile = function(Project, CMakeConfig)
{
    let Editor = Project.Data.Get("AbytekCMake.Editor");
    let Environment = Project.Data.Get("AbytekCMake.Environment");
    let PlatformTags = Project.Data.Get("AbytekCMake.PlatformTags");
    
    let CMakeGenerator = APT.Extensions.AbytekCMake.GetDefaultCMakeGeneratorForEditor(Editor);
    if (CMakeConfig == null)
    {
        CMakeConfig = APT.Extensions.CMake.GetDefaultConfigForGenerator(CMakeGenerator);
    }
    
    const CMakeBuildDirectoryConfig = APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectoryConfig(
        Project.EntryDirectory,
        Environment,
        PlatformTags,
        CMakeGenerator,
        CMakeConfig
    );

    const CMakeBuildDirectorySignatureFile = APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectorySignatureFile(
        APT.Extensions.AbytekCMake.CalculateBuildDirectory(Project.EntryDirectory),
        CMakeBuildDirectoryConfig.Signature
    );
    fs.writeFileSync(CMakeBuildDirectorySignatureFile, CMakeBuildDirectoryConfig.SignatureHash);
}

APT.Extensions.AbytekCMake.CalculateEnginePathFileName = function(Environment, PlatformTags, Editor)
{
    return "AbytekEnginePath-" + APT.Extensions.AbytekCMake.CalculateSignature(Environment, PlatformTags, Editor) + ".txt";
}
APT.Extensions.AbytekCMake.CalculateEnginePathFile = function(EntryDirectory, Environment, PlatformTags, Editor)
{
    return path.join(
        APT.Extensions.AbytekCMake.CalculateBuildDirectory(EntryDirectory),
        APT.Extensions.AbytekCMake.CalculateEnginePathFileName(Environment, PlatformTags, Editor)
    );
}
APT.Extensions.AbytekCMake.GenerateEnginePathFile = function(EntryDirectory, Environment, PlatformTags, Editor, EngineEntryDirectory)
{
    APT.Log("APT", `Generating engine path file, entry directory: ${EntryDirectory}, environment: ${Environment}, platform tags: ${PlatformTags}, engine entry directory: ${EngineEntryDirectory}`);
    const EnginePathFile = APT.Extensions.AbytekCMake.CalculateEnginePathFile(EntryDirectory, Environment, PlatformTags, Editor);
    APT.Extensions.AbytekCMake.EnsureBuildDirectory(EntryDirectory);
    fs.writeFileSync(EnginePathFile, EngineEntryDirectory);
    APT.Log("APT", `Generated engine path file at: ${EnginePathFile}`);
}
APT.Extensions.AbytekCMake.CalculateCMakeListsFile = function(EntryDirectory)
{
    return path.join(EntryDirectory, "CMakeLists.txt");
}
APT.Extensions.AbytekCMake.GenerateCMakeListsFile = function(EntryDirectory, ProjectName)
{
    APT.Extensions.AbytekCMake.EnsureBuildDirectory(EntryDirectory);

    const AbytekCMakeFile = path.join(EntryDirectory, "AbytekCMake.txt");
    const AbytekCMakeFileContent = "";
    if (fs.existsSync(AbytekCMakeFile))
    {
        AbytekCMakeFileContent = fs.readFileSync(AbytekCMakeFile, "utf8");
    }

    const CMakeListsFile = APT.Extensions.AbytekCMake.CalculateCMakeListsFile(EntryDirectory);
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

APT.Extensions.AbytekCMake.CalculateCMakeConfigureExtraArguments = function(Project, CMakeConfig)
{
    let ProjectCMakeBuildDirectoryConfig = null;
    {
        let Editor = Project.Data.Get("AbytekCMake.Editor");
        let Environment = Project.Data.Get("AbytekCMake.Environment");
        let PlatformTags = Project.Data.Get("AbytekCMake.PlatformTags");
        
        let CMakeGenerator = APT.Extensions.AbytekCMake.GetDefaultCMakeGeneratorForEditor(Editor);
        if (CMakeConfig == null)
        {
            CMakeConfig = APT.Extensions.CMake.GetDefaultConfigForGenerator(CMakeGenerator);
        }

        ProjectCMakeBuildDirectoryConfig = APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectoryConfig(
            Project.EntryDirectory,
            Environment,
            PlatformTags,
            CMakeGenerator,
            CMakeConfig
        );
    }

    let EngineProject = Project.Data.Get("AbytekCMake.Engine");
    let EngineEnvironment = null;
    let EngineCMakeBuildDirectoryConfig = null;
    let EngineEditor = null;
    let EngineCMakeGenerator = null;
    let EngineSignature = null;
    {
        EngineEditor = EngineProject.Data.Get("AbytekCMake.Editor");
        EngineEnvironment = EngineProject.Data.Get("AbytekCMake.Environment");
        let PlatformTags = EngineProject.Data.Get("AbytekCMake.PlatformTags");
        
        EngineCMakeGenerator = APT.Extensions.AbytekCMake.GetDefaultCMakeGeneratorForEditor(EngineEditor);
        if (CMakeConfig == null)
        {
            CMakeConfig = APT.Extensions.CMake.GetDefaultConfigForGenerator(EngineCMakeGenerator);
        }

        EngineSignature = APT.Extensions.AbytekCMake.CalculateSignature(EngineEnvironment, PlatformTags, Editor);

        EngineCMakeBuildDirectoryConfig = APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectoryConfig(
            EngineProject.EntryDirectory,
            EngineEnvironment,
            PlatformTags,
            EngineCMakeGenerator,
            CMakeConfig
        );
    }

    let Result = [];
    Result.push(`-DCMAKE_POLICY_VERSION_MINIMUM="3.5"`);
    if (CMakeConfig != APT.Extensions.CMake.E_Config.AUTO)
    {
        Result.push(`-DCMAKE_BUILD_TYPE=${CMakeConfig}`);
    }

    Result.push(`-DABYTEK_PROJECT_DIR="${APT.Common.ToCLIArgument(Project.EntryDirectory)}"`);
    Result.push(`-DABYTEK_PROJECT_BUILD_DIR="${APT.Common.ToCLIArgument(ProjectCMakeBuildDirectoryConfig.Path)}"`);

    Result.push(`-DABYTEK_ENGINE_DIR="${APT.Common.ToCLIArgument(EngineProject.EntryDirectory)}"`);
    Result.push(`-DABYTEK_ENGINE_BUILD_DIR="${APT.Common.ToCLIArgument(EngineCMakeBuildDirectoryConfig.Path)}"`);

    Result.push(`-DABYTEK_CMAKE_SIGNATURE="${EngineSignature}"`);
    Result.push(`-DABYTEK_CMAKE_ENVIRONMENT="${EngineEnvironment}"`);
    Result.push(`-DABYTEK_CMAKE_EDITOR="${EngineEditor}"`);
    Result.push(`-DABYTEK_CMAKE_GENERATOR="${EngineCMakeGenerator}"`);
    Result.push(`-DABYTEK_CMAKE_CONFIG="${CMakeConfig}"`);

    return Result;
}