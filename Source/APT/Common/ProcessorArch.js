
const os = require("os");


APT.Common.E_ProcessorArch = 
{
    X86_32: "X86_32",
    X86_64: "X86_64",
    ARM_32: "ARM_32",
    ARM_64: "ARM_64",
    WASM: "WASM"
}

APT.Common.GetHostProcessorArch = function()
{
    const arch = os.arch(); // runtime value

    switch (arch)
    {
        case "x64":
            return APT.Common.E_ProcessorArch.X86_64;

        case "ia32":
        case "x32":
            return APT.Common.E_ProcessorArch.X86_32;

        case "arm":
        case "armv7l":
            return APT.Common.E_ProcessorArch.ARM_32;

        case "arm64":
        case "aarch64":
            return APT.Common.E_ProcessorArch.ARM_64;

        case "wasm32":
            return APT.Common.E_ProcessorArch.WASM;

        default:
            APT.FatalError("APT", `Unknown processor arch: ${arch}`);
            return null;
    }
}