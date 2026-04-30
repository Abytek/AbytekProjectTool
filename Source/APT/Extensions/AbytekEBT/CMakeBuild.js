
AMJS.Import("./Common");


APT.Extensions.AbytekEBT.CMakeBuild = function(Scope, CMakeInstance, TargetToBuild)
{
    APT.Log("APT", `Start building project: ${Scope.EntryDirectory}`);
    APT.Log("APT", `Use cmake instance: ${CMakeInstance}`);
    
    const CMakeBuildDirectoryConfig = APT.Extensions.AbytekEBT.CalculateCMakeBuildDirectoryConfig(
        Scope.EntryDirectory,
        CMakeInstance
    );
    APT.Log("APT", `Use CMake build directory config: ${APT.Common.NiceJSONStringify(CMakeBuildDirectoryConfig)}`);

    const CMakeBuildDirectory = CMakeBuildDirectoryConfig.Directory;

    APT.Extensions.CMake.Build(
        Scope.EntryDirectory,
        CMakeBuildDirectory,
        {
            Target: TargetToBuild,
            Config: CMakeInstance.CMakeConfig
        }
    );
    APT.Log("APT", `Built project: ${Scope.EntryDirectory}`);
}