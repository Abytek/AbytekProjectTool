
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

AMJS.Import("./Logger");
AMJS.Import("./SystemChild");


APT.Core.F_Console = class extends APT.Core.A_SystemChild
{
    constructor(System)
    {
        super(System, "Console");

        this.Argv = yargs(hideBin(process.argv))
            .scriptName('abytekpt');
    }

    GetStageDefinitions()
    {
        return {
            GatherConsoleCommands: {
            },
            BuildConsoleCommands: {
                Dependencies: [
                    "GatherConsoleCommands"
                ]
            }
        }
    }

    OnStage_GatherConsoleCommands()
    {
    }
    OnStage_BuildConsoleCommands()
    {
        this.Argv = this.Argv
            .parserConfiguration({
                'dot-notation': true,
                'parse-numbers': true,
                'parse-positional-numbers': true
            })
            .strict()
            .demandCommand()
            .help()
            .parse();

        APT.Log("APT", `Built console commands: ${APT.Common.NiceJSONStringify(this.Argv)}`);
    }
}