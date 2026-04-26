
APT.Extensions.AbytekCMake.F_ProjectComponent = class extends APT.Core.A_ProjectComponent
{
    constructor(Context, Options)
    {
        super(Context);

        this.Set("AbytekCMake.Options", Options);

        // Prepare engine
        let Engine = null;
        if (Options.IsEngine)
        {
            Engine = this;
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
                APT.Log("APT", `Found engine at \"${Engine.EntryDirectory}\" for project: ${this.Project.EntryDirectory}`);
            }
            if (!Engine)
            {
                APT.FatalError("APT", `Not found engine for project: ${this.Project.EntryDirectory}`);
            }
        }
    }
}