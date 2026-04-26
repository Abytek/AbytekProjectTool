
AMJS.Import("./Common");
AMJS.Import("./CMakeConfigure");


APT.Extensions.AbytekCMake.PrepareWindows = function(Project)
{
    APT.Log("APT", `Start preparing project: ${Project.GetSignature()}`);
    
    let CMakeConfig = APT.Extensions.CMake.MakeAutoConfig();

    APT.Extensions.AbytekCMake.CMakeConfigure(
        Project,
        CMakeConfig
    );
    APT.Log("APT", `Prepared project: ${Project.GetSignature()}`);
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