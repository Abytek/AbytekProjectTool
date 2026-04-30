
const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

AMJS.Import("./Common");
AMJS.Import("./CMakeConfigure");
AMJS.Import("./CMakeBuild");


APT.Extensions.AbytekEBT.PrepareWindows = function(Project)
{
    APT.Log("APT", `Start preparing project: ${Project.EntryDirectory}`);

    let ProjectInstance = Project.Data.Get("AbytekEBT.ProjectInstance");
    let TargetsToBuild = Project.Data.Get("AbytekEBT.Prepare.TargetsToBuild");

    for (let CMakeInstance of ProjectInstance.CMakeInstances)
    {
        APT.Extensions.AbytekEBT.CMakeConfigure(Project, CMakeInstance);
        for (let TargetToBuild of TargetsToBuild)
        {
            APT.Extensions.AbytekEBT.CMakeBuild(Project, CMakeInstance, TargetToBuild);
        }
    }
    APT.Log("APT", `Prepared project: ${Project.EntryDirectory}`);
}
APT.Extensions.AbytekEBT.PrepareAndroid = function(Project)
{
    APT.Log("APT", `Start preparing project: ${Project.EntryDirectory}`);

    let ProjectInstance = Project.Data.Get("AbytekEBT.ProjectInstance");

    const AndroidProjectDirectory = path.join(
        Project.EntryDirectory,
        "Platforms",
        "Android",
        "Projects",
        "Application"
    ).replaceAll("\\", "/");

    let AndroidSdkPath = APT.Common.GetDefaultAndroidSdkPath();

    let GradlewCommand = null;
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

    let Arguments = [
        GradlewCommand,
        `-PABYTEK_EBT_ENVIRONMENT="${ProjectInstance.Environment}"`,
        `-PABYTEK_EBT_PROCESSOR_ARCHS="${ProjectInstance.ProcessorArchs.join(";")}"`,
    ];
    APT.Log("APT", `Start gradlew with arguments: ${Arguments}`);

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
    APT.Log("APT", `Prepared project: ${Project.EntryDirectory}`);
}
APT.Extensions.AbytekEBT.Prepare = function(Project)
{
    let ProjectInstance = Project.Data.Get("AbytekEBT.ProjectInstance");
    
    let PlatformTags = APT.Common.ParsePlatformTags(ProjectInstance.Platform);

    if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
    {
        APT.Extensions.AbytekEBT.PrepareWindows(Project);
        return;
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
    {
        APT.Extensions.AbytekEBT.PrepareAndroid(Project);
        return;
    }

    APT.FatalError("APT", `Invalid platform tags: ${PlatformTags}`);
}