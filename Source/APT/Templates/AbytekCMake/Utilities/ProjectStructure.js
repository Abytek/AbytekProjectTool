
const path = require("path");
const fs = require("fs");

AMJS.Namespace.AProjectTypes =
{
    STANDALONE: "Standalone",
}

AMJS.Namespace.GetDefaultAProjectType = function(PlatformTags)
{
    return AMJS.Namespace.AProjectTypes.STANDALONE;
}

AMJS.Namespace.CalculateTopmostBuildDirectory = function(ProjectEntryDirectory)
{
    return path.join(ProjectEntryDirectory, "Build");
}

// Options
// - ProjectEntryDirectory
// - PlatformTags
// - AProjectType
// - Generator
// - Config
AMJS.Namespace.CalculateBuildDirectoryConfig = function(Options)
{
    APT.Common.Assert(Options);
    const ProjectEntryDirectory = APT.Common.Assert(Options.ProjectEntryDirectory);
    const PlatformTags = APT.Common.Assert(Options.PlatformTags);
    const AProjectType = APT.Common.Assert(Options.AProjectType);
    const Config = APT.Common.Assert(Options.Config);
    const Generator = APT.Common.Assert(Options.Generator);
    const EnvironmentName = APT.Common.Assert(Options.EnvironmentName);

    const TopmostBuildDirectory = AMJS.Namespace.CalculateTopmostBuildDirectory(ProjectEntryDirectory);

    const Signature = path.join(EnvironmentName, AProjectType, PlatformTags.sort().join("."), Generator, Config).replaceAll("\\", "/").replaceAll("/", "-");

    function shortHash(str) {
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
    const SignatureHash = shortHash(Signature);

    return {
        Path: path.join(TopmostBuildDirectory, SignatureHash),
        Signature: Signature,
        SignatureHash: SignatureHash,
    };
}

AMJS.Namespace.ShouldGenerateCMakeLists = function(ProjectStructure)
{
    const ProjectEntryDirectory = ProjectStructure.Project.EntryDirectory;
    const AbytekCMakeFilePath = path.join(ProjectEntryDirectory, "AbytekCMake.txt");
    return !ProjectStructure.IsEngine; // fs.existsSync(AbytekCMakeFilePath);
}
AMJS.Namespace.GenerateCMakeLists = function(ProjectStructure)
{
    const ProjectEntryDirectory = ProjectStructure.Project.EntryDirectory;
    const PlatformTags = ProjectStructure.Project.PlatformTags;
    const AProjectType = ProjectStructure.Project.AProjectType;
    const Config = ProjectStructure.Project.Config;
    const Generator = ProjectStructure.Project.Generator;

    const EngineProject = AMJS.ModuleSystem.GlobalContext.Abytek.EngineProject;
    const EngineEntryDirectory = EngineProject.EntryDirectory.replaceAll("\\", "/");
    const EngineCMakeProjectStructure = EngineProject.EnsureComponent(APT.Templates.CMake.ProjectComponents.F_ProjectStructure);
    const EngineProjectBuildDirectory = EngineCMakeProjectStructure.BuildDirectory.replaceAll("\\", "/");

    const ParsedProjectName = ProjectStructure.Project.Name.replaceAll("\\", "/").replaceAll("/", ".").replaceAll(":", "");

    const AbytekCMakeFilePath = path.join(ProjectEntryDirectory, "AbytekCMake.txt");
    const AbytekCMakeContent = "";
    if (fs.existsSync(AbytekCMakeFilePath))
    {
        AbytekCMakeContent = fs.readFileSync(AbytekCMakeFilePath).toString();
    }

    const CMakeListsPath = path.join(ProjectEntryDirectory, "CMakeLists.txt");
    const CMakeListsContent = `
        cmake_minimum_required(VERSION 3.14)

        if(APPLE)
            project("${ParsedProjectName}" LANGUAGES C CXX OBJC OBJCXX)
        else()
            project("${ParsedProjectName}" LANGUAGES C CXX)
        endif()

        add_subdirectory("${EngineEntryDirectory}" "${EngineProjectBuildDirectory}")

        set(FETCHCONTENT_BASE_DIR "\${CMAKE_CURRENT_BINARY_DIR}/Dependencies")

        include(Abytek/Utilities/SetGlobal)
        include(Abytek/Utilities/SetupModules)

        include(Abytek/SetupIDE)
        include(Abytek/SetupCompiler)
        include(Abytek/SetupDependencies)

        Abytek_SetGlobal(CMAKE_MODULE_PATH "${"${CMAKE_MODULE_PATH}"};${"${CMAKE_CURRENT_LIST_DIR}"}/CMake")

        if(EXISTS "\${CMAKE_CURRENT_LIST_DIR}/Modules")
            Abytek_SetupModules_MultiplePhases(
                "${ParsedProjectName}" 
                "\${CMAKE_CURRENT_LIST_DIR}/Modules"
            )
        endif()

        ${AbytekCMakeContent}
    `;

    fs.writeFileSync(CMakeListsPath, CMakeListsContent);
}

AMJS.Namespace.GenerateEnginePathFile = function(ProjectStructure)
{
    const CMakeProjectStructure = ProjectStructure.Project.EnsureComponent(APT.Templates.CMake.ProjectComponents.F_ProjectStructure);
    if (!fs.existsSync(CMakeProjectStructure.BuildDirectory))
    {
        fs.mkdirSync(CMakeProjectStructure.BuildDirectory, { recursive: true });
    }
    const EnginePathFilePath = path.join(CMakeProjectStructure.BuildDirectory, "AbytekEnginePath.txt");
    fs.writeFileSync(EnginePathFilePath, AMJS.ModuleSystem.GlobalContext.Abytek.EngineProject.EntryDirectory);
}
AMJS.Namespace.GenerateBuildDirectorySignatureFile = function(ProjectStructure)
{
    const BuildDirectorySignaturePath = path.join(
        AMJS.Namespace.CalculateTopmostBuildDirectory(ProjectStructure.Project.EntryDirectory), 
        `${ProjectStructure.BuildDirectorySignature}.txt`
    );
    fs.writeFileSync(BuildDirectorySignaturePath, ProjectStructure.BuildDirectorySignatureHash);
}
