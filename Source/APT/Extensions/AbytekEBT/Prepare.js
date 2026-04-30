
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
        return APT.Extensions.AbytekEBT.E_PrepareMode.CMAKE_BUILD;
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
    let TargetsToBuild = Scope.Data.Get("AbytekEBT.Prepare.TargetsToBuild");

    for (let CMakeInstance of ProjectInstance.CMakeInstances)
    {
        if (APT.Extensions.AbytekEBT.PrepareModeShouldCMakeConfigure(PrepareMode))
        {
            APT.Extensions.AbytekEBT.CMakeConfigure(Scope, CMakeInstance);
        }
        if (APT.Extensions.AbytekEBT.PrepareModeShouldCMakeBuild(PrepareMode))
        {
            for (let TargetToBuild of TargetsToBuild)
            {
                APT.Extensions.AbytekEBT.CMakeBuild(Scope, CMakeInstance, TargetToBuild);
            }
        }
    }
    APT.Log("APT", `Prepared project: ${Scope.EntryDirectory}`);
}
APT.Extensions.AbytekEBT.PrepareAndroid = function(Scope)
{
    APT.Log("APT", `Start preparing project: ${Scope.EntryDirectory}`);

    let ProjectInstance = Scope.Data.Get("AbytekEBT.ProjectInstance");
    let PrepareMode = Scope.Data.Get("AbytekEBT.Prepare.Mode");

    let ShouldCMakeBuild = APT.Extensions.AbytekEBT.PrepareModeShouldCMakeBuild(PrepareMode);
    let ShouldBuildApplication = APT.Extensions.AbytekEBT.PrepareModeShouldBuildApplication(PrepareMode);

    if (
        ShouldCMakeBuild
        || ShouldBuildApplication
    )
    {
        const AndroidScopeDirectory = path.join(
            Scope.EntryDirectory,
            "Platforms",
            "Android",
            "Scopes",
            "Application"
        ).replaceAll("\\", "/");

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
        APT.Log("APT", `Start gradlew at "${AndroidScopeDirectory}" with arguments: ${Arguments}`);

        const Env = {
            ...process.env,
            ANDROID_SDK_ROOT: AndroidSdkPath,
        };

        const result = spawnSync(
            process.platform === "win32" ? "gradlew.bat" : "./gradlew",
            Arguments, 
            {
                cwd: AndroidScopeDirectory,
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