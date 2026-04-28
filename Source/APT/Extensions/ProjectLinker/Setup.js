
APT.Extensions.ProjectLinker.Setup = function(Context)
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
            APT.Extensions.ProjectLinker.LinkDirectory(
                Context.APT.Project.EntryDirectory
            );
        }
    );
}