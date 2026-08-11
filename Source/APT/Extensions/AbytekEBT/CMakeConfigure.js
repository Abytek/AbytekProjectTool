
AMJS.Import("./Common");


APT.Extensions.AbytekEBT.CMakeConfigure = function(Scope, CMakeInstance)
{
    APT.Log("APT", `Start configurating project: ${Scope.EntryDirectory}`);
    APT.Log("APT", `Use cmake instance: ${CMakeInstance}`);
    
    const CMakeBuildDirectoryConfig = APT.Extensions.AbytekEBT.CalculateCMakeBuildDirectoryConfig(
        Scope.EntryDirectory,
        CMakeInstance
    );
    APT.Log("APT", `Use CMake build directory config: ${APT.Common.NiceJSONStringify(CMakeBuildDirectoryConfig)}`);

    const CMakeBuildDirectory = CMakeBuildDirectoryConfig.Directory;

    let CMakeConfigureExtraArguments = [
        ...APT.Extensions.AbytekEBT.CalculateCMakeConfigureExtraArguments(
            Scope, 
            CMakeInstance
        )
    ];
    let CMakeConfigureExtraEnv = {
        ...APT.Extensions.AbytekEBT.CalculateCMakeConfigureExtraEnv(
            Scope,
            CMakeInstance
        )
    };

    APT.Extensions.CMake.Configure(
        Scope.EntryDirectory,
        CMakeBuildDirectory,
        {
            Generator: CMakeInstance.CMakeGenerator,
            Config: CMakeInstance.CMakeConfig,
            ProcessorArch: CMakeInstance.ProcessorArch,
            ExtraArguments: CMakeConfigureExtraArguments,
            ExtraEnv: CMakeConfigureExtraEnv,
        }
    );
    APT.Log("APT", `Configurated project: ${Scope.EntryDirectory}`);
}