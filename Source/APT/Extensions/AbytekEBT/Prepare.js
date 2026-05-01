
const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

AMJS.Import("./Common");
AMJS.Import("./CMakeConfigure");
AMJS.Import("./CMakeBuild");


APT.Extensions.AbytekEBT.E_PrepareMode = {
    CMAKE_CONFIGURE: "CMakeConfigure",
    CMAKE_BUILD: "CMakeBuild",
    BUILD_APPLICATION: "BuildApplication",
};
APT.Extensions.AbytekEBT.GetDefaultPrepareMode = function(PlatformTags)
{
    if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
    {
        return APT.Extensions.AbytekEBT.E_PrepareMode.CMAKE_CONFIGURE;
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
    {
        return APT.Extensions.AbytekEBT.E_PrepareMode.CMAKE_CONFIGURE;
    }
    throw new Error(`Unknown platform tags: ${PlatformTags}`);
}
APT.Extensions.AbytekEBT.PrepareModeShouldCMakeConfigure = function(PrepareMode)
{
    return (
        (PrepareMode == APT.Extensions.AbytekEBT.E_PrepareMode.CMAKE_CONFIGURE)
        || (PrepareMode == APT.Extensions.AbytekEBT.E_PrepareMode.CMAKE_BUILD)
        || (PrepareMode == APT.Extensions.AbytekEBT.E_PrepareMode.BUILD_APPLICATION)
    );
}
APT.Extensions.AbytekEBT.PrepareModeShouldCMakeBuild = function(PrepareMode)
{
    return (
        (PrepareMode == APT.Extensions.AbytekEBT.E_PrepareMode.CMAKE_BUILD)
        || (PrepareMode == APT.Extensions.AbytekEBT.E_PrepareMode.BUILD_APPLICATION)
    );
}
APT.Extensions.AbytekEBT.PrepareModeShouldBuildApplication = function(PrepareMode)
{
    return (
        (PrepareMode == APT.Extensions.AbytekEBT.E_PrepareMode.BUILD_APPLICATION)
    );
}

APT.Extensions.AbytekEBT.PrepareWindows = function(Scope)
{
    APT.Log("APT", `Start preparing project: ${Scope.EntryDirectory}`);

    let ProjectInstance = Scope.Data.Get("AbytekEBT.ProjectInstance");
    let PrepareMode = Scope.Data.Get("AbytekEBT.Prepare.Mode");
    let PrepareApplicationFilter = Scope.Get("AbytekEBT.Prepare.ApplicationFilter");

    for (let CMakeInstance of ProjectInstance.CMakeInstances)
    {
        if (APT.Extensions.AbytekEBT.PrepareModeShouldCMakeConfigure(PrepareMode))
        {
            APT.Extensions.AbytekEBT.CMakeConfigure(Scope, CMakeInstance);
        }
        if (APT.Extensions.AbytekEBT.PrepareModeShouldCMakeBuild(PrepareMode))
        {
            for (let PrepareApplicationName of PrepareApplicationFilter)
            {
                APT.Extensions.AbytekEBT.CMakeBuild(Scope, CMakeInstance, `${PrepareApplicationName}.CookedExecutable`);
            }
        }
    }
    APT.Log("APT", `Prepared project: ${Scope.EntryDirectory}`);
}
APT.Extensions.AbytekEBT.PrepareAndroid = function(Scope)
{
    APT.Log("APT", `Start preparing project: ${Scope.EntryDirectory}`);

    let Engine = Scope.Get("AbytekEBT.Engine");

    let ProjectInstance = Scope.Data.Get("AbytekEBT.ProjectInstance");
    let PrepareMode = Scope.Data.Get("AbytekEBT.Prepare.Mode");
    let PrepareApplicationFilter = Scope.Get("AbytekEBT.Prepare.ApplicationFilter");

    let ShouldCMakeConfigure = APT.Extensions.AbytekEBT.PrepareModeShouldCMakeConfigure(PrepareMode);
    let ShouldCMakeBuild = APT.Extensions.AbytekEBT.PrepareModeShouldCMakeBuild(PrepareMode);
    let ShouldBuildApplication = APT.Extensions.AbytekEBT.PrepareModeShouldBuildApplication(PrepareMode);

    if (
        ShouldCMakeConfigure
        || ShouldCMakeBuild
        || ShouldBuildApplication
    )
    {
        for (let PrepareApplicationName of PrepareApplicationFilter)
        {
            const AndroidProjectDirectory = path.join(
                Scope.EntryDirectory,
                "Platforms",
                "Android",
                "Projects",
                PrepareApplicationName
            ).replaceAll("\\", "/");
            
            // Ensure android project
            const AndroidProjectTemplateDirectory = path.join(
                Engine.EntryDirectory,
                "Platforms",
                "Android",
                "Templates",
                "Application"
            ).replaceAll("\\", "/");
            if (!fs.existsSync(AndroidProjectDirectory))
            {
                fs.cpSync(AndroidProjectTemplateDirectory, AndroidProjectDirectory, { recursive: true });
            }

            // Generate app-specific configs
            {
                const ApplicationLibTxtFile = path.join(AndroidProjectDirectory, "app", "application-lib.txt");
                const ApplicationPackageTxtFile = path.join(AndroidProjectDirectory, "app", "application-package.txt");

                function ProcessApplicationPackage(str) 
                {
                    return str
                        .split('.')
                        .map(s => s.charAt(0).toLowerCase() + s.slice(1))
                        .join('.');
                }
                const ApplicationLib = PrepareApplicationName + ".CookedExecutable";
                const ApplicationPackage = "com." + ProcessApplicationPackage(PrepareApplicationName);
                fs.writeFileSync(ApplicationLibTxtFile, ApplicationLib);
                fs.writeFileSync(ApplicationPackageTxtFile, ApplicationPackage);
            }

            let AndroidSdkPath = APT.Common.GetDefaultAndroidSdkPath();

            let GradlewCommand = null;
            if (ShouldBuildApplication)
            {
                if (ProjectInstance.CMakeConfig == APT.Extensions.CMake.E_Config.DEBUG)
                {
                    GradlewCommand = "assembleDebug";
                }
                else if (ProjectInstance.CMakeConfig == APT.Extensions.CMake.E_Config.RELEASE)
                {
                    GradlewCommand = "assembleRelease";
                }
                else 
                {
                    APT.FatalError("APT", `Unknown config: ${ProjectInstance.CMakeConfig}`);
                }
            }
            else if (ShouldCMakeBuild)
            {
                if (ProjectInstance.CMakeConfig == APT.Extensions.CMake.E_Config.DEBUG)
                {
                    GradlewCommand = "externalNativeBuildDebug";
                }
                else if (ProjectInstance.CMakeConfig == APT.Extensions.CMake.E_Config.RELEASE)
                {
                    GradlewCommand = "externalNativeBuildRelease";
                }
                else 
                {
                    APT.FatalError("APT", `Unknown config: ${ProjectInstance.CMakeConfig}`);
                }
            }
            else if (ShouldCMakeConfigure)
            {
                if (ProjectInstance.CMakeConfig == APT.Extensions.CMake.E_Config.DEBUG)
                {
                    GradlewCommand = ":app:configureCMakeDebug";
                }
                else if (ProjectInstance.CMakeConfig == APT.Extensions.CMake.E_Config.RELEASE)
                {
                    GradlewCommand = ":app:configureCMakeRelease";
                }
                else 
                {
                    APT.FatalError("APT", `Unknown config: ${ProjectInstance.CMakeConfig}`);
                }
            }
            else 
            {
                throw new Error(`Unknown prepare mode: ${PrepareMode}`);
            }

            let Arguments = [
                GradlewCommand,
                `-PABYTEK_EBT_ENVIRONMENT="${ProjectInstance.Environment}"`,
                `-PABYTEK_EBT_PROCESSOR_ARCHS="${ProjectInstance.ProcessorArchs.join(";")}"`,
                `-PABYTEK_EBT_CMAKE_CONFIG="${ProjectInstance.CMakeConfig}"`,
            ];
            APT.Log("APT", `Start gradlew at "${AndroidProjectDirectory}" with arguments: ${Arguments}`);

            const Env = {
                ...process.env,
                ANDROID_SDK_ROOT: AndroidSdkPath,
            };

            const result = spawnSync(
                process.platform === "win32" ? "gradlew.bat" : "./gradlew",
                Arguments, 
                {
                    cwd: AndroidProjectDirectory,
                    stdio: "inherit",
                    shell: true,
                    env: Env,
                }
            );
            if (result.status != 0)
            {
                throw new Error("Failed to prepare android project");
            }
        }
    }
    APT.Log("APT", `Prepared project: ${Scope.EntryDirectory}`);
}
APT.Extensions.AbytekEBT.Prepare = function(Scope)
{
    let ProjectInstance = Scope.Data.Get("AbytekEBT.ProjectInstance");
    
    let PlatformTags = APT.Common.ParsePlatformTags(ProjectInstance.Platform);
    if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
    {
        APT.Extensions.AbytekEBT.PrepareWindows(Scope);
        return;
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
    {
        APT.Extensions.AbytekEBT.PrepareAndroid(Scope);
        return;
    }

    APT.FatalError("APT", `Invalid platform tags: ${PlatformTags}`);
}