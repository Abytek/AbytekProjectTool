
AMJS.Import("./Common");


APT.Extensions.AbytekEBT.CMakeBuild = function(Project, TargetToBuild)
{
    let InstanceConfig = Project.Data.Get("AbytekEBT.InstanceConfig");

    APT.Log("APT", `Start building project: ${Project.EntryDirectory}`);
    APT.Log("APT", `Use instance config: ${InstanceConfig}`);
    
    const CMakeBuildDirectoryConfig = APT.Extensions.AbytekEBT.CalculateCMakeBuildDirectoryConfig(
        Project.EntryDirectory,
        InstanceConfig
    );
    APT.Log("APT", `Use CMake build directory config: ${APT.Common.NiceJSONStringify(CMakeBuildDirectoryConfig)}`);

    const CMakeBuildDirectory = CMakeBuildDirectoryConfig.Path;

    APT.Extensions.CMake.Build(
        Project.EntryDirectory,
        CMakeBuildDirectory,
        {
            Target: TargetToBuild,
            Config: InstanceConfig.CMakeConfig
        }
    );
    APT.Log("APT", `Built project: ${Project.EntryDirectory}`);
}