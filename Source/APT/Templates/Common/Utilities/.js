
AMJS.Namespace.GetDefaultEnableDebug = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').EnableDebug;
    if (Result == null)
    {
        return true;
    }
    return Result;
}
AMJS.Namespace.GetDefaultEnableOptimization = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').EnableOptimization;
    if (Result == null)
    {
        return false;
    }
    return Result;
}
AMJS.Namespace.GetDefaultEnableMinSize = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').EnableMinSize;
    if (Result == null)
    {
        return false;
    }
    return Result;
}