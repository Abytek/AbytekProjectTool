
const AMJS = require("../../Submodules/AbytekModuleJS/Source/AMJS/.js");

let ModuleSystem = new AMJS.F_ModuleSystem();
ModuleSystem.SourceDirectoryPaths = 
[
    __dirname
];

let APT = ModuleSystem.Import(null, ".js");

let System = new APT.Core.F_System();

System.ProjectManager.ImportProject(null, "D:/GitRepositories/NCoder/AbytekProjectTool/Samples/HelloAPT/HelloAPT.js", {});