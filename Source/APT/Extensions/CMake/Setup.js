
AMJS.Import("./Common")
AMJS.Import("./Configure")
AMJS.Import("./Build")


APT.Extensions.CMake.Setup = function(Context)
{
    Context.APT.On(
        "PrepareSignature",
        function()
        {
        }
    );

    Context.APT.On(
        "Import",
        function()
        {
            let SourceDirectory = Context.APT.GetOrAdd("CMake.SourceDirectory", Context.APT.Project.EntryDirectory);
            let BuildDirectory = Context.APT.GetOrAdd("CMake.BuildDirectory", Context.APT.Project.EntryDirectory + "/Build");

            let ConfigureOptions = Context.APT.GetOrAdd("CMake.Configure.Options", APT.Extensions.CMake.GetDefaultConfigureOptions());
            if (Context.APT.GetOrAdd("CMake.Configure.Enabled", Context.APT.Project.IsMain))
            {
                APT.Extensions.CMake.Configure(
                    SourceDirectory,
                    BuildDirectory,
                    ConfigureOptions
                );
            }
            
            let BuildOptions = Context.APT.GetOrAdd("CMake.Build.Options", APT.Extensions.CMake.GetDefaultBuildOptions());
            if (Context.APT.GetOrAdd("CMake.Build.Enabled", false))
            {
                APT.Extensions.CMake.Build(
                    SourceDirectory,
                    BuildDirectory,
                    BuildOptions
                );
            }
        }
    );
}