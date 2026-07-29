
AMJS.Import("./Common")


APT.Extensions.AbytekEBT.GetDefaultSetupApplicationOptions = function()
{
    let Options = new Object();
    return Options;
}

APT.Extensions.AbytekEBT.SearchProjectForApplication = function(ApplicationScope)
{
    let Parent = ApplicationScope.Parent;
    while (Parent)
    {
        if (Parent.Has("AbytekEBT.IsProject"))
        {
            return Parent;
        }
        if (Parent.Has("AbytekEBT.Project"))
        {
            return Parent.Get("AbytekEBT.Project");
        }
        Parent = Parent.Parent;
    }
    return null;
}
APT.Extensions.AbytekEBT.SearchPackageForApplication = function(ApplicationScope)
{
    let Parent = ApplicationScope.Parent;
    while (Parent)
    {
        if (Parent.Has("AbytekEBT.IsPackage"))
        {
            return Parent;
        }
        Parent = Parent.Parent;
    }
    return null;
}
APT.Extensions.AbytekEBT.SetupApplication = function(Context, Options)
{
    const DefaultOptions = APT.Extensions.AbytekEBT.GetDefaultSetupApplicationOptions();
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
            const Name = Context.APT.GetOrAdd("AbytekEBT.Name", "Appplication");
            Context.APT.Set("AbytekEBT.Options", Options);

            const Project = Context.APT.Set(
                "AbytekEBT.Project", 
                APT.Extensions.AbytekEBT.SearchProjectForApplication(Context.APT.Scope)
            );
            APT.Common.Assert(Project, `Not found project for application at scope: ${Context.APT.Scope.EntryDirectory}`);
            Project.Push(
                "AbytekEBT.Applications",
                Context.APT.Scope
            );

            const Package = Context.APT.Set(
                "AbytekEBT.Package", 
                APT.Extensions.AbytekEBT.SearchPackageForApplication(Context.APT.Scope)
            );
            if (Package)
            {
                Context.APT.Set(
                    "AbytekEBT.Owner", 
                    Package
                );
            }
            else
            {
                Context.APT.Set(
                    "AbytekEBT.Owner", 
                    Project
                );
            }
            
            let CMakeDefinitions = Context.APT.GetOrAdd("AbytekEBT.CMakeDefinitions", []);

            const CookPipeline = Context.APT.GetOrAdd("AbytekEBT.CookPipeline", APT.Extensions.AbytekEBT.DEFAULT_COOK_PIPELINE);
            const IncludeHeaders = Context.APT.GetOrAdd("AbytekEBT.IncludeHeaders", []);
            const ApplicationClass = Context.APT.GetOrAdd("AbytekEBT.ApplicationClass", "Abytek::F_Application");
            const ApplicationModuleClasses = Context.APT.GetOrAdd("AbytekEBT.ApplicationModuleClasses", []);
        }
    );
}