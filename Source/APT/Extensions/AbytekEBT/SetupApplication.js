
AMJS.Import("./Common")


APT.Extensions.AbytekEBT.GetDefaultSetupApplicationOptions = function()
{
    let Options = new Object();
    return Options;
}

APT.Extensions.AbytekEBT.SearchProjectForApplication = function(ApplicationScope)
{
    let Result = null;
    {
        let Parent = ApplicationScope.Parent;
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
            
            let CMakeDefinitions = Context.APT.GetOrAdd("AbytekEBT.CMakeDefinitions", []);

            const CookPipeline = Context.APT.GetOrAdd("AbytekEBT.CookPipeline", APT.Extensions.AbytekEBT.DEFAULT_COOK_PIPELINE);
            const IncludeHeaders = Context.APT.GetOrAdd("AbytekEBT.IncludeHeaders", []);
            const ApplicationClasses = Context.APT.GetOrAdd("AbytekEBT.ApplicationClasses", []);
        }
    );
}