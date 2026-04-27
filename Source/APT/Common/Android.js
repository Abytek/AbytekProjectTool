
const os = require("os");
const path = require("path");


APT.Common.GetDefaultAndroidSdkPath = function() 
{
    const home = os.homedir();

    switch (process.platform) {
        case "win32":
            return path.join(home, "AppData", "Local", "Android", "Sdk");
        case "darwin":
            return path.join(home, "Library", "Android", "sdk");
        default:
            return path.join(home, "Android", "Sdk");
    }
}