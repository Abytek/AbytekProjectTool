
AMJS.Import("../ProjectComponents/ProjectStructure");
AMJS.Import("../../CMake/ProjectPrototypes/Default");

AMJS.Namespace.Minimal = function(Project)
{
    Project.ApplyPrototype(APT.Templates.CMake.ProjectPrototypes.Default);

    Project.AddComponent(APT.Templates.Common.ProjectComponents.F_PlatformTags);

    Project.AddComponent(APT.Templates.AbytekCMake.ProjectComponents.F_ProjectStructure);
}