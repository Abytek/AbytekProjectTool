
AMJS.Import("./Common");


APT.Extensions.AbytekCMake.PrepareWindows = function(Project)
{
    APT.Log("APT", `Start preparing project: ${Project.GetSignature()} (platform tags: ${Project.Data.Get("AbytekCMake.PlatformTags")})`);
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