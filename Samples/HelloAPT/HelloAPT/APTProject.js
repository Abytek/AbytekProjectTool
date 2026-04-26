
APT.On(
    "PrepareSignature",
    function()
    {
        APT.Log("HelloAPT", `PrepareSignature: ${APT.Project.EntryDirectory}`);   
    }
);

APT.On(
    "Init",
    function()
    {
        APT.Log("HelloAPT", `Init: ${APT.Project.EntryDirectory}`);   
    }
);