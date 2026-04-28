
AMJS.Import("./Common")
AMJS.Import("./CMakeConfigure")
AMJS.Import("./CMakeDefinitions")
AMJS.Import("./Prepare")
AMJS.Import("./ProjectInstance")


APT.Extensions.AbytekCMake.GetDefaultSetupOptions = function()
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

APT.Extensions.AbytekCMake.Setup = function(Context, Options)
{
    APT.Extensions.ProjectLinker.Setup(Context);

    let DefaultOptions = APT.Extensions.AbytekCMake.GetDefaultSetupOptions();
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
                "AbytekCMake.Platform", 
                APT.Common.GetHostPlatform()
            );
            let PlatformTags = APT.Common.ParsePlatformTags(Platform);
            let Environment = Context.APT.GetOrAdd(
                "AbytekCMake.Environment", 
                APT.Extensions.AbytekCMake.GetDefaultEnvironmentForPlatformTags(PlatformTags)
            );
            let CMakeGenerator = Context.APT.GetOrAdd(
                "AbytekCMake.CMakeGenerator", 
                APT.Extensions.CMake.GetDefaultGeneratorForPlatformTags(PlatformTags)
            );
            let CMakeConfig = Context.APT.GetOrAdd(
                "AbytekCMake.CMakeConfig", 
                APT.Extensions.CMake.GetDefaultConfig()
            );
            let ProcessorArch = Context.APT.GetOrAdd(
                "AbytekCMake.ProcessorArch", 
                APT.Extensions.AbytekCMake.GetDefaultProcessorArchForPlatformTags(PlatformTags)
            );

            let InstanceConfig = Context.APT.TransferSignature(
                "AbytekCMake.InstanceConfig", 
                APT.Extensions.AbytekCMake.FinalizeInstanceConfig({
                    Environment,
                    Platform,
                    CMakeGenerator,
                    CMakeConfig,
                    ProcessorArch
                })
            );
        }
    );

    Context.APT.On(
        "Import",
        function()
        {
            let GlobalContext = Context.AMJS.GetGlobalContext();

            let InstanceConfig = Context.APT.Get("AbytekCMake.InstanceConfig");
            
            let Name = Context.APT.GetOrAdd("AbytekCMake.Name", "AbytekProject");
            Context.APT.Set("AbytekCMake.Options", Options);

            let PrepareEnabled = APT.Common.ForwardBool(
                Context.APT.GetOrAdd("AbytekCMake.Prepare.Enabled", Context.APT.Project.IsMain)
            );
            let PrepareTargetsToBuild = Context.APT.GetOrAdd("AbytekCMake.Prepare.TargetsToBuild", []);

            // Find & import
            let Engine = null;
            if (Options.IsEngine)
            {
                if (GlobalContext.AbytekCMake == null)
                {
                    GlobalContext.AbytekCMake = {
                        Engines: []
                    };
                }
                GlobalContext.AbytekCMake.Engines.push(Context.APT.Project);
                
                Engine = Context.APT.Set("AbytekCMake.Engine", Context.APT.Project);
            }
            else
            {
                let EngineData = new APT.Core.F_ProjectData();
                for (let DataKey of APT.Extensions.AbytekCMake.GetSignatureDataKeys())
                {
                    EngineData.Set(
                        DataKey,
                        Context.APT.Get(DataKey)
                    );
                }

                Engine = APT.Extensions.ProjectLinker.Ensure(Options.EngineLinkQuery, EngineData);
                Engine = Context.APT.Set("AbytekCMake.Engine", Engine);
            }

            let CMakeDefinitions = Context.APT.GetOrAdd("AbytekCMake.CMakeDefinitions", []);

            // Generate engine path file
            APT.Extensions.AbytekCMake.GenerateEnginePathFile(
                Context.APT.Project.EntryDirectory,
                Engine.EntryDirectory,
                InstanceConfig
            );       

            // Generate CMakeLists file if needed
            if (!Options.IsEngine)
            {
                APT.Extensions.AbytekCMake.GenerateCMakeListsFile(
                    Context.APT.Project,
                    Name
                );
            }

            // Apply cmake definitions
            APT.Extensions.AbytekCMake.ApplyCMakeDefinitions(
                CMakeDefinitions,
                Context.APT.Project.EntryDirectory,
                InstanceConfig
            );

            // Prepare if needed
            if (PrepareEnabled)
            {
                APT.Extensions.AbytekCMake.Prepare(Context.APT.Project);
            }
        }
    );
}