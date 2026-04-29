
AMJS.Import("./Common");


APT.Extensions.AbytekEBT.CMakeConfigure = function(Project, CMakeInstance)
{
    APT.Log("APT", `Start configurating project: ${Project.EntryDirectory}`);
    APT.Log("APT", `Use cmake instance: ${CMakeInstance}`);
    
    const CMakeBuildDirectoryConfig = APT.Extensions.AbytekEBT.CalculateCMakeBuildDirectoryConfig(
        Project.EntryDirectory,
        CMakeInstance
    );
    APT.Log("APT", `Use CMake build directory config: ${APT.Common.NiceJSONStringify(CMakeBuildDirectoryConfig)}`);

    const CMakeBuildDirectory = CMakeBuildDirectoryConfig.Directory;

    let CMakeConfigureExtraArguments = [
        ...APT.Extensions.AbytekEBT.CalculateCMakeConfigureExtraArguments(
            Project, 
            CMakeInstance
        )
    ];
    
    APT.Extensions.CMake.Configure(
        Project.EntryDirectory,
        CMakeBuildDirectory,
        {
            Generator: CMakeInstance.CMakeGenerator,
            Config: CMakeInstance.CMakeConfig,
            ProcessorArch: CMakeInstance.ProcessorArch,
            ExtraArguments: CMakeConfigureExtraArguments
        }
    );
    APT.Log("APT", `Configurated project: ${Project.EntryDirectory}`);
}