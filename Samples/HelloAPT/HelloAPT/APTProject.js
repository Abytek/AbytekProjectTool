
APT.On(
    "PrepareSignature",
    function()
    {
        APT.Set("HelloAPT", true, true);
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