
AMJS.Namespace.GetEngineProject = function()
{
    if ('Abytek' in AMJS.ModuleSystem.GlobalContext)
    {
        return AMJS.ModuleSystem.GlobalContext.Abytek.EngineProject;
    }
    throw new Error("Abytek Engine was not imported");
}