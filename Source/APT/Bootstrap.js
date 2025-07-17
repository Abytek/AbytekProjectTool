
const AMJS = require("../../Submodules/AbytekModuleJS/Source/AMJS/.js");

let ModuleSystem = new AMJS.F_ModuleSystem();
ModuleSystem.SourceDirectoryPaths = 
[
    __dirname
];

let APTModule = ModuleSystem.LoadModule(null, ".js");