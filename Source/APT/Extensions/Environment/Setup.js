
AMJS.Import("./Instance")

APT.Extensions.Environment.Setup = function(Context)
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
                "Environment",
                new APT.Extensions.Environment.F_Instance(Context)
            );
        }
    );
}