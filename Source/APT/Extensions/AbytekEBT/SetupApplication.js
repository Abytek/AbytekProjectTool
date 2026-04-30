
AMJS.Import("./Common")


APT.Extensions.AbytekEBT.GetDefaultSetupApplicationOptions = function()
{
    let Options = new Object();
    return Options;
}

APT.Extensions.AbytekEBT.SetupApplication = function(Context, Options)
{
    let DefaultOptions = APT.Extensions.AbytekEBT.GetDefaultSetupApplicationOptions();
    if (Options == null)
    {
        Options = new Object();
    }

    let AutoSearchedProject = null;
    {
        let Parent = Context.APT.Scope.Parent;
        while (Parent)
        {
            if (Parent.Has("AbytekEBT.IsProject"))
            {
                AutoSearchedProject = Parent;
            }
            Parent = Parent.Parent;
        }
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
            let Name = Context.APT.GetOrAdd("AbytekEBT.Name", "Appplication");
            Context.APT.Set("AbytekEBT.Options", Options);

            let Project = Context.APT.GetOrAdd("AbytekEBT.Project", AutoSearchedProject);
            APT.Common.Assert(Project, `Not found project for application at scope: ${Context.APT.Scope.EntryDirectory}`);

            Project.Push(
                "AbytekEBT.Applications",
                Context.APT.Scope
            );
        }
    );
}