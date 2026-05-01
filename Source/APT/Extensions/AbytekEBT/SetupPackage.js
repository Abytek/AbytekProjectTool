
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
            const Name = Context.APT.GetOrAdd("AbytekEBT.Name", "Package");
            Context.APT.Set("AbytekEBT.Options", Options);

            const Project = Context.APT.Set(
                "AbytekEBT.Project", 
                APT.Extensions.AbytekEBT.SearchProjectForPackage(Context.APT.Scope)
            );
            APT.Common.Assert(Project, `Not found project for Package at scope: ${Context.APT.Scope.EntryDirectory}`);
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