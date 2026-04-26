AMJS.Import("./Logger");
AMJS.Import("./Console");
AMJS.Import("./ProjectManager");

APT.Core.F_System = class
{
    constructor()
    {
        this.Logger = new APT.Core.F_Logger(this);

        this.Childs = [];

        this.AddChild(new APT.Core.F_Console(this));
        this.AddChild(new APT.Core.F_ProjectManager(this));

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

        this.Init();
        this.PostInit();
    }

    Start()
    {
        APT.Log("APT", "Start APT");

        for (let Child of this.Childs)
        {
            Child.Start();
        }

        APT.Log("APT", "Started APT");
        
        if (this.AutomaticExit)
        {
            process.exit(0);
        }
        else
        {
            APT.Log("APT", "APT stopped");
        }
    }
    Init()
    {
        APT.Log("APT", "Start initialize APT");
        for (let Child of this.Childs)
        {
            Child.Init();
        }
        APT.Log("APT", "Initialized APT");
    }
    PostInit()
    {
        APT.Log("APT", "Start post initialize APT");
        for (let Child of this.Childs)
        {
            Child.PostInit();
        }
        APT.Log("APT", "Post initialized APT");
    }

    GetChild(Name)
    {
        for (let Child of this.Childs)
        {
            if (Child.Name == Name)
            {
                return Child;
            }
        }
        return null;
    }
    AddChild(Child)
    {
        this.Childs.push(Child);
    }
};