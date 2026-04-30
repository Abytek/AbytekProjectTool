
const path = require("path");
const fs = require("fs");
const deasync = require('deasync');


/**
 * Gets the data directory path
 * @returns {string} Absolute path to data directory
 */
APT.Common.GetDataDirectory = function()
{
    if (!(APT.Common.GetHostPlatformTags().includes(APT.Common.E_PlatformTag.WINDOWS)))
    {
        return path.normalize(path.join(__dirname, ".APT"));
    }
    return path.normalize(path.join(path.parse(__dirname).root, ".APT"));
}
APT.Common.EnsureDataDirectory = function()
{
    const Path = APT.Common.GetDataDirectory();
    fs.mkdirSync(Path, { recursive: true });
    return Path;
}

APT.Common.GetScopeImportedDirectory = function(EntryDirectory)
{
    const Result = path.join(APT.Common.GetDataDirectory(), "Imported");
    if (EntryDirectory == null)
    {
        return Result;
    }
    return path.join(Result, APT.Common.StringToUUID(path.normalize(EntryDirectory)));
}

/**
 * Gets the logs directory path
 * @returns {string} Absolute path to logs directory
 */
APT.Common.GetLogsDirectory = function()
{
    return path.join(APT.Common.GetDataDirectory(), "Logs");
}

/**
 * Writes content to a file only if it differs from existing content
 * @param {string} File - Target file path
 * @param {string} Content - Content to write
 * @throws {Error} If path exists but is not a file
 */
APT.Common.SmartWriteFile = function(File, Content)
{
    if (!(fs.existsSync(File)))
    {
        fs.writeFileSync(File, Content);
        return;
    }

    let stats = fs.statSync(File);
    if (!(stats.isFile()))
    {
        throw new Error(`The item is actually not a file`);
    }

    let LastContent = fs.readFileSync(File).toString();
    if (Content != LastContent)
    {
        fs.writeFileSync(File, Content);
    }
}

/**
 * Gets the project links directory path
 * @returns {string} Absolute path to project links directory
 */
APT.Common.GetScopeLinksDirectory = function()
{
    return path.join(APT.Common.GetDataDirectory(), "ScopeLinks");
}

APT.Common.TryAcquireFileBasedLock = function(Path) 
{
    try 
    {
        const Directory = path.dirname(Path);
        fs.mkdirSync(Directory, { recursive: true });

        const FileDescriptor = fs.openSync(Path, 'wx');
        return {
            FileDescriptor: FileDescriptor,
            Path
        };
    } 
    catch (err) 
    {
        if (err.code === 'EEXIST') 
        {
            return null; // already locked
        }
        throw err;
    }
}
APT.Common.AcquireFileBasedLock = function(Path) 
{
    while (true)
    {
        let Result = APT.Common.TryAcquireFileBasedLock(Path);
        if (Result)
        {
            return Result;
        }
        deasync.runLoopOnce();
    }
}
APT.Common.ReleaseFileBasedLock = function(Handle) 
{
    fs.closeSync(Handle.FileDescriptor);
    fs.unlinkSync(Handle.Path);
}