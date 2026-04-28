
const path = require("path");
const fs = require("fs");

AMJS.Import("./Common");


APT.Extensions.AbytekCMake.CalculateCMakeDefinitionsFileName = function(InstanceConfig)
{
    return "CMakeDefinitions-" + APT.Extensions.AbytekCMake.CalculateSignature(InstanceConfig) + ".txt";
}
APT.Extensions.AbytekCMake.CalculateCMakeDefinitionsFile = function(EntryDirectory, InstanceConfig)
{
    return path.join(
        APT.Extensions.AbytekCMake.CalculateBuildDirectory(EntryDirectory),
        APT.Extensions.AbytekCMake.CalculateCMakeDefinitionsFileName(InstanceConfig)
    );
}
APT.Extensions.AbytekCMake.ApplyCMakeDefinitions = function(CMakeDefinitions, EntryDirectory, InstanceConfig)
{
    APT.Log("APT", `Start applying cmake definitions for project: ${EntryDirectory}`);

    const File = APT.Extensions.AbytekCMake.CalculateCMakeDefinitionsFile(EntryDirectory, InstanceConfig);
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