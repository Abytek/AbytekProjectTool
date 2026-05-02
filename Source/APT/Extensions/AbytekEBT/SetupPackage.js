
const path = require("path");

AMJS.Import("./Common")


APT.Extensions.AbytekEBT.GetDefaultSetupPackageOptions = function()
{
    let Options = new Object();
    return Options;
}

APT.Extensions.AbytekEBT.SearchProjectForPackage = function(PackageScope)
{
    let Result = null;
    {
        let Parent = PackageScope.Parent;
        while (Parent)
        {
            if (Parent.Has("AbytekEBT.IsProject"))
            {
                Result = Parent;
            }
            Parent = Parent.Parent;
        }
    }
    return Result;
}
APT.Extensions.AbytekEBT.SetupPackage = function(Context, Options)
{
    APT.Extensions.ScopeLinker.Setup(Context);

    const DefaultOptions = APT.Extensions.AbytekEBT.GetDefaultSetupPackageOptions();
    if (Options == null)
    {
        Options = new Object();
    }

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
            Context.APT.Set("AbytekEBT.IsPackage", true);

            const Name = Context.APT.GetOrAdd("AbytekEBT.Name", "Package");
            Context.APT.Set("AbytekEBT.Options", Options);

            let Project = APT.Extensions.AbytekEBT.SearchProjectForPackage(Context.APT.Scope);
            if (!Project)
            {
                Project = APT.Extensions.AbytekEBT.EnsureTempProject(Context.APT.Scope);
            }
            Context.APT.Set(
                "AbytekEBT.Project", 
                Project
            );
            Project.Push(
                "AbytekEBT.Packages",
                Context.APT.Scope
            );

            let CMakeDefinitions = Context.APT.GetOrAdd("AbytekEBT.CMakeDefinitions", []);     
                        
            // Import modules
            APT.Extensions.AbytekEBT.ImportModules(Context.APT.Scope, path.join(Context.APT.Scope.EntryDirectory, "Modules"));

            // Broadcast events
            let BeforePrepareEvent = Context.APT.GetOrAdd("AbytekEBT.Events.BeforePrepare", []);
            APT.Common.BroadcastSimpleEvent(BeforePrepareEvent);  

            // Generate CMakeLists file
            APT.Extensions.AbytekEBT.GeneratePackageCMakeListsFile(Context.APT.Scope);
        }
    );
}