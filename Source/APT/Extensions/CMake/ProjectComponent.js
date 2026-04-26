
AMJS.Import("./Common")


APT.Extensions.CMake.F_ProjectComponent = class extends APT.Core.A_ProjectComponent
{
    constructor(Context)
    {
        super(Context);

        let SourceDirectory = this.GetOrAdd("CMake.SourceDirectory", this.Project.EntryDirectory);
        let BuildDirectory = this.GetOrAdd("CMake.BuildDirectory", this.Project.EntryDirectory + "/Build");

        let ConfigureOptions = this.GetOrAdd("CMake.Configure.Options", APT.Extensions.CMake.GetDefaultConfigureOptions());
        if (this.GetOrAdd("CMake.Configure.Enabled", this.Project.IsMain))
        {
            APT.Extensions.CMake.Configure(
                SourceDirectory,
                BuildDirectory,
                ConfigureOptions
            );
        }
        
        let BuildOptions = this.GetOrAdd("CMake.Build.Options", APT.Extensions.CMake.GetDefaultBuildOptions());
        if (this.GetOrAdd("CMake.Build.Enabled", false))
        {
            APT.Extensions.CMake.Build(
                SourceDirectory,
                BuildDirectory,
                BuildOptions
            );
        }
    }
}