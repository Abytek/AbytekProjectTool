
const path = require("path");
const { execSync } = require("child_process");

APT.Extensions.CMake.E_DirectConfig = {
    DEBUG: "Debug",
    RELEASE: "Release",
    REL_WITH_DEB_INFO: "RelWithDebInfo",
    MIN_SIZE_REL: "MinSizeRel",
};

APT.Extensions.CMake.E_Generator = {
    VISUAL_STUDIO_2026: "VisualStudio2026",
    VISUAL_STUDIO_2022: "VisualStudio2022",
    NINJA: "Ninja",
    UNIX_MAKEFILES: "UnixMakefiles",
};

APT.Extensions.CMake.MakeConfig = function(DirectConfig, IsAuto = false) 
{
    return {
        IsAuto,
        DirectConfig
    };
}
APT.Extensions.CMake.MakeAutoConfig = function()
{
    return APT.Extensions.CMake.MakeConfig(true, null);
}

APT.Extensions.CMake.GetDefaultDirectConfig = function()
{
    return APT.Extensions.CMake.E_DirectConfig.DEBUG;
}
APT.Extensions.CMake.GetDefaultConfigForGenerator = function(Generator)
{
    if (Generator == APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2026)
    {
        return APT.Extensions.CMake.MakeAutoConfig();
    }
    else if (Generator == APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2022)
    {
        return APT.Extensions.CMake.MakeAutoConfig();
    }
    else if (Generator == APT.Extensions.CMake.E_Generator.NINJA)
    {
        return APT.Extensions.CMake.MakeConfig(
            APT.Extensions.CMake.GetDefaultDirectConfig()
        );
    }
    else if (Generator == APT.Extensions.CMake.E_Generator.UNIX_MAKEFILES)
    {
        return APT.Extensions.CMake.MakeConfig(
            APT.Extensions.CMake.GetDefaultDirectConfig()
        );
    }
    APT.FatalError("APT", `Unknown generator: ${Generator}`);
}

APT.Extensions.CMake.GetInstalledVSVersions = function() 
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

APT.Extensions.CMake.GetDefaultGenerator = function(PlatformTags)
{
    if (PlatformTags == null)
    {
        PlatformTags = APT.Common.GetHostPlatformTags();
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.WINDOWS))
    {
        let InstalledVSVersions = APT.Extensions.CMake.GetInstalledVSVersions();
        if (InstalledVSVersions.includes("2026"))
        {
            return APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2026;
        }
        if (InstalledVSVersions.includes("2022"))
        {
            return APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2022;
        }
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.MACOS))
    {
        return APT.Extensions.CMake.E_Generator.XCODE;
    }
    if (PlatformTags.includes(APT.Common.E_PlatformTag.ANDROID))
    {
        return APT.Extensions.CMake.E_Generator.NINJA;
    }
    return APT.Extensions.CMake.E_Generator.UNIX_MAKEFILES;
}
APT.Extensions.CMake.GetDefaultConfig = function()
{
    return APT.Extensions.CMake.GetDefaultConfigForGenerator(
        APT.Extensions.CMake.GetDefaultGenerator()
    );
}

APT.Extensions.CMake.IsConfigCompatibleWithGenerator = function(Config, Generator)
{
    if (Config.IsAuto)
    {
        if (
            (Generator == APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2022)
            || (Generator == APT.Extensions.CMake.E_Generator.VISUAL_STUDIO_2026)
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

APT.Extensions.CMake.ParseConfig = function(Config, Generator, PlatformTags)
{
    if (APT.Extensions.CMake.IsConfigCompatibleWithGenerator(Config, Generator))
    {
        return Config;
    }
    return APT.Extensions.CMake.GetDefaultConfig(PlatformTags);
}