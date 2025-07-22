
AMJS.Import("../ProjectComponents/ProjectStructure");

AMJS.Namespace.Default = function(Project)
{
    Project.ApplyPrototype(APT.Templates.Common.ProjectPrototypes.Default);

    Project.AddComponent(APT.Templates.CMake.ProjectComponents.F_ProjectStructure);
}