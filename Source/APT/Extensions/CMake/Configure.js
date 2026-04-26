
const { spawnSync } = require("child_process");
const path = require("path");

AMJS.Import("./Common");


APT.Extensions.CMake.Configure = function(SourceDirectory, BuildDirectory, Options)
{
    if (!SourceDirectory || !BuildDirectory) 
    {
        throw new Error("Requires SourceDirectory and BuildDirectory");
    }

    if (Options == null)
    {
        Options = new Object();
    }
    if (Options.Generator == null)
    {
        Options.Generator = APT.Extensions.CMake.GetDefaultGenerator();
    }
    if (Options.Config == null)
    {
        Options.Config = APT.Extensions.CMake.GetDefaultConfigForGenerator(Options.Generator);
    }
    if (Options.ExtraArguments == null)
    {
        Options.ExtraArguments = [];
    }

    SourceDirectory = path.resolve(SourceDirectory);
    BuildDirectory = path.resolve(BuildDirectory);

    const GeneratorMap = {
        [APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2026]: "Visual Studio 18 2026",
        [APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2022]: "Visual Studio 17 2022",
        [APT.Extensions.CMake.E_Generator.NINJA]: "Ninja",
        [APT.Extensions.CMake.E_Generator.UNIX_MAKEFILES]: "Unix Makefiles",
    };
    const CmakeGenerator = GeneratorMap[Options.Generator];
    if (!CmakeGenerator) {
        throw new Error(`Unknown generator: ${Options.Generator}`);
    }

    let Arguments = [
        "-S",
        APT.Common.ToCLIArgument(SourceDirectory),
        "-B",
        APT.Common.ToCLIArgument(BuildDirectory),
        "-G",
        APT.Common.ToCLIArgument(CmakeGenerator),
    ];

    for (let ExtraArgument of Options.ExtraArguments)
    {
        Arguments.push(ExtraArgument);
    }

    APT.Log("APT", `Configure CMake project with command: cmake ${Arguments.join(' ')}`);

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
        throw new Error("CMake configuration failed");
    }
}