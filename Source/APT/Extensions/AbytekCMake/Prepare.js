
const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

AMJS.Import("./Common");
AMJS.Import("./CMakeConfigure");
AMJS.Import("./ProjectInstance");


APT.Extensions.AbytekCMake.PrepareWindows = function(Project, CMakeConfig)
{
    APT.Log("APT", `Start preparing project: ${Project.GetSignature()}`);

    APT.Extensions.AbytekCMake.CMakeConfigure(
        Project,
        CMakeConfig
    );
    APT.Log("APT", `Prepared project: ${Project.GetSignature()}`);
}
APT.Extensions.AbytekCMake.PrepareAndroid = function(Project, CMakeConfig)
{
    APT.Log("APT", `Start preparing project: ${Project.GetSignature()}`);

    const AndroidProjectDirectory = path.join(
        Project.EntryDirectory,
        "Platforms",
        "Android",
        "Projects",
        "Application"
    ).replaceAll("\\", "/");

    let GradlewCommand = null;
    if (CMakeConfig == APT.Extensions.CMake.E_Config.DEBUG)
    {
        GradlewCommand = "externalNativeBuildDebug";
    }
    else if (CMakeConfig == APT.Extensions.CMake.E_Config.RELEASE)
    {
        GradlewCommand = "externalNativeBuildRelease";
    }
    else 
    {
        APT.FatalError("APT", `Unknown config: ${CMakeConfig}`);
    }

    const result = spawnSync(
        process.platform === "win32" ? "gradlew.bat" : "./gradlew",
        [
            GradlewCommand
        ], 
        {
            cwd: AndroidProjectDirectory,
            stdio: "inherit",
            shell: true,
            env: process.env,
        }
    );
    if (result.status != 0)
    {
        throw new Error("Failed to prepare android project");
    }
    APT.Log("APT", `Prepared project: ${Project.GetSignature()}`);
}
APT.Extensions.AbytekCMake.Prepare = function(Project, CMakeConfig)
{
    let PlatformTags = Project.Data.Get("AbytekCMake.PlatformTags");

    APT.Extensions.AbytekCMake.GenerateCMakeBuildDirectorySignatureFile(Project, CMakeConfig)
    APT.Extensions.AbytekCMake.GenerateProjectInstanceJSFile(Project, CMakeConfig);

    if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
    {
        APT.Extensions.AbytekCMake.PrepareWindows(Project, CMakeConfig);
        return;
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
    {
        APT.Extensions.AbytekCMake.PrepareAndroid(Project, CMakeConfig);
        return;
    }

    APT.FatalError("APT", `Invalid platform tags: ${PlatformTags}`);
}