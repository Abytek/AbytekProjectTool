
const { spawnSync } = require("child_process");
const path = require("path");

AMJS.Import("./Common");


APT.Extensions.CMake.Build = function(SourceDirectory, BuildDirectory, Target, DirectConfig)
{
    if (!SourceDirectory || !BuildDirectory) 
    {
        throw new Error("Requires SourceDirectory and BuildDirectory");
    }

    if (DirectConfig == null)
    {
        DirectConfig = APT.Extensions.CMake.GetDefaultDirectConfig();
    }

    SourceDirectory = path.resolve(SourceDirectory);
    BuildDirectory = path.resolve(BuildDirectory);

    const BuildArgs = [
        "--build", 
        APT.Common.ToCLIArgument(BuildDirectory)
    ];

    if (Target) 
    {
        BuildArgs.push(
            "--target", 
            APT.Common.ToCLIArgument(Target)
        );
    }

    APT.Log("APT", `Build CMake project with command: cmake ${BuildArgs.join(' ')}`);

    result = spawnSync(
        "cmake", 
        BuildArgs, 
        {
            stdio: "inherit",
            shell: true
        }
    );
    if (result.status !== 0) 
    {
        throw new Error("CMake build failed");
    }
}