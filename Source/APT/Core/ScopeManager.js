
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

    ImportRecursive(ParentScope, BaseDirectories, RelativeEntryDirectory, Data, SignatureData, Required = true, ...ScopeCreationArgs)
    {
        APT.Log("APT", `Import recursive: ${RelativeEntryDirectory}`);

        let AbsoluteScopeEntryDirectory = AMJS.ModuleSystem.SearchAbsoluteDirectory(BaseDirectories, RelativeEntryDirectory);
        if (!AbsoluteScopeEntryDirectory)
        {
            if (Required)
            {
                throw new Error(`Scope entry directory: "${RelativeEntryDirectory}" not found`);
            }
            return;
        }
        APT.Log("APT", `Found scope entry directory: ${AbsoluteScopeEntryDirectory}`);

        const SubDirs = APT.Common.GetSubDirectories(AbsoluteScopeEntryDirectory);
        for (let SubDir of SubDirs)
        {
            let Scope = this.Import(ParentScope, [], SubDir, Data, SignatureData, ...ScopeCreationArgs);
            this.ImportRecursive(
                Scope,
                [ Scope.EntryDirectory ],
                ".",
                null,
                null,
                true,
                ...ScopeCreationArgs
            );
        }

        APT.Log("APT", `Imported recursive: ${RelativeEntryDirectory}`);
    }
    Import(ParentScope, BaseDirectories, RelativeEntryDirectory, Data, SignatureData, Required = true, ...ScopeCreationArgs)
    {
        APT.Log("APT", `Import scope: ${RelativeEntryDirectory}`);
        APT.Log("APT", `\t- Base directories: [${BaseDirectories}]`);

        let ParentData = null;
        let ParentSignatureData = null;
        if (ParentScope)
        {
            ParentData = ParentScope.Data;
            ParentSignatureData = ParentScope.SignatureData;
        }

        if (Data == null)
        {
            Data = new APT.Core.F_ScopeData();
        }
        Data.Inherit(ParentData);
        APT.Log("APT", `\t- Data: [${Data.GetSignature()}]`);

        if (SignatureData == null)
        {
            SignatureData = new APT.Core.F_ScopeData();
        }
        SignatureData.Inherit(ParentSignatureData);
        APT.Log("APT", `\t- Signature data: [${SignatureData.GetSignature()}]`);

        let AbsoluteScopeEntryDirectory = AMJS.ModuleSystem.SearchAbsoluteDirectory(BaseDirectories, RelativeEntryDirectory);
        if (!AbsoluteScopeEntryDirectory)
        {
            if (Required)
            {
                throw new Error(`Scope entry directory: "${RelativeEntryDirectory}" not found`);
            }
            return null;
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
                                return Scope.HasPublic(Key, IsSignature);
                            }
                            Context.APT.AddPublic = function(Key, Value, IsSignature = false)
                            {
                                return Scope.AddPublic(Key, Value, IsSignature);
                            }
                            Context.APT.GetPublic = function(Key, IsSignature = false)
                            {
                                return Scope.GetPublic(Key, IsSignature);
                            }
                            Context.APT.FindPublic = function(Key, IsSignature = false)
                            {
                                return Scope.FindPublic(Key, IsSignature);
                            }
                            Context.APT.GetOrAddPublic = function(Key, DefaultValue, IsSignature = false)
                            {
                                return Scope.GetOrAddPublic(Key, DefaultValue, IsSignature);
                            }
                            Context.APT.SetPublic = function(Key, Value, IsSignature = false)
                            {
                                return Scope.SetPublic(Key, Value, IsSignature);
                            }
                            Context.APT.PushPublic = function(Key, Element, IsSignature = false)
                            {
                                return Scope.PushPublic(Key, Element, IsSignature);
                            }

                            Context.APT.HasPrivate = function(Key, IsSignature = false)
                            {
                                return Scope.HasPrivate(Key, IsSignature);
                            }
                            Context.APT.AddPrivate = function(Key, Value, IsSignature = false)
                            {
                                return Scope.AddPrivate(Key, Value, IsSignature);
                            }
                            Context.APT.GetPrivate = function(Key, IsSignature = false)
                            {
                                return Scope.GetPrivate(Key, IsSignature);
                            }
                            Context.APT.FindPrivate = function(Key, IsSignature = false)
                            {
                                return Scope.FindPrivate(Key, IsSignature);
                            }
                            Context.APT.GetOrAddPrivate = function(Key, DefaultValue, IsSignature = false)
                            {
                                return Scope.GetOrAddPrivate(Key, DefaultValue, IsSignature);
                            }
                            Context.APT.SetPrivate = function(Key, Value, IsSignature = false)
                            {
                                return Scope.SetPrivate(Key, Value, IsSignature);
                            }
                            Context.APT.PushPrivate = function(Key, Element, IsSignature = false)
                            {
                                return Scope.PushPrivate(Key, Element, IsSignature);
                            }

                            Context.APT.Has = function(Key, IsSignature = false)
                            {
                                return Scope.Has(Key, IsSignature);
                            }
                            Context.APT.Get = function(Key, IsSignature = false)
                            {
                                return Scope.Get(Key, IsSignature);
                            }
                            Context.APT.Find = function(Key, IsSignature = false)
                            {
                                return Scope.Find(Key, IsSignature);
                            }
                            Context.APT.GetOrAdd = function(Key, DefaultValue, IsSignature = false)
                            {
                                return Scope.GetOrAdd(Key, DefaultValue, IsSignature);
                            }
                            Context.APT.Set = function(Key, Value, IsSignature = false)
                            {
                                return Scope.Set(Key, Value, IsSignature);
                            }
                            Context.APT.Push = function(Key, Element, IsSignature = false)
                            {
                                return Scope.Push(Key, Element, IsSignature);
                            }

                            Context.APT.GetSignature = function(IsSignature = false)
                            {
                                return Scope.GetSignature(IsSignature);
                            }

                            Context.APT.TransferSignaturePrivate = function(Key, DefaultValue)
                            {
                                return Scope.TransferSignaturePrivate(Key, DefaultValue);
                            }
                            Context.APT.TransferSignaturePublic = function(Key, DefaultValue)
                            {
                                return Scope.TransferSignaturePublic(Key, DefaultValue);
                            }
                            Context.APT.TransferSignature = function(Key, DefaultValue)
                            {
                                return Scope.TransferSignature(Key, DefaultValue);
                            }
                        }
                        Context.APT.ImportRecursive = function(RelativeEntryDirectory2, Data2, SignatureData2, Required2 = true)
                        {
                            Scope.ImportRecursive(RelativeEntryDirectory2, Data2, SignatureData2, Required2);   
                        }
                        Context.APT.Import = function(RelativeEntryDirectory2, Data2, SignatureData2, Required2 = true)
                        {
                            Scope.Import(RelativeEntryDirectory2, Data2, SignatureData2, Required2);   
                        }
                        Context.APT.On = function(EventName, Callback)
                        {
                            Scope.On(EventName, Callback);   
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