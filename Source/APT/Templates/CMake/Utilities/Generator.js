
const fs = require('fs');

AMJS.Import("./ProjectStructure");
AMJS.Import("./Generator_CLion");
AMJS.Import("./Generator_VisualStudio2022");
AMJS.Import("./Generator_UnixMakefiles");

AMJS.Namespace.GenerateProjectFiles = function(ProjectStructure)
{
    let Project = ProjectStructure.Project;

    console.log(`<APT.Templates.CMake> Begin generating project files for ${Project.AbsoluteEntryFile}`);

    fs.mkdirSync(ProjectStructure.BuildDirectory, { recursive: true });

    if (ProjectStructure.Generator == APT.Templates.CMake.Utilities.Generators.CLION)
    {
        AMJS.Namespace.GenerateProjectFiles_CLion(ProjectStructure);
    }
    else if (ProjectStructure.Generator == APT.Templates.CMake.Utilities.Generators.VS2022)
    {
        AMJS.Namespace.GenerateProjectFiles_VisualStudio2022(ProjectStructure);
    }
    else if (ProjectStructure.Generator == APT.Templates.CMake.Utilities.Generators.UNIX_MAKE_FILES)
    {
        AMJS.Namespace.GenerateProjectFiles_UnixMakefiles(ProjectStructure);
    }
    else
    {
        throw new Error(`unknown CMake generator ${ProjectStructure.Generator}`);
    }

    console.log(`<APT.Templates.CMake> Generated project files for ${Project.AbsoluteEntryFile} successfully`);
}