
AMJS.Import("./ProjectComponent")
AMJS.Import("./Common")


APT.Extensions.AbytekCMake.GetDefaultSetupOptions = function()
{
    let Options = new Object();
    Options.IsEngine = false;
    return Options;
}

APT.Extensions.AbytekCMake.Setup = function(Context, Options)
{
    APT.Extensions.Environment.Setup(Context);

    let DefaultOptions = APT.Extensions.AbytekCMake.GetDefaultSetupOptions();
    if (Options == null)
    {
        Options = new Options();
    }
    if (Options.IsEngine == null)
    {
        Options.IsEngine = DefaultOptions.IsEngine;
    }

    Context.APT.On(
        "PrepareSignature",
        function()
        {
            Context.APT.TransferSignature(
                "AbytekCMake.EnvironmentName", 
                "Development"
            );
            let PlatformTags = Context.APT.TransferSignature(
                "AbytekCMake.PlatformTags", 
                APT.Common.GetHostPlatformTags()
            );
            let Generator = Context.APT.TransferSignature(
                "AbytekCMake.Generator", 
                APT.Extensions.CMake.GetDefaultGenerator(PlatformTags)
            );
            let Config = Context.APT.TransferSignature(
                "AbytekCMake.Config", 
                APT.Extensions.CMake.GetDefaultConfigForGenerator(Generator)
            );
        }
    );

    Context.APT.On(
        "Import",
        function()
        {
            let GlobalContext = Context.AMJS.GetGlobalContext();

            if (Options.IsEngine)
            {
                if (GlobalContext.AbytekCMake == null)
                {
                    GlobalContext.AbytekCMake = {
                        Engines: []
                    };
                }
                GlobalContext.AbytekCMake.Engines.push(Context.APT.Project);
            }

            console.log(Context.APT.Project.SignatureData.GetSignature());

            Context.APT.Set(
                "AbytekCMake",
                new APT.Extensions.AbytekCMake.F_ProjectComponent(Context)
            );
        }
    );
}