
const F_ModuleSystem = require("./ModuleSystem/ModuleSystem");

let ModuleSystem = new F_ModuleSystem();
ModuleSystem.GlobalContext.ModuleSystem = ModuleSystem;
ModuleSystem.Test();