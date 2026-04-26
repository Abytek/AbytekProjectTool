
const path = require("path");
const fs = require("fs");

AMJS.Import("./Common");


APT.Extensions.AbytekCMake.CalculateCMakeDefinitionsFileName = function(Environment, PlatformTags, Editor)
{
    return "CMakeDefinitions-" + APT.Extensions.AbytekCMake.CalculateSignature(Environment, PlatformTags, Editor) + ".txt";
}
APT.Extensions.AbytekCMake.CalculateCMakeDefinitionsFile = function(EntryDirectory, Environment, PlatformTags, Editor)
{
    return path.join(
        APT.Extensions.AbytekCMake.CalculateBuildDirectory(EntryDirectory),
        APT.Extensions.AbytekCMake.CalculateCMakeDefinitionsFileName(Environment, PlatformTags, Editor)
    );
}
APT.Extensions.AbytekCMake.ApplyCMakeDefinitions = function(CMakeDefinitions, EntryDirectory, Environment, PlatformTags, Editor)
{
    APT.Log("APT", `Start applying cmake definitions for project: ${EntryDirectory}`);

    const File = APT.Extensions.AbytekCMake.CalculateCMakeDefinitionsFile(EntryDirectory, Environment, PlatformTags, Editor);
    const Directory = path.dirname(File);
    if (!fs.existsSync(Directory))
    {
        fs.mkdirSync(Directory);
    }
    
    APT.Log("APT", `Use cmake definitions file: ${File}`);

    let FileContent = "";
    for (const CMakeDefinition of CMakeDefinitions)
    {
        FileContent += `${CMakeDefinition[0]}\n`;
        FileContent += `${CMakeDefinition[1]}\n`;
    }
    fs.writeFileSync(File, FileContent);
    APT.Log("APT", `Applied cmake definitions for project: ${EntryDirectory}`);
}