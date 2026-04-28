
AMJS.Import("./Common");


APT.Extensions.AbytekCMake.CMakeConfigure = function(Project)
{
    let InstanceConfig = Project.Data.Get("AbytekCMake.InstanceConfig");

    APT.Log("APT", `Start configurating project: ${Project.EntryDirectory}`);
    APT.Log("APT", `Use instance config: ${InstanceConfig}`);
    
    const CMakeBuildDirectoryConfig = APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectoryConfig(
        Project.EntryDirectory,
        InstanceConfig
    );
    APT.Log("APT", `Use CMake build directory config: ${APT.Common.NiceJSONStringify(CMakeBuildDirectoryConfig)}`);

    const CMakeBuildDirectory = CMakeBuildDirectoryConfig.Path;

    let CMakeConfigureExtraArguments = [
        ...APT.Extensions.AbytekCMake.CalculateCMakeConfigureExtraArguments(Project, InstanceConfig)
    ];
    
    APT.Extensions.CMake.Configure(
        Project.EntryDirectory,
        CMakeBuildDirectory,
        {
            Generator: InstanceConfig.CMakeGenerator,
            Config: InstanceConfig.CMakeConfig,
            ProcessorArch: InstanceConfig.ProcessorArch,
            ExtraArguments: CMakeConfigureExtraArguments
        }
    );
    APT.Log("APT", `Configurated project: ${Project.EntryDirectory}`);
}