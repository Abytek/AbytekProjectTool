
const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

AMJS.Import("./Common");
AMJS.Import("./CMakeConfigure");
AMJS.Import("./ProjectInstance");


APT.Extensions.AbytekCMake.PrepareWindows = function(Project, DirectInstanceConfig)
{
    APT.Log("APT", `Start preparing project: ${Project.EntryDirectory}`);

    let InstanceConfig = Project.Data.Get("AbytekCMake.InstanceConfig");
    
    APT.Extensions.AbytekCMake.CMakeConfigure(
        Project,
        InstanceConfig
    );
    APT.Log("APT", `Prepared project: ${Project.EntryDirectory}`);
}
APT.Extensions.AbytekCMake.PrepareAndroid = function(Project, DirectInstanceConfig)
{
    APT.Log("APT", `Start preparing project: ${Project.EntryDirectory}`);

    let InstanceConfig = Project.Data.Get("AbytekCMake.InstanceConfig");

    const AndroidProjectDirectory = path.join(
        Project.EntryDirectory,
        "Platforms",
        "Android",
        "Projects",
        "Application"
    ).replaceAll("\\", "/");

    let AndroidSdkPath = APT.Common.GetDefaultAndroidSdkPath();

    let GradlewCommand = null;
    if (DirectInstanceConfig.CMakeConfig == APT.Extensions.CMake.E_Config.DEBUG)
    {
        GradlewCommand = "externalNativeBuildDebug";
    }
    else if (DirectInstanceConfig.CMakeConfig == APT.Extensions.CMake.E_Config.RELEASE)
    {
        GradlewCommand = "externalNativeBuildRelease";
    }
    else 
    {
        APT.FatalError("APT", `Unknown config: ${InstanceConfig.CMakeConfig}`);
    }

    let Arguments = [
        GradlewCommand,
        `-PABYTEK_CMAKE_ENVIRONMENT="${InstanceConfig.Environment}"`,
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
APT.Extensions.AbytekCMake.Prepare = function(Project, DirectInstanceConfig)
{
    let InstanceConfig = Project.Data.Get("AbytekCMake.InstanceConfig");

    let PlatformTags = APT.Common.ParsePlatformTags(InstanceConfig.Platform);

    APT.Extensions.AbytekCMake.GenerateCMakeBuildDirectorySignatureFile(Project.EntryDirectory, InstanceConfig)
    APT.Extensions.AbytekCMake.GenerateProjectInstanceJSFile(Project, InstanceConfig);

    if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
    {
        APT.Extensions.AbytekCMake.PrepareWindows(Project, DirectInstanceConfig);
        return;
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
    {
        APT.Extensions.AbytekCMake.PrepareAndroid(Project, DirectInstanceConfig);
        return;
    }

    APT.FatalError("APT", `Invalid platform tags: ${PlatformTags}`);
}