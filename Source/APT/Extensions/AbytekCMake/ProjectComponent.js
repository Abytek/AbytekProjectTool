
AMJS.Import("./Common");


APT.Extensions.AbytekCMake.F_ProjectComponent = class extends APT.Core.A_ProjectComponent
{
    constructor(Context, Options)
    {
        super(Context);

        let Name = this.GetOrAdd("AbytekCMake.Name", "AbytekProject");
        this.Set("AbytekCMake.Options", Options);

        // Prepare engine
        let Engine = null;
        if (Options.IsEngine)
        {
            Engine = this.Project;
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
            this.Get("AbytekCMake.Environment"),
            this.Get("AbytekCMake.PlatformTags"),
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
    }
}