
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");


APT.Common.FindWindowsSDKDirectory = function()
{
    if (process.platform != "win32") {
        return null;
    }

    const ProgramFilesX86 = process.env["ProgramFiles(x86)"];
    if (!ProgramFilesX86) {
        return null;
    }

    const WindowsSDKDir = path.join(
        ProgramFilesX86,
        "Windows Kits",
        "10"
    );

    if (!fs.existsSync(WindowsSDKDir)) {
        return null;
    }

    return WindowsSDKDir;
}

APT.Common.FindWindowsSDKUtilitiesDirectory = function(ProcessorArch, ManualVersion = null)
{
    const WindowsSDKDir = APT.Common.FindWindowsSDKDirectory();
    if (!WindowsSDKDir) {
        return null;
    }

    const ProcessorArchMap = {
        [APT.Common.E_ProcessorArch.X86_32]: "x86",
        [APT.Common.E_ProcessorArch.X86_64]: "x64",
        [APT.Common.E_ProcessorArch.ARM_64]: "arm64",
    };
    const ProcessorArchArg = ProcessorArchMap[ProcessorArch];
    if (!ProcessorArchArg) {
        throw new Error(`Unknown processor arch: ${ProcessorArch}`);
    }

    const WindowsSDKBinDir = path.join(
        WindowsSDKDir,
        "bin"
    );
    if (!fs.existsSync(WindowsSDKBinDir)) {
        return null;
    }

    let Versions = [];
    if (ManualVersion)
    {
        Versions = [ ManualVersion ];
    }
    else 
    {
        Versions = fs.readdirSync(WindowsSDKBinDir)
            .filter((Version) => {
                return /^10\.\d+\.\d+\.\d+$/.test(Version);
            })
            .sort((A, B) => {
                const AV = A.split(".").map(Number);
                const BV = B.split(".").map(Number);

                for (let Index = 0; Index < 4; ++Index) {
                    if (AV[Index] != BV[Index]) {
                        return BV[Index] - AV[Index];
                    }
                }

                return 0;
            });
    }
    for (const Version of Versions)
    {
        const UtilitiesDir = path.join(
            WindowsSDKBinDir,
            Version,
            ProcessorArchArg
        );
        if (fs.existsSync(UtilitiesDir)) 
        {
            return UtilitiesDir;
        }
    }
    return null;
}

APT.Common.FindWindowsSDKRCExecutable = function(ProcessorArch, ManualVersion = null)
{
    const UtilitiesDir = APT.Common.FindWindowsSDKUtilitiesDirectory(
        ProcessorArch,
        ManualVersion
    );
    if (!UtilitiesDir) {
        return null;
    }

    const RC = path.join(UtilitiesDir, "rc.exe");
    if (fs.existsSync(RC)) {
        return RC;
    }
    return null;
}

APT.Common.FindWindowsSDKMTExecutable = function(ProcessorArch, ManualVersion = null)
{
    const UtilitiesDir = APT.Common.FindWindowsSDKUtilitiesDirectory(
        ProcessorArch,
        ManualVersion
    );
    if (!UtilitiesDir) {
        return null;
    }

    const MT = path.join(UtilitiesDir, "mt.exe");
    if (fs.existsSync(MT)) {
        return MT;
    }
    return null;
}