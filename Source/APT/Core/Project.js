
const path = require("path");

APT.Core.F_Project = class
{
    constructor(EntryDirectory, Data)
    {
        this.EntryDirectory = EntryDirectory;
        this.EntryFile = path.join(EntryDirectory, "APTProject.js");
        this.HasEntryFile = fs.existsSync(this.EntryFile);
        this.Data = Data;

        this.Events = {
            PrepareSignature()
            {
            },
            Init()
            {
            }
        };
    }

    PreImport()
    {
    }
    PostImport()
    {
    }
}