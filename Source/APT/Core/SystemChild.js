AMJS.Import("./Logger");

APT.Core.A_SystemChild = class
{
    constructor(System, Name)
    {
        APT.Common.Assert(System, "Invalid system");
        this.System = System;

        APT.Common.Assert(Name, "Invalid name");
        this.Name = Name;
    }

    Init()
    {
    }
    PostInit()
    {
    }
    Start()
    {
    }
}