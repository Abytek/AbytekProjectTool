
const path = require("path");
const fs = require("fs");

AMJS.Import("./Common");


APT.Extensions.AbytekEBT.CalculateCMakeDefinitionsFileName = function(ProjectInstance)
{
    return "CMakeDefinitions-" + APT.Extensions.AbytekEBT.CalculateScopeSignature(ProjectInstance) + ".txt";
}
APT.Extensions.AbytekEBT.CalculateCMakeDefinitionsFile = function(EntryDirectory, ProjectInstance)
{
    return path.join(
        APT.Extensions.AbytekEBT.CalculateBuildDirectory(EntryDirectory),
        APT.Extensions.AbytekEBT.CalculateCMakeDefinitionsFileName(ProjectInstance)
    );
}
APT.Extensions.AbytekEBT.ApplyCMakeDefinitions = function(Scope)
{
    APT.Log("APT", `Start applying cmake definitions for project: ${Scope.EntryDirectory}`);

    let ProjectInstance = Scope.Data.Get("AbytekEBT.ProjectInstance");
    let CMakeDefinitions = Scope.Data.Get("AbytekEBT.CMakeDefinitions");

    const File = APT.Extensions.AbytekEBT.CalculateCMakeDefinitionsFile(Scope.EntryDirectory, ProjectInstance);
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
    APT.Log("APT", `Applied cmake definitions for project: ${Scope.EntryDirectory}`);
}