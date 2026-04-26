
const path = require("path");
const { execSync } = require("child_process");


APT.Common.GetInstalledVSVersions = function() 
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