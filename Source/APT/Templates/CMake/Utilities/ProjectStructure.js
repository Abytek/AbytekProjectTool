
const path = require("path");
const { execSync } = require("child_process");

AMJS.Namespace.Configs =
{
    AUTO: "Auto",
    DEBUG: "Debug",
    RELEASE: "Release",
    REL_WITH_DEB_INFO: "RelWithDebInfo",
    MIN_SIZE_REL: "MinSizeRel",

    DEFAULT_DIRECT: "Debug",
}

AMJS.Namespace.GetDefaultDirectConfig = function()
{
    let DefaultSupportDebug = APT.Templates.Common.Utilities.GetDefaultSupportDebug();
    let DefaultSupportOptimization = APT.Templates.Common.Utilities.GetDefaultSupportOptimization();
    let DefaultSupportMinSize = APT.Templates.Common.Utilities.GetDefaultSupportMinSize();

    if (DefaultSupportOptimization || (!DefaultSupportDebug))
    {
        if (DefaultSupportDebug)
        {
            return AMJS.Namespace.Configs.REL_WITH_DEB_INFO;
        }
        else
        {
            if (DefaultSupportMinSize)
            {
                return AMJS.Namespace.Configs.MIN_SIZE_REL;
            }
            else
            {
                return AMJS.Namespace.Configs.RELEASE;
            }
        }
    }
    return AMJS.Namespace.Configs.DEBUG;
}
AMJS.Namespace.GetDefaultConfig = function(Generator)
{
    if (
        (Generator == AMJS.Namespace.Generators.VS2022)
        || (Generator == AMJS.Namespace.Generators.VS2026)
    )
    {
        return AMJS.Namespace.Configs.AUTO;
    }
    if (
        (Generator == AMJS.Namespace.Generators.ANDROID_STUDIO)
    )
    {
        return AMJS.Namespace.Configs.AUTO;
    }
    return AMJS.Namespace.GetDefaultDirectConfig();
}
AMJS.Namespace.EnsureDirectConfig = function(Config)
{
    if (
        (Config == AMJS.Namespace.Configs.AUTO)
    )
    {
        return AMJS.Namespace.GetDefaultDirectConfig();
    }
    return Config;
}

AMJS.Namespace.Generators =
{
    VS2022: "VisualStudio2022",
    VS2026: "VisualStudio2026",
    UNIX_MAKE_FILES: "UnixMakefiles",
    XCODE: "Xcode",
    NINJA: "Ninja",
    ANDROID_STUDIO: "AndroidStudio"
}

AMJS.Namespace.GetInstalledVSVersions = function() 
{
  const vswherePath =
    "C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe";

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

AMJS.Namespace.GetDefaultGenerator = function(PlatformTags)
{
    if (PlatformTags.includes(APT.Common.PlatformTags.WINDOWS))
    {
        let InstalledVSVersions = AMJS.Namespace.GetInstalledVSVersions();
        if (InstalledVSVersions.includes("2026"))
        {
            return AMJS.Namespace.Generators.VS2026;
        }
        if (InstalledVSVersions.includes("2022"))
        {
            return AMJS.Namespace.Generators.VS2022;
        }
    }
    if (PlatformTags.includes(APT.Common.PlatformTags.MACOS))
    {
        return AMJS.Namespace.Generators.XCODE;
    }
    if (PlatformTags.includes(APT.Common.PlatformTags.ANDROID))
    {
        return AMJS.Namespace.Generators.ANDROID_STUDIO;
    }
    return AMJS.Namespace.Generators.UNIX_MAKE_FILES;
}

AMJS.Namespace.IsConfigCompatibleWithGenerator = function(Config, Generator)
{
    if (
        (Config == AMJS.Namespace.Configs.AUTO)
    )
    {
        if (
            (Generator == AMJS.Namespace.Generators.VS2022)
            || (Generator == AMJS.Namespace.Generators.VS2026)
        )
        {
            return true;
        }
        else if (
            (Generator == AMJS.Namespace.Generators.ANDROID_STUDIO)
        )
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    return true;
}

AMJS.Namespace.ParseConfig = function(Config, Generator, PlatformTags)
{
    if (AMJS.Namespace.IsConfigCompatibleWithGenerator(Config, Generator))
    {
        return Config;
    }
    return AMJS.Namespace.GetDefaultConfig(PlatformTags);
}

AMJS.Namespace.CalculateCMakeParentBuildDirectory = function(BuildDirectory, Generator)
{
    return BuildDirectory;
}

AMJS.Namespace.CalculateCMakeBuildDirectory = function(BuildDirectory, Generator, DirectConfig)
{
    return AMJS.Namespace.CalculateCMakeParentBuildDirectory(BuildDirectory, Generator);
}