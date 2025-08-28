
AMJS.Namespace.GetDefaultShouldConfigureProjects = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').ShouldConfigureProjects;
    if (Result == null)
    {
        return true;
    }
    return APT.Common.ForwardBool(Result);
}
AMJS.Namespace.GetDefaultSupportDebug = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').SupportDebug;
    if (Result == null)
    {
        return true;
    }
    return APT.Common.ForwardBool(Result);
}
AMJS.Namespace.GetDefaultSupportOptimization = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').SupportOptimization;
    if (Result == null)
    {
        return false;
    }
    return APT.Common.ForwardBool(Result);
}
AMJS.Namespace.GetDefaultSupportMinSize = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').SupportMinSize;
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

AMJS.Namespace.GetDefaultEnvironmentName = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').EnvironmentName;
    if (Result == null)
    {
        return "Development";
    }
    return APT.Common.ForwardString(Result);
}