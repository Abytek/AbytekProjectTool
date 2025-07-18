
AMJS.Import("../ProjectComponents/ProjectStructure");

AMJS.Namespace.Minimal = function(Project)
{
    Project.AddComponent(APT.Templates.Common.ProjectComponents.F_PlatformTags);

    Project.AddComponent(APT.Templates.AbytekCMake.ProjectComponents.F_ProjectStructure);
}