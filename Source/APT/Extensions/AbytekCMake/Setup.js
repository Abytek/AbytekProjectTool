
AMJS.Import("./ProjectComponent")

APT.Extensions.AbytekCMake.Setup = function(Context)
{
    APT.Extensions.Environment.Setup(Context);

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
                "AbytekCMake",
                new APT.Extensions.AbytekCMake.F_ProjectComponent(Context)
            );
        }
    );
}