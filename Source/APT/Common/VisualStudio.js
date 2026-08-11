
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");


APT.Common.GetInstalledVSVersions = function() 
{
    const vswherePath = "C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe";

    try {
        const output = execSync(
                `"${vswherePath}" -products * -property installationPath`,
            { encoding: "utf8" }
        );

        const paths = output
            .split("\n")
            .map(v => v.trim())
            .filter(Boolean);

        const versions = [];

        for (const p of paths) {
            if (p.includes("\\2017\\")) versions.push("2017");
            else if (p.includes("\\2019\\")) versions.push("2019");
            else if (p.includes("\\2022\\")) versions.push("2022");
            else if (p.includes("\\18\\")) versions.push("2026");
        }

        return [...new Set(versions)];
    } catch (e) {
        return [];
    }
}

APT.Common.FindMSVCToolchainDir = function()
{
    if (process.platform !== "win32") {
        return null;
    }

    const vswherePath = "C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe";

    let VisualStudioDir;
    try {
        VisualStudioDir = execSync(
            `"${vswherePath}" -products * -property installationPath`,
            { encoding: "utf8" }
        ).trim();
    }
    catch (Error) {
        return null;
    }
    if (!VisualStudioDir) {
        return null;
    }

    const MSVCBaseDir = path.join(
        VisualStudioDir,
        "VC",
        "Tools",
        "MSVC"
    );
    if (!fs.existsSync(MSVCBaseDir)) {
        return null;
    }

    const Versions = fs.readdirSync(MSVCBaseDir)
        .filter((Version) => {
            const VersionDir = path.join(MSVCBaseDir, Version);

            try {
                return fs.statSync(VersionDir).isDirectory();
            }
            catch (Error) {
                return false;
            }
        })
        .sort((A, B) => {
            const ParseVersion = (Version) =>
                Version.split(".").map((Value) => Number(Value) || 0);

            const AV = ParseVersion(A);
            const BV = ParseVersion(B);

            for (let Index = 0; Index < Math.max(AV.length, BV.length); ++Index) {
                const AValue = AV[Index] ?? 0;
                const BValue = BV[Index] ?? 0;

                if (AValue !== BValue) {
                    return BValue - AValue;
                }
            }

            return 0;
        });

    if (Versions.length === 0) {
        return null;
    }

    return path.join(MSVCBaseDir, Versions[0]);
};

APT.Common.FindMSVCCompilerExecutable = function(ProcessorArch)
{
    const MSVCToolchainDir = APT.Common.FindMSVCToolchainDir();
    if (!MSVCToolchainDir)
    {
        return null;
    }
    
    const ProcessorArchMap = {
        [APT.Common.E_ProcessorArch.X86_32]: "x86",
        [APT.Common.E_ProcessorArch.X86_64]: "x64",
        [APT.Common.E_ProcessorArch.ARM_64]: "arm64",
    };
    const ProcessorArchArg = ProcessorArchMap[ProcessorArch];
    if (!ProcessorArchArg) {
        return null;
    }

    const MSVCBinDir = path.join(
        MSVCToolchainDir,
        "bin",
        "Hostx64",
        ProcessorArchArg
    );
    const Result = path.join(MSVCBinDir, "cl.exe");
    if (!fs.existsSync(Result))
    {
        return null;
    }
    return Result;
}

APT.Common.GetMSVCEnvironment = function(ProcessorArch)
{
    if (process.platform !== "win32") {
        return null;
    }

    const vswherePath =
        "C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe";

    let VisualStudioDir;

    try {
        VisualStudioDir = execSync(
            `"${vswherePath}" -latest -products * -property installationPath`,
            {
                encoding: "utf8"
            }
        ).trim();
    }
    catch (Error) {
        return null;
    }

    if (!VisualStudioDir) {
        return null;
    }

    const VCVarsAllPath = path.join(
        VisualStudioDir,
        "VC",
        "Auxiliary",
        "Build",
        "vcvarsall.bat"
    );

    if (!fs.existsSync(VCVarsAllPath)) {
        return null;
    }

    const ProcessorArchMap = {
        [APT.Common.E_ProcessorArch.X86_32]: "amd64_x86",
        [APT.Common.E_ProcessorArch.X86_64]: "amd64",
        [APT.Common.E_ProcessorArch.ARM_64]: "amd64_arm64",
    };

    const ProcessorArchArg = ProcessorArchMap[ProcessorArch];

    if (!ProcessorArchArg) {
        return null;
    }

    try {
        const Output = execSync(
            `cmd.exe /S /C ""${VCVarsAllPath}" ${ProcessorArchArg} && set"`,
            {
                encoding: "utf8",
                windowsHide: true
            }
        );

        const Environment = {};

        for (const Line of Output.split(/\r?\n/))
        {
            const SeparatorIndex = Line.indexOf("=");

            if (SeparatorIndex <= 0) {
                continue;
            }

            const Name = Line.substring(0, SeparatorIndex);
            const Value = Line.substring(SeparatorIndex + 1);

            Environment[Name] = Value;
        }

        return Environment;
    }
    catch (Error) {
        return null;
    }
};