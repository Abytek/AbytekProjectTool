
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Ajv = require("ajv");
const { execSync } = require('child_process');

AMJS.Import("./SystemChild");
AMJS.Import("./Scope");
AMJS.Import("./ScopeData");


APT.Core.F_ScopeManager = class extends APT.Core.A_SystemChild
{
    constructor(System)
    {
        super(System, "ScopeManager");
        this.Scopes = new Map();
        
        this.Command_ImportMainScope = {
            Enabled: false,
            MainScopeEntryDirectory: null
        };
    }

    GetStageDefinitions()
    {
        return {
            ImportMainScope: {
                Dependencies: [
                    "GatherConsoleCommands",
                    "BuildConsoleCommands"
                ]
            }
        }
    }

    OnStage_GatherConsoleCommands()
    {
        let ScopeManager = this;

        let Console = this.System.GetChild("Console");
        Console.Argv = Console.Argv
            .command(
                '$0 <MainScopeEntryDirectory>',
                'run tool',
                (y) =>
                    y
                    // positional
                    .positional('MainScopeEntryDirectory', {
                        type: 'string',
                        describe: 'path to the main scope'
                    })

                    .option('MainScopeDefines', {
                        type: 'object',
                        describe: 'MainScopeDefines: --MainScopeDefines.KEY VALUE'
                    })
                    .option('Defines', {
                        type: 'object',
                        describe: 'Defines: --Defines.KEY VALUE'
                    }),

                (Argv) => {
                    let Command_ImportMainScope = ScopeManager.Command_ImportMainScope;
                    Command_ImportMainScope.Enabled = true;
                    Command_ImportMainScope.MainScopeEntryDirectory = Argv.MainScopeEntryDirectory;

                    let DefinesToData = function(Defines)
                    {
                        let Result = new APT.Core.F_ScopeData();
                        if (Defines == null)
                        {
                            return Result;
                        }
                        for (let Key in Defines)
                        {
                            APT.Common.Assert(
                                (Key == "Public")
                                || (Key == "Private"),
                                `Invalid define scope: ${Key}, requires either Public or Private`
                            );
                        }
                        if ("Public" in Defines)
                        {
                            let Public = Defines.Public;
                            if (Public != null)
                            {
                                for (let Key in Public)
                                {
                                    let Value = Public[Key];

                                    let IsArray = false;
                                    let IsAlreadyArray = false;
                                    if (Key.length > 2)
                                    {
                                        IsArray = (Key.slice(Key.length - 2, Key.length) == "[]");
                                        IsAlreadyArray = Array.isArray(Value);
                                    }

                                    let ParsedKey = Key.replaceAll("/", ".");
                                    if (IsArray)
                                    {
                                        ParsedKey = ParsedKey.slice(0, ParsedKey.length - 2);
                                    }

                                    if (IsArray && !IsAlreadyArray)
                                    {
                                        Result.PushPublic(ParsedKey, Value);
                                    }
                                    else
                                    {
                                        Result.SetPublic(ParsedKey, Value);
                                    }
                                }
                            }
                        }
                        if ("Private" in Defines)
                        {
                            let Private = Defines.Private;
                            if (Private != null)
                            {
                                for (let Key in Private)
                                {
                                    let Value = Private[Key];

                                    let IsArray = false;
                                    let IsAlreadyArray = false;
                                    if (Key.length > 2)
                                    {
                                        IsArray = (Key.slice(Key.length - 2, Key.length) == "[]");
                                        IsAlreadyArray = Array.isArray(Value);
                                    }
                                    
                                    let ParsedKey = Key.replaceAll("/", ".");
                                    if (IsArray)
                                    {
                                        ParsedKey = ParsedKey.slice(0, ParsedKey.length - 2);
                                    }

                                    if (IsArray && !IsAlreadyArray)
                                    {
                                        Result.PushPrivate(ParsedKey, Value);
                                    }
                                    else
                                    {
                                        Result.SetPrivate(ParsedKey, Value);
                                    }
                                }
                            }
                        }
                        return Result;
                    }

                    ScopeManager.MainScopeDefines = DefinesToData(Argv.MainScopeDefines);
                    ScopeManager.Defines = DefinesToData(Argv.Defines);
                }
            );
    }
    OnStage_ImportMainScope()
    {
        if (!this.Command_ImportMainScope.Enabled)
        {
            return;
        }
        APT.Log("APT", `Start importing main scope: ${this.Command_ImportMainScope.MainScopeEntryDirectory}`);
        APT.Log("APT", `Main scope defines: ${this.MainScopeDefines.GetSignature()}`);
        APT.Log("APT", `Defines: ${this.Defines.GetSignature()}`);
        this.MainScope = this.Import(
            null,
            [
                process.cwd()
            ],
            this.Command_ImportMainScope.MainScopeEntryDirectory,
            this.MainScopeDefines,
            null,
            true,
            true
        );
        APT.Log("APT", `Imported main scope`);
    }

    // ImportRecursive(ParentScope, BaseDirectories, RelativeEntryDirectory, Data, Required = true, ...ScopeCreationArgs)
    // {
    //     APT.Log("APT", `Import recursive: ${RelativeEntryDirectory}`);

    //     let AbsoluteScopeEntryDirectory = AMJS.ModuleSystem.SearchAbsoluteDirectory(BaseDirectories, RelativeEntryDirectory);
    //     if (!AbsoluteScopeEntryDirectory)
    //     {
    //         if (Required)
    //         {
    //             throw new Error(`Scope entry directory: "${RelativeEntryDirectory}" not found`);
    //         }
    //         return false;
    //     }
    //     APT.Log("APT", `Found scope entry directory: ${AbsoluteScopeEntryDirectory}`);

    //     function GetSubDirs(dir) {
    //         return fs.readdirSync(dir)
    //             .map(name => path.join(dir, name))
    //             .filter(p => fs.statSync(p).isDirectory());
    //     }
    //     const SubDirs = GetSubDirs(AbsoluteScopeEntryDirectory);
    //     for (let SubDir of SubDirs)
    //     {
    //         let Scope = this.Import(ParentScope, [], SubDir, Data, );
    //     }

    //     APT.Log("APT", `Imported recursive: ${RelativeEntryDirectory}`);
    // }
    Import(ParentScope, BaseDirectories, RelativeEntryDirectory, Data, SignatureData, Required = true, ...ScopeCreationArgs)
    {
        APT.Log("APT", `Import scope: ${RelativeEntryDirectory}`);
        APT.Log("APT", `\t- Base directories: [${BaseDirectories}]`);

        if (Data == null)
        {
            Data = new APT.Core.F_ScopeData();
        }
        APT.Log("APT", `\t- Data: [${Data.GetSignature()}]`);

        if (SignatureData == null)
        {
            SignatureData = new APT.Core.F_ScopeData();
        }
        APT.Log("APT", `\t- Signature data: [${SignatureData.GetSignature()}]`);

        let AbsoluteScopeEntryDirectory = AMJS.ModuleSystem.SearchAbsoluteDirectory(BaseDirectories, RelativeEntryDirectory);
        if (!AbsoluteScopeEntryDirectory)
        {
            if (Required)
            {
                throw new Error(`Scope entry directory: "${RelativeEntryDirectory}" not found`);
            }
            return false;
        }

        APT.Log("APT", `Found scope entry directory: ${AbsoluteScopeEntryDirectory}`);

        // Create new scope instance
        let Scope = new AMJS.Namespace.F_Scope(ParentScope, AbsoluteScopeEntryDirectory, Data, SignatureData, ...ScopeCreationArgs);

        let ScopeManager = this;

        if (Scope.HasEntryFile)
        {
            // Import scope module and set up context
            let ScopeContext = AMJS.ModuleSystem.Import(
                BaseDirectories,
                Scope.EntryFile,
                Required,
                {
                    ModifyContext(Context)
                    {
                        Context.APT = {
                            ...Context.APT
                        };
                        Scope.Context = Context;
                        Context.APT.Scope = Scope;
                        Scope.Context = Context;
                        {
                            Context.APT.HasPublic = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.HasPublic(Key);
                                }
                                else
                                {
                                    return Scope.Data.HasPublic(Key);
                                }
                            }
                            Context.APT.AddPublic = function(Key, Value, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.AddPublic(Key, Value);
                                }
                                else
                                {
                                    return Scope.Data.AddPublic(Key, Value);
                                }
                            }
                            Context.APT.GetPublic = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.GetPublic(Key);
                                }
                                else
                                {
                                    return Scope.Data.GetPublic(Key);
                                }
                            }
                            Context.APT.FindPublic = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.FindPublic(Key);
                                }
                                else
                                {
                                    return Scope.Data.FindPublic(Key);
                                }
                            }
                            Context.APT.GetOrAddPublic = function(Key, DefaultValue, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.GetOrAddPublic(Key, DefaultValue);
                                }
                                else
                                {
                                    return Scope.Data.GetOrAddPublic(Key, DefaultValue);
                                }
                            }
                            Context.APT.SetPublic = function(Key, Value, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.SetPublic(Key, Value);
                                }
                                else
                                {
                                    return Scope.Data.SetPublic(Key, Value);
                                }
                            }
                            Context.APT.PushPublic = function(Key, Element, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.PushPublic(Key, Element);
                                }
                                else
                                {
                                    return Scope.Data.PushPublic(Key, Element);
                                }
                            }

                            Context.APT.HasPrivate = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.HasPrivate(Key);
                                }
                                else
                                {
                                    return Scope.Data.HasPrivate(Key);
                                }
                            }
                            Context.APT.AddPrivate = function(Key, Value, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.AddPrivate(Key, Value);
                                }
                                else
                                {
                                    return Scope.Data.AddPrivate(Key, Value);
                                }
                            }
                            Context.APT.GetPrivate = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.GetPrivate(Key);
                                }
                                else
                                {
                                    return Scope.Data.GetPrivate(Key);
                                }
                            }
                            Context.APT.FindPrivate = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.FindPrivate(Key);
                                }
                                else
                                {
                                    return Scope.Data.FindPrivate(Key);
                                }
                            }
                            Context.APT.GetOrAddPrivate = function(Key, DefaultValue, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.GetOrAddPrivate(Key, DefaultValue);
                                }
                                else
                                {
                                    return Scope.Data.GetOrAddPrivate(Key, DefaultValue);
                                }
                            }
                            Context.APT.SetPrivate = function(Key, Value, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.SetPrivate(Key, Value);
                                }
                                else
                                {
                                    return Scope.Data.SetPrivate(Key, Value);
                                }
                            }
                            Context.APT.PushPrivate = function(Key, Element, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.PushPrivate(Key, Element);
                                }
                                else
                                {
                                    return Scope.Data.PushPrivate(Key, Element);
                                }
                            }

                            Context.APT.Has = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.Has(Key);
                                }
                                else
                                {
                                    return Scope.Data.Has(Key);
                                }
                            }
                            Context.APT.Get = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.Get(Key);
                                }
                                else
                                {
                                    return Scope.Data.Get(Key);
                                }
                            }
                            Context.APT.Find = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.Find(Key);
                                }
                                else
                                {
                                    return Scope.Data.Find(Key);
                                }
                            }
                            Context.APT.GetOrAdd = function(Key, DefaultValue, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.GetOrAdd(Key, DefaultValue);
                                }
                                else
                                {
                                    return Scope.Data.GetOrAdd(Key, DefaultValue);
                                }
                            }
                            Context.APT.Set = function(Key, Value, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.Set(Key, Value);
                                }
                                else
                                {
                                    return Scope.Data.Set(Key, Value);
                                }
                            }
                            Context.APT.Push = function(Key, Element, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.Push(Key, Element);
                                }
                                else
                                {
                                    return Scope.Data.Push(Key, Element);
                                }
                            }

                            Context.APT.GetSignature = function(IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Scope.SignatureData.GetSignature();
                                }
                                else
                                {
                                    return Scope.Data.GetSignature();
                                }
                            }

                            Context.APT.TransferSignaturePrivate = function(Key, DefaultValue)
                            {
                                let Value = Scope.Data.GetOrAddPrivate(Key, DefaultValue);
                                Scope.SignatureData.SetPrivate(Key, Value);
                                return Value;
                            }
                            Context.APT.TransferSignaturePublic = function(Key, DefaultValue)
                            {
                                let Value = Scope.Data.GetOrAddPublic(Key, DefaultValue);
                                Scope.SignatureData.SetPublic(Key, Value);
                                return Value;
                            }
                            Context.APT.TransferSignature = function(Key, DefaultValue)
                            {
                                return Context.APT.TransferSignaturePublic(Key, DefaultValue);
                            }
                        }
                        Context.APT.Import = function(RelativeEntryDirectory2, Data2, SignatureData2, Required2 = true)
                        {
                            if (Data2 == null)
                            {
                                Data2 = new APT.Core.F_ScopeData(Scope.Data);
                            }
                            if (SignatureData2 == null)
                            {
                                SignatureData2 = new APT.Core.F_ScopeData(Scope.SignatureData);
                            }
                            return ScopeManager.Import(Scope, [ AbsoluteScopeEntryDirectory ], RelativeEntryDirectory2, Data2, SignatureData2, Required2);
                        }
                        Context.APT.On = function(EventName, Callback)
                        {
                            APT.Common.Assert(EventName in Scope.Events, `Not found event: ${EventName}`);
                            Scope.Events[EventName].push(Callback);   
                        }
                    },
                    IsAnonymous: true
                }
            );

            if (!ScopeContext)
            {
                this.Scopes.delete(ScopeKey);
                return false;
            }
        }     
        
        Scope.ExecuteEvent("PrepareSignature");
        let Signature = Scope.GetSignature();
        APT.Log("APT", `Scope signature: ${Signature}`);
        if (this.Scopes.has(Signature))
        {
            APT.Log("APT", `Found scope, already imported: ${Signature}`);
            return this.Scopes.get(Signature);
        }
        this.Scopes.set(Signature, Scope);

        APT.Log("APT", `Scope was not imported => Import: ${AbsoluteScopeEntryDirectory}`);

        Scope.PreImport();
        Scope.ExecuteEvent("Import");
        Scope.PostImport();

        APT.Log("APT", `Imported scope at: ${AbsoluteScopeEntryDirectory}`);
        return Scope;
    }
}