
const fs = require('fs');

AMJS.Import("./ProjectStructure");
AMJS.Import("./Generator_VisualStudio2022");
AMJS.Import("./Generator_VisualStudio2026");
AMJS.Import("./Generator_UnixMakefiles");
AMJS.Import("./Generator_Ninja");
AMJS.Import("./Generator_AndroidStudio");

AMJS.Namespace.GenerateProjectFiles = function(ProjectStructure)
{
    let Project = ProjectStructure.Project;

    APT.Log("APT.Templates.CMake", `Begin generating project files for ${Project.EntryDirectory}`);

    fs.mkdirSync(ProjectStructure.BuildDirectory, { recursive: true });

    if (ProjectStructure.Generator == APT.Templates.CMake.Utilities.Generators.VS2022)
    {
        AMJS.Namespace.GenerateProjectFiles_VisualStudio2022(ProjectStructure);
    }
    else if (ProjectStructure.Generator == APT.Templates.CMake.Utilities.Generators.VS2026)
    {
        AMJS.Namespace.GenerateProjectFiles_VisualStudio2026(ProjectStructure);
    }
    else if (ProjectStructure.Generator == APT.Templates.CMake.Utilities.Generators.UNIX_MAKE_FILES)
    {
        AMJS.Namespace.GenerateProjectFiles_UnixMakefiles(ProjectStructure);
    }
    else if (ProjectStructure.Generator == APT.Templates.CMake.Utilities.Generators.NINJA)
    {
        AMJS.Namespace.GenerateProjectFiles_Ninja(ProjectStructure);
    }
    else if (ProjectStructure.Generator == APT.Templates.CMake.Utilities.Generators.ANDROID_STUDIO)
    {
        AMJS.Namespace.GenerateProjectFiles_AndroidStudio(ProjectStructure);
    }
    else
    {
        throw new Error(`unknown CMake generator ${ProjectStructure.Generator}`);
    }

    APT.Log("APT.Templates.CMake", `Generated project files for ${Project.EntryDirectory} successfully`);
}