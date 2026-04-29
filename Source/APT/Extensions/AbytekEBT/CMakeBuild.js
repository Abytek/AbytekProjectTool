
AMJS.Import("./Common");


APT.Extensions.AbytekEBT.CMakeBuild = function(Project, CMakeInstance, TargetToBuild)
{
    APT.Log("APT", `Start building project: ${Project.EntryDirectory}`);
    APT.Log("APT", `Use cmake instance: ${CMakeInstance}`);
    
    const CMakeBuildDirectoryConfig = APT.Extensions.AbytekEBT.CalculateCMakeBuildDirectoryConfig(
        Project.EntryDirectory,
        CMakeInstance
    );
    APT.Log("APT", `Use CMake build directory config: ${APT.Common.NiceJSONStringify(CMakeBuildDirectoryConfig)}`);

    const CMakeBuildDirectory = CMakeBuildDirectoryConfig.Directory;

    APT.Extensions.CMake.Build(
        Project.EntryDirectory,
        CMakeBuildDirectory,
        {
            Target: TargetToBuild,
            Config: CMakeInstance.CMakeConfig
        }
    );
    APT.Log("APT", `Built project: ${Project.EntryDirectory}`);
}