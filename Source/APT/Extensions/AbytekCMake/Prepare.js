
AMJS.Import("./Common");


APT.Extensions.AbytekCMake.PrepareWindows = function(Project)
{
    APT.Log("APT", `Start preparing project: ${Project.GetSignature()} (platform tags: ${Project.Data.Get("AbytekCMake.PlatformTags")})`);
    
    let Editor = Project.Data.Get("AbytekCMake.Editor");
    let Environment = Project.Data.Get("AbytekCMake.Environment");
    let PlatformTags = Project.Data.Get("AbytekCMake.PlatformTags");
    let CMakeGenerator = APT.Extensions.AbytekCMake.GetDefaultCMakeGeneratorForEditor(Editor);
    let CMakeConfig = APT.Extensions.CMake.MakeAutoConfig();
    APT.Log("APT", `Use CMake generator: ${CMakeGenerator}`);

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
    APT.Log("APT", `Prepared project: ${Project.GetSignature()} (platform tags: ${Project.Data.Get("AbytekCMake.PlatformTags")})`);
}
APT.Extensions.AbytekCMake.Prepare = function(Project)
{
    let PlatformTags = Project.Data.Get("AbytekCMake.PlatformTags");
    if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
    {
        APT.Extensions.AbytekCMake.PrepareWindows(Project);
        return;
    }
    APT.FatalError("APT", `Invalid platform tags: ${PlatformTags}`);
}