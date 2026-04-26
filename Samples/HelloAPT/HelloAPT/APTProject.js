
APT.Extensions.AbytekCMake.Setup(this);

APT.On(
    "Import",
    function()
    {
        let Environment = APT.Get("Environment");
        let AbytekCMake = APT.Get("AbytekCMake");

        APT.Extensions.CMake.Configure(
            APT.Project.EntryDirectory,
            APT.Project.EntryDirectory + "/Build"
        );
        APT.Extensions.CMake.Build(
            APT.Project.EntryDirectory,
            APT.Project.EntryDirectory + "/Build",
            "Demo"
        );
    }
);