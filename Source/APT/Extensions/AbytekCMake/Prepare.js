
AMJS.Import("./Common");
AMJS.Import("./CMakeConfigure");
AMJS.Import("./ProjectInstance");


APT.Extensions.AbytekCMake.PrepareWindows = function(Project, CMakeConfig)
{
    APT.Log("APT", `Start preparing project: ${Project.GetSignature()}`);
    
    APT.Extensions.AbytekCMake.CMakeConfigure(
        Project,
        CMakeConfig
    );
    APT.Log("APT", `Prepared project: ${Project.GetSignature()}`);
}
APT.Extensions.AbytekCMake.PrepareAndroid = function(Project, CMakeConfig)
{
    APT.Log("APT", `Start preparing project: ${Project.GetSignature()}`);
    APT.Log("APT", `Prepared project: ${Project.GetSignature()}`);
}
APT.Extensions.AbytekCMake.Prepare = function(Project, CMakeConfig)
{
    let PlatformTags = Project.Data.Get("AbytekCMake.PlatformTags");

    APT.Extensions.AbytekCMake.GenerateCMakeBuildDirectorySignatureFile(Project, CMakeConfig)
    APT.Extensions.AbytekCMake.GenerateProjectInstanceJSFile(Project, CMakeConfig);

    if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
    {
        APT.Extensions.AbytekCMake.PrepareWindows(Project, CMakeConfig);
        return;
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
    {
        APT.Extensions.AbytekCMake.PrepareAndroid(Project, CMakeConfig);
        return;
    }

    APT.FatalError("APT", `Invalid platform tags: ${PlatformTags}`);
}