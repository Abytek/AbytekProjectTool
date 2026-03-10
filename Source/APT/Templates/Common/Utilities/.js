
const path = require("path")

AMJS.Namespace.GetDefaultShouldConfigureProjects = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').ShouldConfigureProjects;
    if (Result == null)
    {
        return true;
    }
    return APT.Common.ForwardBool(Result[0]);
}
AMJS.Namespace.GetDefaultSupportDebug = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').SupportDebug;
    if (Result == null)
    {
        return true;
    }
    return APT.Common.ForwardBool(Result[0]);
}
AMJS.Namespace.GetDefaultSupportOptimization = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').SupportOptimization;
    if (Result == null)
    {
        return false;
    }
    return APT.Common.ForwardBool(Result[0]);
}
AMJS.Namespace.GetDefaultSupportMinSize = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').SupportMinSize;
    if (Result == null)
    {
        return false;
    }
    return APT.Common.ForwardBool(Result[0]);
}
AMJS.Namespace.GetDefaultEnableTest = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').EnableTest;
    if (Result == null)
    {
        return false;
    }
    return APT.Common.ForwardBool(Result[0]);
}

AMJS.Namespace.GetDefaultProjectEntryDirectory = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').ProjectEntryDirectory;
    if (Result == null)
    {
        return null;
    }
    Result = APT.Common.ForwardString(Result[0]);
    if (Result != null)
    {
        return path.normalize(Result);
    }
    return null;
}

AMJS.Namespace.GetDefaultEnvironmentName = function()
{
    let Result = APT.Core.System.CommandManager.CLIInput.get('GlobalDefault').EnvironmentName;
    if (Result == null)
    {
        return "Development";
    }
    return APT.Common.ForwardString(Result[0]);
}