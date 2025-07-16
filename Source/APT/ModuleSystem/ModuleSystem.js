
const path = require("path");
const fs = require("fs");
const vm = require("vm");

const F_Module = require("./Module");

module.exports = class F_ModuleSystem
{
    constructor()
    {
        this.SourceDirectories = [];
        this.Modules = new Object(); 
        this.GlobalContext = {
            console: console
        };
        vm.createContext(this.GlobalContext);
    }

    Test()
    {
        let Script = new vm.Script('console.log(ModuleSystem);');
        Script.runInContext(this.GlobalContext);
    }

    SearchModuleAbsolutePath(BaseModule, RelativePath)
    {
        return null;
    }
    LoadModule(BaseModule, RelativePath, Required = true)
    {
        let AbsolutePath = this.SearchModuleAbsolutePath(BaseModule, RelativePath);
        if (!AbsolutePath)
        {
            if (Required)
            {
                throw new Error(`Not found module ${RelativePath}`);
            }
            return null;
        }

        if (AbsolutePath in this.Modules)
        {
            return this.Modules[AbsolutePath];
        }

        let Module = new F_Module(this, AbsolutePath);
        this.Modules[AbsolutePath] = Module;
        
        vm.runInContext(Module.FileContent);

        return Module;
    }
}