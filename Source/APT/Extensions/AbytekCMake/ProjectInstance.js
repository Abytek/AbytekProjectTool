
const path = require("path");
const fs = require("fs");

AMJS.Import("./Common");


APT.Extensions.AbytekCMake.GetProjectInstanceJSFile = function(CMakeBuildDirectory)
{
    return path.join(
        CMakeBuildDirectory,
        "AbytekCMake",
        "ProjectInstance.js"
    );
}

APT.Extensions.AbytekCMake.GenerateProjectInstanceJSFile = function(Project)
{
    let InstanceConfig = Project.Data.Get("AbytekCMake.InstanceConfig");
    
    const CMakeBuildDirectoryConfig = APT.Extensions.AbytekCMake.CalculateCMakeBuildDirectoryConfig(
        Project.EntryDirectory,
        InstanceConfig
    );

    const ProjectInstanceJSFile = APT.Extensions.AbytekCMake.GetProjectInstanceJSFile(CMakeBuildDirectoryConfig.Path);

    const AbytekCMakeDirectory = path.dirname(ProjectInstanceJSFile);
    if (!fs.existsSync(AbytekCMakeDirectory))
    {
        fs.mkdirSync(AbytekCMakeDirectory, { recursive: true });
    }

    const AndroidProjectDirectory = path.join(
        Project.EntryDirectory,
        "Platforms",
        "Android",
        "Projects",
        "Application"
    ).replaceAll("\\", "/");

    const ImportJSFile = path.join(
        CMakeBuildDirectoryConfig.Path,
        "AbytekCMake",
        "Import.js"
    ).replaceAll("\\", "/");

    let FileContent = `
        const os = require("os");
        const fs = require("fs");
        const path = require("path");
        const { spawnSync } = require("child_process");

        const AndroidProjectDirectory = "${AndroidProjectDirectory}";
        const ImportJSFile = "${ImportJSFile}";
        let ProjectInstance = new Object();
        ProjectInstance.Load = function()
        {
            let Contexts = [];
            let AbytekCMakeListFiles = require(ImportJSFile);
            for (let AbytekCMakeListFile of AbytekCMakeListFiles) 
            {
                let List = require(AbytekCMakeListFile);
                Contexts.push(require(List.JSContextFile));
            }
            this.AbytekCMakeListFiles = AbytekCMakeListFiles;

            // Module names
            let ModuleNames = [];
            for (let Context of Contexts)
            {
                for (let ModuleName in Context.ModuleFiles)
                {
                    ModuleNames.push(ModuleName);
                }
            }
            this.ModuleNames = ModuleNames;

            // Module files
            let ModuleFiles = new Object();
            for (let Context of Contexts)
            {
                for (let ModuleName in Context.ModuleFiles)
                {
                    ModuleFiles[ModuleName] = Context.ModuleFiles[ModuleName];
                }
            }
            this.ModuleFiles = ModuleFiles;

            // Modules
            let Modules = new Object();
            for (let Context of Contexts)
            {
                for (let ModuleName in Context.ModuleFiles)
                {
                    Modules[ModuleName] = Context.RequireModule(ModuleName);
                }
            }
            this.Modules = Modules;
        };
    `;

    FileContent += `
        module.exports = ProjectInstance;
    `;
    fs.writeFileSync(ProjectInstanceJSFile, FileContent);
}