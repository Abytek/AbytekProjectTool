
const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

AMJS.Import("./Common");
AMJS.Import("./CMakeConfigure");


APT.Extensions.AbytekEBT.PrepareWindows = function(Project)
{
    APT.Log("APT", `Start preparing project: ${Project.EntryDirectory}`);

    let TargetsToBuild = Project.Data.Get("AbytekEBT.Prepare.TargetsToBuild");

    APT.Extensions.AbytekEBT.CMakeConfigure(Project);
    for (let TargetToBuild of TargetsToBuild)
    {
        APT.Extensions.AbytekEBT.CMakeBuild(Project, TargetToBuild);
    }
    APT.Log("APT", `Prepared project: ${Project.EntryDirectory}`);
}
APT.Extensions.AbytekEBT.PrepareAndroid = function(Project)
{
    APT.Log("APT", `Start preparing project: ${Project.EntryDirectory}`);

    let InstanceConfig = Project.Data.Get("AbytekEBT.InstanceConfig");

    const AndroidProjectDirectory = path.join(
        Project.EntryDirectory,
        "Platforms",
        "Android",
        "Projects",
        "Application"
    ).replaceAll("\\", "/");

    let AndroidSdkPath = APT.Common.GetDefaultAndroidSdkPath();

    let GradlewCommand = null;
    if (InstanceConfig.CMakeConfig == APT.Extensions.CMake.E_Config.DEBUG)
    {
        GradlewCommand = "externalNativeBuildDebug";
    }
    else if (InstanceConfig.CMakeConfig == APT.Extensions.CMake.E_Config.RELEASE)
    {
        GradlewCommand = "externalNativeBuildRelease";
    }
    else 
    {
        APT.FatalError("APT", `Unknown config: ${InstanceConfig.CMakeConfig}`);
    }

    let Arguments = [
        GradlewCommand,
        `-PABYTEK_EBT_ENVIRONMENT="${InstanceConfig.Environment}"`,
        `-PABYTEK_EBT_PROCESSOR_ARCHS="${InstanceConfig.ProcessorArchs}"`,
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
    let InstanceConfig = Project.Data.Get("AbytekEBT.InstanceConfig");

    let PlatformTags = APT.Common.ParsePlatformTags(InstanceConfig.Platform);

    APT.Extensions.AbytekEBT.GenerateCMakeBuildDirectorySignatureFile(Project.EntryDirectory, InstanceConfig)

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