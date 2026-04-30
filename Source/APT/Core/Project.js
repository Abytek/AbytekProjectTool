
const path = require("path");
const fs = require("fs");

AMJS.Import("./Logger");
AMJS.Import("./ProjectData");

APT.Core.F_Project = class
{
    constructor(EntryDirectory, Data, IsMain = false)
    {
        this.EntryDirectory = EntryDirectory;
        this.EntryFile = path.join(EntryDirectory, "APT.js");
        this.HasEntryFile = fs.existsSync(this.EntryFile);
        this.Data = Data;
        this.SignatureData = new APT.Core.F_ProjectData();
        this.IsMain = IsMain;

        this.Events = {
            PrepareSignature: [],
            Import: []
        };
    }

    PreImport()
    {
    }
    PostImport()
    {
    }

    ExecuteEvent(EventName, ...Args)
    {
        APT.Common.Assert(EventName in this.Events, `Not found event: ${EventName}`);
        let Event = this.Events[EventName];
        for (let Listener of Event)
        {
            Listener(...Args);
        }
    }

    GetSignature()
    {
        return this.SignatureData.GetSignature(this.EntryDirectory);
    }
}