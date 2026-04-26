
AMJS.Import("./Instance")

APT.Extensions.CMake.Setup = function(Context)
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
                "CMake",
                new APT.Extensions.CMake.F_Instance(Context)
            );
        }
    );
}