
AMJS.Import("./Common")
AMJS.Import("./CMakeConfigure")
AMJS.Import("./CMakeDefinitions")
AMJS.Import("./Prepare")


APT.Extensions.AbytekEBT.GetDefaultSetupOptions = function()
{
    let Options = new Object();
    Options.IsEngine = false;
    Options.EngineLinkQuery = {
        GitDetails: {
            RemoteURL: "git@github.com:Abytek/Abytek.git"
        }
    };
    return Options;
}

APT.Extensions.AbytekEBT.SetupProject = function(Context, Options)
{
    APT.Extensions.ScopeLinker.Setup(Context);

    let DefaultOptions = APT.Extensions.AbytekEBT.GetDefaultSetupOptions();
    if (Options == null)
    {
        Options = new Object();
    }
    if (Options.IsEngine == null)
    {
        Options.IsEngine = DefaultOptions.IsEngine;
    }
    if (Options.EngineLinkQuery == null)
    {
        Options.EngineLinkQuery = DefaultOptions.EngineLinkQuery;
    }

    Context.APT.On(
        "PrepareSignature",
        function()
        {
            let Platform = Context.APT.GetOrAdd(
                "AbytekEBT.Platform", 
                APT.Common.GetHostPlatform()
            );
            let PlatformTags = APT.Common.ParsePlatformTags(Platform);
            let Environment = Context.APT.GetOrAdd(
                "AbytekEBT.Environment", 
                APT.Extensions.AbytekEBT.GetDefaultEnvironmentForPlatformTags(PlatformTags)
            );
            let CMakeGenerator = Context.APT.GetOrAdd(
                "AbytekEBT.CMakeGenerator", 
                APT.Extensions.CMake.GetDefaultGeneratorForPlatformTags(PlatformTags)
            );
            let CMakeConfig = Context.APT.GetOrAdd(
                "AbytekEBT.CMakeConfig", 
                APT.Extensions.CMake.GetDefaultConfig()
            );
            let ProcessorArchs = Context.APT.GetOrAdd(
                "AbytekEBT.ProcessorArchs", 
                APT.Extensions.AbytekEBT.GetDefaultProcessorArchsForPlatformTags(PlatformTags)
            );

            let ProjectInstanceParams = Context.APT.TransferSignature(
                "AbytekEBT.ProjectInstanceParams", 
                APT.Extensions.AbytekEBT.FinalizeProjectInstanceParams({
                    Environment,
                    Platform,
                    CMakeGenerator,
                    CMakeConfig,
                    ProcessorArchs
                })
            );
        }
    );

    Context.APT.On(
        "Import",
        function()
        { 
            let GlobalContext = Context.AMJS.GetGlobalContext();

            let ProjectInstanceParams = Context.APT.Get("AbytekEBT.ProjectInstanceParams");
            let ProjectInstance = Context.APT.Set(
                "AbytekEBT.ProjectInstance",
                new APT.Extensions.AbytekEBT.F_ProjectInstance(ProjectInstanceParams)
            );
            let PlatformTags = APT.Common.ParsePlatformTags(ProjectInstance.Platform);
            
            let Name = Context.APT.GetOrAdd("AbytekEBT.Name", "AbytekScope");
            Context.APT.Set("AbytekEBT.Options", Options);

            let PrepareEnabled = APT.Common.ForwardBool(
                Context.APT.GetOrAdd("AbytekEBT.Prepare.Enabled", Context.APT.Scope.IsMain)
            );
            let PrepareMode = Context.APT.GetOrAdd("AbytekEBT.Prepare.Mode", APT.Extensions.AbytekEBT.GetDefaultPrepareMode(PlatformTags));
            let PrepareTargetsToBuild = Context.APT.GetOrAdd("AbytekEBT.Prepare.TargetsToBuild", []);

            // Find & import
            let Engine = null;
            if (Options.IsEngine)
            {
                if (GlobalContext.AbytekEBT == null)
                {
                    GlobalContext.AbytekEBT = {
                        Engines: []
                    };
                }
                GlobalContext.AbytekEBT.Engines.push(Context.APT.Scope);
                
                Engine = Context.APT.Set("AbytekEBT.Engine", Context.APT.Scope);
            }
            else
            {
                let EngineData = new APT.Core.F_ScopeData();
                for (let DataKey of APT.Extensions.AbytekEBT.GetSignatureDataKeys())
                {
                    EngineData.Set(
                        DataKey,
                        Context.APT.Get(DataKey)
                    );
                }

                Engine = APT.Extensions.ScopeLinker.Ensure(Options.EngineLinkQuery, EngineData);
                Engine = Context.APT.Set("AbytekEBT.Engine", Engine);
            }

            let CMakeDefinitions = Context.APT.GetOrAdd("AbytekEBT.CMakeDefinitions", []);

            // Generate engine path file
            APT.Extensions.AbytekEBT.GenerateEnginePathFile(Context.APT.Scope);       

            // Generate CMakeLists file if needed
            if (!Options.IsEngine)
            {
                APT.Extensions.AbytekEBT.GenerateCMakeListsFile(Context.APT.Scope);
            }

            // Apply cmake definitions
            APT.Extensions.AbytekEBT.ApplyCMakeDefinitions(Context.APT.Scope);

            //
            APT.Extensions.AbytekEBT.GenerateCMakeBuildDirectorySignatureFiles(Context.APT.Scope)
            
            // Broadcast events
            let BeforePrepareEvent = Context.APT.GetOrAdd("AbytekEBT.Events.BeforePrepare", []);
            APT.Common.BroadcastSimpleEvent(BeforePrepareEvent);

            // Prepare if needed
            if (PrepareEnabled)
            {
                APT.Extensions.AbytekEBT.Prepare(Context.APT.Scope);
            }
        }
    );
}