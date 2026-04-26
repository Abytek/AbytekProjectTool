
AMJS.Import("./ProjectComponent")

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
            Context.APT.Set(
                "ProjectLinker",
                new APT.Extensions.ProjectLinker.F_ProjectComponent(Context)
            );
        }
    );
}