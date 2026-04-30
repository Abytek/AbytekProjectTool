
AMJS.Import("./Logger");
AMJS.Import("./Console");
AMJS.Import("./ScopeManager");

APT.Core.F_System = class
{
    constructor()
    {
        this.Logger = new APT.Core.F_Logger(this);

        this.Childs = [];

        this.AddChild(new APT.Core.F_Console(this));
        this.AddChild(new APT.Core.F_ScopeManager(this));

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

        this.StageDefinitions = new Object();
        this.SortedStageDefinitions = [];
    }

    Start()
    {
        APT.Log("APT", "Start APT");

        let System = this;

        // Prepare stages
        {
            APT.Log("APT", "Start gathering stage definitions");
            {
                for (let Child of this.Childs)
                {
                    let StageDefinitions = Child.GetStageDefinitions();
                    for (let StageDefinitionName in StageDefinitions)
                    {
                        APT.Common.Assert(!(StageDefinitionName in this.StageDefinitions), `Already added stage definition "${StageDefinitionName}"`);
                        let StageDefinition = StageDefinitions[StageDefinitionName];
                        if (StageDefinition.Dependencies == null)
                        {
                            StageDefinition.Dependencies = [];
                        }
                        StageDefinition.Name = StageDefinitionName;
                        this.StageDefinitions[StageDefinitionName] = StageDefinition;
                    }
                }
            }
            APT.Log("APT", "Gathered stage definitions:");
            for (let StageDefinitionName in this.StageDefinitions)
            {
                let StageDefinition = this.StageDefinitions[StageDefinitionName];
                APT.Log("APT", `\t- ${StageDefinitionName}:`);
                APT.Log("APT", `\t\t+ Dependencies: [${StageDefinition.Dependencies}]`);
            }

            APT.Log("APT", "Start sorting stage definitions");
            {
                let SortedStageDefinitionNames_NonRoot = [];
                for (let StageDefinitionName in this.StageDefinitions)
                {
                    let StageDefinition = this.StageDefinitions[StageDefinitionName];
                    for (let DependencyName of StageDefinition.Dependencies)
                    {
                        if (SortedStageDefinitionNames_NonRoot.includes(DependencyName))
                        {
                            continue;
                        }
                        SortedStageDefinitionNames_NonRoot.push(DependencyName);
                    }
                }

                let DependencyLevels = new Object();
                {
                    for (let StageDefinitionName in this.StageDefinitions)
                    {
                        DependencyLevels[StageDefinitionName] = 0;
                    }

                    let ResolveStageDefinitionDependencyLevel = function(StageDefinitionName, Level = 0)
                    {
                        DependencyLevels[StageDefinitionName] = Math.max(
                            DependencyLevels[StageDefinitionName],
                            Level
                        );
                        
                        let StageDefinition = System.StageDefinitions[StageDefinitionName];
                        for (let DependencyName of StageDefinition.Dependencies)
                        {
                            ResolveStageDefinitionDependencyLevel(DependencyName, Level + 1);
                        }
                    }
                    for (let StageDefinitionName in this.StageDefinitions)
                    {
                        if (SortedStageDefinitionNames_NonRoot.includes(StageDefinitionName))
                        {
                            continue;
                        }
                        ResolveStageDefinitionDependencyLevel(StageDefinitionName);
                    }
                }

                for (let StageDefinitionName in this.StageDefinitions)
                {
                    let StageDefinition = System.StageDefinitions[StageDefinitionName];
                    this.SortedStageDefinitions.push(StageDefinition);
                }
                this.SortedStageDefinitions.sort(
                    (A, B) => 
                    {
                        return DependencyLevels[B.Name] - DependencyLevels[A.Name];
                    }
                );
            }
            APT.Log("APT", "Sorted stage definitions:");
            for (let StageDefinition of this.SortedStageDefinitions)
            {
                APT.Log("APT", `\t- ${StageDefinition.Name}:`);
                APT.Log("APT", `\t\t+ Dependencies: [${StageDefinition.Dependencies}]`);
            }
        }

        for (let StageDefinition of this.SortedStageDefinitions)
        {
            APT.Log("APT", `Begin stage: ${StageDefinition.Name}`);
            for (let Child of this.Childs)
            {
                const OnStageFunctionName = "OnStage_" + StageDefinition.Name;
                if (OnStageFunctionName in Child)
                {
                    Child[OnStageFunctionName]();
                }
            }
            APT.Log("APT", `End stage: ${StageDefinition.Name}`);
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