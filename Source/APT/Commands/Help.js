
AMJS.Import("../Editors");
AMJS.Import("../Templates/Common/Utilities");

class F_Logger
{
    constructor(CommandManager)
    {
        this.CommandManager = CommandManager;

        this.CommandName = null;
        this.AutomaticDetect = false;
        this.NeedMainProjectEntryFile = true;
        this.Description = null;

        this.IsFinalized = false;
    }

    SetCommandName(CommandName)
    {
        this.CommandName = CommandName;
    }
    SetAutomaticDetect(Value)
    {
        this.AutomaticDetect = Value;
    }
    SetNeedMainProjectEntryFile(Value)
    {
        this.NeedMainProjectEntryFile = Value;
    }
    SetDescription(Value)
    {
        this.Description = Value;
    }

    TryFinalize()
    {
        if (!this.IsFinalized)
        {
            console.log(`   ${this.CommandName}:`);
            if (this.Description)
            {
                console.log(`       Description: ${this.Description}`);
            }
            console.log(`       Syntax: apt ${this.NeedMainProjectEntryFile ? '<MainProjectEntryFile> ' : ''}${this.AutomaticDetect ? '' : `:${this.CommandName}`} <AdditionalArguments...>`);
        }
    }
}

AMJS.Namespace.Help = function(CommandManager)
{
    console.log(`APT CLI commands:`);
    for(let Command of CommandManager.Commands)
    {
        if (Command.LogHelp)
        {
            let Logger = new F_Logger(CommandManager);
            Command.LogHelp(Logger);
            Logger.TryFinalize();
        }
    }
    return true;
}
AMJS.Namespace.Help.LogHelp = function(Logger)
{
    Logger.SetCommandName("Help");
    Logger.SetAutomaticDetect(true);
    Logger.SetNeedMainProjectEntryFile(false);
    Logger.SetDescription("list all the APT CLI commands");
}