
const { spawnSync } = require("child_process");
const path = require("path");

AMJS.Import("./Common");


APT.Extensions.CMake.GetDefaultBuildOptions = function()
{
    let Options = new Object();
    Options.Target = null;
    Options.Config = APT.Extensions.CMake.GetDefaultConfig();
    Options.ExtraArguments = [];
    return Options;
}

APT.Extensions.CMake.Build = function(SourceDirectory, BuildDirectory, Options)
{
    if (!SourceDirectory || !BuildDirectory) 
    {
        throw new Error("Requires SourceDirectory and BuildDirectory");
    }

    let DefaultOptions = APT.Extensions.CMake.GetDefaultBuildOptions();
    if (Options == null)
    {
        Options = new Object();
    }
    if (Options.Config == null)
    {
        Options.Config = DefaultOptions.Config;
    }
    if (Options.Target == null)
    {
        Options.Target = DefaultOptions.Target;
    }
    if (Options.ExtraArguments == null)
    {
        Options.ExtraArguments = DefaultOptions.ExtraArguments;
    }

    SourceDirectory = path.resolve(SourceDirectory);
    BuildDirectory = path.resolve(BuildDirectory);

    const Arguments = [
        "--build", 
        APT.Common.ToCLIArgument(BuildDirectory)
    ];
    if (Options.Target) 
    {
        Arguments.push(
            "--target", 
            APT.Common.ToCLIArgument(Options.Target)
        );
    }
    Arguments.push(
        "--config",
        Options.Config
    );
    for (let ExtraArgument of Options.ExtraArguments)
    {
        Arguments.push(ExtraArgument);
    }

    APT.Log("APT", `Build CMake project with command: cmake ${Arguments.join(' ')}`);

    result = spawnSync(
        "cmake", 
        Arguments, 
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