
APT.On(
    "PrepareSignature",
    function()
    {
        APT.TransferSignature("HelloAPT", "WOW");
        APT.Log("HelloAPT", `PrepareSignature: ${APT.Project.EntryDirectory}`);   
    }
);

APT.On(
    "Import",
    function()
    {
        APT.Log("HelloAPT", `Import: ${APT.Project.EntryDirectory}`);   
    }
);