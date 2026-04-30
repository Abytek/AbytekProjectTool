
APT.Extensions.ScopeLinker.Setup = function(Context)
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
            APT.Extensions.ScopeLinker.LinkDirectory(
                Context.APT.Scope.EntryDirectory
            );
        }
    );
}