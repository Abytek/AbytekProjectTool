
AMJS.Import("./Common");


APT.Extensions.AbytekCMake.F_ProjectComponent = class extends APT.Core.A_ProjectComponent
{
    constructor(Context, Options)
    {
        super(Context);

        let Environment = this.Get("AbytekCMake.Environment");
        let PlatformTags = this.Get("AbytekCMake.PlatformTags");
        let Editor = this.Get("AbytekCMake.Editor");

        let Name = this.GetOrAdd("AbytekCMake.Name", "AbytekProject");

        let PrepareEnabled = this.GetOrAdd("AbytekCMake.Prepare.Enabled", this.Project.IsMain);
        let PrepareCMakeConfig = this.GetOrAdd(
            "AbytekCMake.Prepare.CMakeConfig", 
            APT.Extensions.AbytekCMake.GetDefaultCMakeConfigForEditor(Editor)
        );

        let CMakeDefinitions = this.GetOrAdd("AbytekCMake.CMakeDefinitions", []);

        this.Set("AbytekCMake.Options", Options);

        // Prepare engine
        let Engine = null;
        if (Options.IsEngine)
        {
            Engine = this.Set("AbytekCMake.Engine", this.Project);
        }
        else
        {
            let GlobalContext = Context.AMJS.GetGlobalContext();
            for (let EngineToCheck of GlobalContext.AbytekCMake.Engines)
            {
                let IsMatched = true;
                for (let EngineCheckKey of APT.Extensions.AbytekCMake.GetSignatureDataKeys())
                {
                    if (
                        APT.Common.NiceJSONStringify(
                            EngineToCheck.Data.Get(EngineCheckKey)
                        )
                        != APT.Common.NiceJSONStringify(
                            this.Get(EngineCheckKey)
                        )
                    )
                    {
                        IsMatched = false;
                        break;
                    }
                }
                if (!IsMatched)
                {
                    continue;
                }
                Engine = this.Set("AbytekCMake.Engine", EngineToCheck);
            }
            if (!Engine)
            {
                APT.FatalError("APT", `Not found engine for project: ${this.Project.EntryDirectory}`);
            }
            APT.Log("APT", `Found engine at \"${Engine.EntryDirectory}\" for project: ${this.Project.EntryDirectory}`);
        }

        // Generate engine path file
        APT.Extensions.AbytekCMake.GenerateEnginePathFile(
            this.Project.EntryDirectory,
            Environment,
            PlatformTags,
            Editor,
            Engine.EntryDirectory
        );       

        // Generate CMakeLists file if needed
        if (!Options.IsEngine)
        {
            APT.Extensions.AbytekCMake.GenerateCMakeListsFile(
                this.Project.EntryDirectory,
                Name
            );
        }

        // Apply cmake definitions
        APT.Extensions.AbytekCMake.ApplyCMakeDefinitions(
            CMakeDefinitions,
            this.Project.EntryDirectory,
            Environment,
            PlatformTags,
            Editor
        );

        // Prepare if needed
        if (PrepareEnabled)
        {
            APT.Extensions.AbytekCMake.Prepare(this.Project, PrepareCMakeConfig);
        }
    }
}