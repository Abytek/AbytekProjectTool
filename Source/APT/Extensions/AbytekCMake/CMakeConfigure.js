
AMJS.Import("./Common");


APT.Extensions.AbytekCMake.CMakeConfigure = function(Project, CMakeConfig)
{
    let Editor = Project.Data.Get("AbytekCMake.Editor");
    let Environment = Project.Data.Get("AbytekCMake.Environment");
    let PlatformTags = Project.Data.Get("AbytekCMake.PlatformTags");
    
    APT.Log("APT", `Start configurating project: ${Project.GetSignature()}`);
    APT.Log("APT", `Use editor: ${Editor}`);
    APT.Log("APT", `Use environment: ${Environment}`);
    APT.Log("APT", `Use platform tags: ${PlatformTags}`);
    
    let CMakeGenerator = APT.Extensions.AbytekCMake.GetDefaultCMakeGeneratorForEditor(Editor);
    if (CMakeConfig == null)
    {
        CMakeConfig = APT.Extensions.CMake.GetDefaultConfigForGenerator(CMakeGenerator);
    }
    APT.Log("APT", `Use CMake generator: ${CMakeGenerator}`);
    APT.Log("APT", `Use cmake config: ${CMakeConfig}`);

    const CMakeBuildDirectoryConfig = APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectoryConfig(
        Project.EntryDirectory,
        Environment,
        PlatformTags,
        CMakeGenerator,
        CMakeConfig
    );
    APT.Log("APT", `Use CMake build directory config: ${APT.Common.NiceJSONStringify(CMakeBuildDirectoryConfig)}`);

    const CMakeBuildDirectory = CMakeBuildDirectoryConfig.Path;

    let CMakeConfigureExtraArguments = [
        ...APT.Extensions.AbytekCMake.CalculateCMakeConfigureExtraArguments(Project, CMakeConfig)
    ];

    APT.Extensions.CMake.Configure(
        Project.EntryDirectory,
        CMakeBuildDirectory,
        {
            Generator: CMakeGenerator,
            ExtraArguments: CMakeConfigureExtraArguments
        }
    );
    APT.Log("APT", `Configurated project: ${Project.GetSignature()}`);
}