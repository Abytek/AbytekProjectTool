
APT.On(
    "PrepareSignature",
    function()
    {
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