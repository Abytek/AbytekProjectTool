AMJS.Import("./Logger");
AMJS.Import("./SystemChild");


APT.Core.F_Console = class extends APT.Core.A_SystemChild
{
    constructor(System)
    {
        super(System, "Console");
    }

    GetStageDefinitions()
    {
        return {
            SetupConsole: {
            }
        }
    }
}