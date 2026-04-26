AMJS.Import("./Logger");

AMJS.Namespace.F_System = class
{
    constructor()
    {
        this.Logger = new AMJS.Namespace.F_Logger(this);

        // // Apply LoggerDefault
        // if (this.CommandManager.CLIInput.has('GlobalDefault'))
        // {
        //     const GlobalDefault = this.CommandManager.CLIInput.get('GlobalDefault');
        //     if ("Logger" in GlobalDefault)
        //     {
        //         const LoggerDefault = GlobalDefault.Logger;
        //         if (LoggerDefault.HiddenCategories)
        //         {
        //             if (Array.isArray(LoggerDefault.HiddenCategories))
        //             {
        //                 for(const Category of LoggerDefault.HiddenCategories)
        //                 {
        //                     this.Logger.HideCategory(Category);
        //                 }
        //             }
        //         }
        //         if (LoggerDefault.HiddenTypes)
        //         {
        //             if (Array.isArray(LoggerDefault.HiddenTypes))
        //             {
        //                 for(const Type of LoggerDefault.HiddenTypes)
        //                 {
        //                     this.Logger.HideType(Type);
        //                 }
        //             }
        //         }
        //     }
        // }
        
        this.AutomaticExit = true;
    }

    Start()
    {
        if (this.AutomaticExit)
        {
            process.exit(0);
        }
    }
};