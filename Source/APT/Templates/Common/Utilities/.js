
AMJS.Namespace.GetDefaultEnableDebug = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').EnableDebug;
    if (Result == null)
    {
        return true;
    }
    return APT.Common.ForwardBool(Result);
}
AMJS.Namespace.GetDefaultEnableOptimization = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').EnableOptimization;
    if (Result == null)
    {
        return false;
    }
    return APT.Common.ForwardBool(Result);
}
AMJS.Namespace.GetDefaultEnableMinSize = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').EnableMinSize;
    if (Result == null)
    {
        return false;
    }
    return APT.Common.ForwardBool(Result);
}
AMJS.Namespace.GetDefaultEnableTest = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').EnableTest;
    if (Result == null)
    {
        return false;
    }
    return APT.Common.ForwardBool(Result);
}

AMJS.Namespace.GetDefaultProjectEntryFile = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').ProjectEntryFile;
    if (Result == null)
    {
        return null;
    }
    return APT.Common.ForwardString(Result);
}