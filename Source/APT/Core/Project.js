
const path = require("path");
const fs = require("fs");

APT.Core.F_Project = class
{
    constructor(EntryDirectory, Data)
    {
        this.EntryDirectory = EntryDirectory;
        this.EntryFile = path.join(EntryDirectory, "APTProject.js");
        this.HasEntryFile = fs.existsSync(this.EntryFile);
        this.Data = Data;

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
}