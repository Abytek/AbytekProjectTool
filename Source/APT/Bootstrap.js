
const AMJS = require("../../Submodules/AbytekModuleJS/Source/AMJS/.js");

let ModuleSystem = new AMJS.F_ModuleSystem();
ModuleSystem.SourceDirectories = 
[
    __dirname
];

let APT = ModuleSystem.Import(null, ".js");

let System = new APT.Core.F_System();
APT.Core.System = System;
System.Start();