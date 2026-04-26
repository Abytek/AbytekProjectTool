
const path = require("path");
const fs = require("fs");


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

    return [Environment, PlatformTags.sort().join("."), Generator, Config].join("-") + ".txt";
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
    fs.writeFileSync(EnginePathFile, EngineEntryDirectory);
    APT.Log("APT", `Generated engine path file at: ${EnginePathFile}`);
}
APT.Extensions.AbytekCMake.CalculateCMakeListsFile = function(EntryDirectory)
{
    return path.join(EntryDirectory, "CMakeLists.txt");
}
APT.Extensions.AbytekCMake.GenerateCMakeListsFile = function(EntryDirectory, ProjectName)
{
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

APT.Extensions.AbytekCMake.CalculateCMakeConfigureExtraArguments = function(Environment, EntryDirectory, CMakeBuildDirectory, CMakeConfig)
{
    let Result = [];
    Result.push(`-DCMAKE_POLICY_VERSION_MINIMUM="3.5`);
    if (!CMakeConfig.IsAuto)
    {
        Result.push(`-DCMAKE_BUILD_TYPE=${CMakeConfig.DirectConfig}`);
    }
    Result.push(`-DABYTEK_PROJECT_ENVIRONMENT_NAME="${Environment}"`);
    Result.push(`-DABYTEK_PROJECT_DIR="${EntryDirectory}"`);
    Result.push(`-DABYTEK_PROJECT_BUILD_DIR="${CMakeBuildDirectory}"`);
    return Result;
}