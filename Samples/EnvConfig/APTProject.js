
(
    async () =>
    {
        await APT.AsyncSetupEnvironment(
            APT.Templates.Common.Utilities.GetDefaultEnvironmentName(),
            "Config/Environment"
        );
        console.log(APT.Core.System.CommandManager.CLIInput);
    }
)();