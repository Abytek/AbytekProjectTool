
AMJS.Import("../ProjectComponents/ProjectStructure");

AMJS.Namespace.Default = function(Project)
{
    Project.AddComponent(APT.Templates.CMake.ProjectComponents.F_ProjectStructure);
}