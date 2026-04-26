
APT.Extensions.AbytekCMake.Setup(this);

APT.On(
    "Import",
    function()
    {
        let Environment = APT.Get("Environment");
        let AbytekCMake = APT.Get("AbytekCMake");
    }
);