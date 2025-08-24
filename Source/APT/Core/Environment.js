
const path = require("path");

AMJS.Import("./Project")

/**
 * @class F_Environment
 * @memberof APT.Core
 */
AMJS.Namespace.F_Environment = class
{
    /**
     * Creates a new F_Environment instance
     * @param {APT.Core.F_System} System - Parent system instance
     */
    constructor(System)
    {
        /** @type {APT.Core.F_System} Parent system reference */
        this.System = System;
    }

    LoadEnvironmentConfig(Module, EnvName, ConfigDirectoryPath)
    {
        let EnvConfig = AMJS.ModuleSystem.ImportJSON(Module, path.join(ConfigDirectoryPath, EnvName));
        if ("Parent" in EnvConfig)
        {
            let ParentEnvName = EnvConfig.Parent;
            let ParentEnvConfig = this.LoadEnvironmentConfig(Module, ParentEnvName, ConfigDirectoryPath);
            EnvConfig = this.MergeEnvironmentConfigs(EnvConfig, ParentEnvConfig);
        }
        return EnvConfig;
    }
    MergeEnvironmentConfigs(A, Base)
    {
        let Result = APT.Common.SimpleDeepCopy(Base);
        if ("Dependencies" in A)
        {
            let ADependencies = A.Dependencies;
            if (!("Dependencies" in Result))
            {
                Result.Dependencies = new Object();
            }
            let ResultDependencies = Result.Dependencies;
            for (let Key in ADependencies)
            {
                ResultDependencies[Key] = APT.Common.SimpleDeepCopy(ADependencies[Key]);
            }
        }
        return Result;
    }
    SetupEnvironment(Module, EnvName, ConfigDirectoryPath)
    {
        let EnvConfig = this.LoadEnvironmentConfig(Module, EnvName, ConfigDirectoryPath);
        console.log("APT.SetupEnvironment:\n", EnvConfig);
    }
}