
const path = require("path");


APT.Extensions.AbytekCMake.E_Editor = {
    VISUAL_STUDIO_2026: "VisualStudio2026", 
    VISUAL_STUDIO_2022: "VisualStudio2022", 
    ANDROID_STUDIO: "AndroidStudio",   
}
APT.Extensions.AbytekCMake.GetDefaultEditor = function(PlatformTags)
{
    if (PlatformTags == null)
    {
        PlatformTags = APT.Common.GetHostPlatformTags();
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
    {
        let InstalledVSVersions = APT.Common.GetInstalledVSVersions();
        if (InstalledVSVersions.includes("2026"))
        {
            return APT.Extensions.AbytekCMake.E_Editor.VISUAL_STUDIO_2026;
        }
        if (InstalledVSVersions.includes("2022"))
        {
            return APT.Extensions.AbytekCMake.E_Editor.VISUAL_STUDIO_2022;
        }
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.MACOS))
    {
        return APT.Extensions.AbytekCMake.E_Editor.XCODE;
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
    {
        return APT.Extensions.AbytekCMake.E_Editor.ANDROID_STUDIO;
    }
    return null;
}

APT.Extensions.AbytekCMake.GetSignatureDataKeys = function()
{
    return [
        "AbytekCMake.Environment",
        "AbytekCMake.PlatformTags",
        "AbytekCMake.Editor",
    ];
}

APT.Extensions.AbytekCMake.GenerateBuildDirectory = function(EntryDirectory)
{
    return path.join(EntryDirectory, "Build");
}

APT.Extensions.AbytekCMake.GenerateCMakeBuildDirectorySignature = function(
    Environment,
    PlatformTags,
    Generator,
    Config
)
{
    APT.Common.Assert(Environment, "Invalid environment");
    APT.Common.Assert(PlatformTags, "Invalid platform tags");
    APT.Common.Assert(Generator, "Invalid generator");
    APT.Common.Assert(Config, "Invalid config");

    return [Environment, PlatformTags.sort().join("."), Generator, Config].join("-") + ".txt";
}

APT.Extensions.AbytekCMake.GenerateCMakeBuildDirectoryConfig = function(
    EntryDirectory,
    Environment,
    PlatformTags,
    Generator,
    Config
)
{
    APT.Common.Assert(EntryDirectory, "Invalid entry directory");
    APT.Common.Assert(Environment, "Invalid environment");
    APT.Common.Assert(PlatformTags, "Invalid platform tags");
    APT.Common.Assert(Generator, "Invalid generator");
    APT.Common.Assert(Config, "Invalid config");

    const BuildDirectory = APT.Extensions.AbytekCMake.GenerateBuildDirectory(EntryDirectory);
    const Signature = APT.Extensions.AbytekCMake.GenerateCMakeBuildDirectorySignature(
        Environment,
        PlatformTags,
        Generator,
        Config
    );

    function ShortHash(str) 
    {
        let hash = 0x811c9dc5;

        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193);
        }

        // unsigned 32-bit
        hash >>>= 0;

        // base36 + lấy 4 ký tự
        return hash.toString(36).slice(0, 4);
    }
    const SignatureHash = ShortHash(Signature);

    return {
        Path: path.join(BuildDirectory, SignatureHash),
        Signature,
        SignatureHash,
    };
}