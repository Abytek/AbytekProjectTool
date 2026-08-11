
const { spawnSync, execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

AMJS.Import("./Common");


APT.Extensions.CMake.GetDefaultConfigureOptions = function()
{
    let Options = new Object();
    Options.Generator = APT.Extensions.CMake.GetDefaultGeneratorForPlatformTags(
        APT.Common.ParsePlatformTags(
            APT.Common.GetHostPlatform()
        )
    );
    Options.Config = APT.Extensions.CMake.GetDefaultConfigForGenerator(Options.Generator);
    Options.ProcessorArch = APT.Common.E_ProcessorArch.AUTO;
    Options.ExtraArguments = [];
    Options.ExtraEnv = {};
    return Options;
}

APT.Extensions.CMake.Configure = function(SourceDirectory, BuildDirectory, Options)
{
    if (!SourceDirectory || !BuildDirectory) 
    {
        throw new Error("Requires SourceDirectory and BuildDirectory");
    }

    let DefaultOptions = APT.Extensions.CMake.GetDefaultConfigureOptions();
    if (Options == null)
    {
        Options = new Object();
    }
    if (Options.Generator == null)
    {
        Options.Generator = DefaultOptions.Generator;
    }
    if (Options.Config == null)
    {
        Options.Config = APT.Extensions.CMake.GetDefaultConfigForGenerator(Options.Generator);
    }
    if (Options.ProcessorArch == null)
    {
        Options.ProcessorArch = APT.Common.E_ProcessorArch.AUTO;
    }
    if (Options.ExtraArguments == null)
    {
        Options.ExtraArguments = DefaultOptions.ExtraArguments;
    }
    if (Options.ExtraEnv == null)
    {
        Options.ExtraEnv = DefaultOptions.ExtraEnv;
    }

    SourceDirectory = path.resolve(SourceDirectory);
    BuildDirectory = path.resolve(BuildDirectory);

    const GeneratorMap = {
        [APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2026]: "Visual Studio 18 2026",
        [APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2022]: "Visual Studio 17 2022",
        [APT.Extensions.CMake.E_Generator.NINJA]: "Ninja",
        [APT.Extensions.CMake.E_Generator.UNIX_MAKEFILES]: "Unix Makefiles",
    };
    const CmakeGeneratorArg = GeneratorMap[Options.Generator];
    if (!CmakeGeneratorArg) {
        throw new Error(`Unknown generator: ${Options.Generator}`);
    }

    let Arguments = [
        "-S",
        APT.Common.ToCLIArgument(SourceDirectory),
        "-B",
        APT.Common.ToCLIArgument(BuildDirectory),
        "-G",
        APT.Common.ToCLIArgument(CmakeGeneratorArg),
    ];

    if (Options.Config != APT.Extensions.CMake.E_Config.AUTO)
    {
        Arguments.push(`-DCMAKE_BUILD_TYPE=${Options.Config}`);
        Arguments.push(`-DCMAKE_CONFIGURATION_TYPES=${Options.Config}`);
    }

    if (Options.ProcessorArch != APT.Common.E_ProcessorArch.AUTO)
    {
        if (Options.Generator == APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2026)
        {
            const ProcessorArchMap = {
                [APT.Common.E_ProcessorArch.X86_32]: "Win32",
                [APT.Common.E_ProcessorArch.X86_64]: "x64",
                [APT.Common.E_ProcessorArch.ARM_64]: "ARM64",
            };
            const ProcessorArchArg = ProcessorArchMap[Options.ProcessorArch];
            if (!ProcessorArchArg) {
                throw new Error(`Unknown processor arch: ${Options.Generator}`);
            }

            Arguments.push(`-A`);
            Arguments.push(APT.Common.ToCLIArgument(ProcessorArchArg));
        }
        else if (Options.Generator == APT.Extensions.CMake.E_Generator.NINJA)
        {
            /*const ProcessorArchMap = {
                [APT.Common.E_ProcessorArch.X86_32]: "x86",
                [APT.Common.E_ProcessorArch.X86_64]: "x64",
                [APT.Common.E_ProcessorArch.ARM_64]: "arm64",
            };
            const ProcessorArchArg = ProcessorArchMap[Options.ProcessorArch];
            if (!ProcessorArchArg) {
                throw new Error(`Unknown processor arch: ${Options.ProcessorArch}`);
            }

            Arguments.push(`-DCMAKE_GENERATOR_PLATFORM=${APT.Common.ToCLIArgument(ProcessorArchArg)}`);*/
        }
        else
        {
            APT.FatalError("APT", `Invalid generator to set non-auto processor arch: ${Options.Generator}`);
        }
    }

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
            shell: true,
            env: {
                ...process.env,
                ...Options.ExtraEnv
            }
        }
    );
    if (result.status !== 0) 
    {
        throw new Error("CMake configuration failed");
    }
    APT.Log("APT", `Configured CMake project`);
}