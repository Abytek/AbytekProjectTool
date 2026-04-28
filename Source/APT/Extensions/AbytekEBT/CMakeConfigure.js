
AMJS.Import("./Common");


APT.Extensions.AbytekEBT.CMakeConfigure = function(Project, CMakeInstance)
{
    let ProjectInstance = Project.Data.Get("AbytekEBT.ProjectInstance");

    APT.Log("APT", `Start configurating project: ${Project.EntryDirectory}`);
    APT.Log("APT", `Use project instance: ${ProjectInstance}`);
    APT.Log("APT", `Use cmake instance: ${CMakeInstance}`);
    
    const CMakeBuildDirectoryConfig = APT.Extensions.AbytekEBT.CalculateCMakeBuildDirectoryConfig(
        Project.EntryDirectory,
        ProjectInstance,
        CMakeInstance
    );
    APT.Log("APT", `Use CMake build directory config: ${APT.Common.NiceJSONStringify(CMakeBuildDirectoryConfig)}`);

    const CMakeBuildDirectory = CMakeBuildDirectoryConfig.Directory;

    let CMakeConfigureExtraArguments = [
        ...APT.Extensions.AbytekEBT.CalculateCMakeConfigureExtraArguments(
            Project, 
            ProjectInstance, 
            CMakeInstance
        )
    ];
    
    APT.Extensions.CMake.Configure(
        Project.EntryDirectory,
        CMakeBuildDirectory,
        {
            Generator: ProjectInstance.CMakeGenerator,
            Config: ProjectInstance.CMakeConfig,
            ProcessorArch: CMakeInstance.ProcessorArch,
            ExtraArguments: CMakeConfigureExtraArguments
        }
    );
    APT.Log("APT", `Configurated project: ${Project.EntryDirectory}`);
}