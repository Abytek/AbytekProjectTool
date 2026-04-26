
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Ajv = require("ajv");
const { execSync } = require('child_process');

AMJS.Import("./SystemChild");
AMJS.Import("./Project");
AMJS.Import("./ProjectData");


APT.Core.F_ProjectManager = class extends APT.Core.A_SystemChild
{
    constructor(System)
    {
        super(System, "ProjectManager");
        this.Projects = new Map();
        
        this.Command_ImportMainProject = {
            Enabled: false,
            MainProjectEntryDirectory: null
        };
    }

    GetStageDefinitions()
    {
        return {
            ImportMainProject: {
                Dependencies: [
                    "GatherConsoleCommands",
                    "BuildConsoleCommands"
                ]
            }
        }
    }

    OnStage_GatherConsoleCommands()
    {
        let ProjectManager = this;

        let Console = this.System.GetChild("Console");
        Console.Argv = Console.Argv
            .command(
                '$0 <MainProjectEntryDirectory>',
                'run tool',
                (y) =>
                    y
                    // positional
                    .positional('MainProjectEntryDirectory', {
                        type: 'string',
                        describe: 'path to the main project'
                    })

                    // .option('define', {
                    //     type: 'object', // 👈 quan trọng
                    //     describe: 'defines: --define.KEY value'
                    // })
                    ,

                (Argv) => {
                    let Command_ImportMainProject = ProjectManager.Command_ImportMainProject;
                    Command_ImportMainProject.Enabled = true;
                    Command_ImportMainProject.MainProjectEntryDirectory = Argv.MainProjectEntryDirectory;
                }
            );
    }
    OnStage_ImportMainProject()
    {
        if (!this.Command_ImportMainProject.Enabled)
        {
            return;
        }
        APT.Log("APT", `Start importing main project: ${this.Command_ImportMainProject.MainProjectEntryDirectory}`);
        this.MainProject = this.ImportProject(
            [
                process.cwd()
            ],
            this.Command_ImportMainProject.MainProjectEntryDirectory
        );
        APT.Log("APT", `Imported main project`);
    }

    ImportProject(BaseDirectories, RelativeEntryDirectory, Data, Required = true)
    {
        APT.Log("APT", `Import project: ${RelativeEntryDirectory}`);
        APT.Log("APT", `\t- Base directories: [${BaseDirectories}]`);

        if (Data == null)
        {
            Data = new APT.Core.F_ProjectData();
        }

        let AbsoluteProjectEntryDirectory = AMJS.ModuleSystem.SearchAbsoluteDirectory(BaseDirectories, RelativeEntryDirectory);
        if (!AbsoluteProjectEntryDirectory)
        {
            if (Required)
            {
                throw new Error(`Project entry directory "${RelativeEntryDirectory}" not found`);
            }
            return false;
        }

        APT.Log("APT", `Found project entry directory ${AbsoluteProjectEntryDirectory}`);

        let DataSignature = Data.GetSignature();
        if (this.Projects.has(DataSignature))
        {
            APT.Log("APT", `Found imported project ${AbsoluteProjectEntryDirectory}`);
            return this.Projects.get(DataSignature);
        }

        APT.Log("APT", `Project was not imported => Import ${AbsoluteProjectEntryDirectory}`);

        // Create new project instance
        let Project = new AMJS.Namespace.F_Project(AbsoluteProjectEntryDirectory, Data);

        let ProjectManager = this;

        if (Project.HasEntryFile)
        {
            // Import project module and set up context
            let ProjectContext = AMJS.ModuleSystem.Import(
                BaseDirectories,
                Project.EntryFile,
                Required,
                {
                    ModifyContext(Context)
                    {
                        Context.APT = {
                            ...Context.APT
                        };
                        Project.Context = Context;
                        Context.APT.Project = Project;
                        {
                            Context.APT.HasPublic = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.HasPublic(Key);
                                }
                                else
                                {
                                    return Project.Data.HasPublic(Key);
                                }
                            }
                            Context.APT.AddPublic = function(Key, Value, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.AddPublic(Key, Value);
                                }
                                else
                                {
                                    return Project.Data.AddPublic(Key, Value);
                                }
                            }
                            Context.APT.GetPublic = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.GetPublic(Key);
                                }
                                else
                                {
                                    return Project.Data.GetPublic(Key);
                                }
                            }
                            Context.APT.FindPublic = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.FindPublic(Key);
                                }
                                else
                                {
                                    return Project.Data.FindPublic(Key);
                                }
                            }
                            Context.APT.GetOrAddPublic = function(Key, DefaultValue, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.GetOrAddPublic(Key, DefaultValue);
                                }
                                else
                                {
                                    return Project.Data.GetOrAddPublic(Key, DefaultValue);
                                }
                            }

                            Context.APT.HasPrivate = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.HasPrivate(Key);
                                }
                                else
                                {
                                    return Project.Data.HasPrivate(Key);
                                }
                            }
                            Context.APT.AddPrivate = function(Key, Value, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.AddPrivate(Key, Value);
                                }
                                else
                                {
                                    return Project.Data.AddPrivate(Key, Value);
                                }
                            }
                            Context.APT.GetPrivate = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.GetPrivate(Key);
                                }
                                else
                                {
                                    return Project.Data.GetPrivate(Key);
                                }
                            }
                            Context.APT.FindPrivate = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.FindPrivate(Key);
                                }
                                else
                                {
                                    return Project.Data.FindPrivate(Key);
                                }
                            }
                            Context.APT.GetOrAddPrivate = function(Key, DefaultValue, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.GetOrAddPrivate(Key, DefaultValue);
                                }
                                else
                                {
                                    return Project.Data.GetOrAddPrivate(Key, DefaultValue);
                                }
                            }

                            Context.APT.Has = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.Has(Key);
                                }
                                else
                                {
                                    return Project.Data.Has(Key);
                                }
                            }
                            Context.APT.Get = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.Get(Key);
                                }
                                else
                                {
                                    return Project.Data.Get(Key);
                                }
                            }
                            Context.APT.Find = function(Key, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.Find(Key);
                                }
                                else
                                {
                                    return Project.Data.Find(Key);
                                }
                            }
                            Context.APT.GetOrAdd = function(Key, DefaultValue, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.GetOrAdd(Key, DefaultValue);
                                }
                                else
                                {
                                    return Project.Data.GetOrAdd(Key, DefaultValue);
                                }
                            }
                            Context.APT.Set = function(Key, Value, IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.Set(Key, Value);
                                }
                                else
                                {
                                    return Project.Data.Set(Key, Value);
                                }
                            }

                            Context.APT.GetSignature = function(IsSignature = false)
                            {
                                if (IsSignature)
                                {
                                    return Project.SignatureData.GetSignature();
                                }
                                else
                                {
                                    return Project.Data.GetSignature();
                                }
                            }

                            Context.APT.TransferSignature = function(Key, DefaultValue)
                            {
                                let Value = Project.Data.GetOrAdd(Key, DefaultValue);
                                Project.SignatureData.Set(Key, Value);
                                return Value;
                            }
                        }
                        Context.APT.ImportProject = function(RelativeEntryDirectory2, Data2, Required2 = true)
                        {
                            if (Data2 == null)
                            {
                                Data2 = new APT.Core.F_ProjectData(Project.Data);
                            }
                            return ProjectManager.ImportProject([ AbsoluteProjectEntryDirectory ], RelativeEntryDirectory2, Data2, Required2);
                        }
                        Context.APT.On = function(EventName, Callback)
                        {
                            APT.Common.Assert(EventName in Project.Events, `Not found event: ${EventName}`);
                            Project.Events[EventName].push(Callback);   
                        }
                    },
                    IsAnonymous: true
                }
            );

            if (!ProjectContext)
            {
                this.Projects.delete(ProjectKey);
                return false;
            }
        }     
        
        Project.ExecuteEvent("PrepareSignature");
        let Signature = Project.SignatureData.GetSignature(Project.EntryDirectory);
        APT.Log("APT", `Project signature: ${Signature}`);
        if (this.Projects.has(Signature))
        {
            APT.Log("APT", `Found project, already imported: ${Signature}`);
            return this.Projects.get(Signature);
        }
        this.Projects.set(Signature, Project);

        Project.PreImport();
        Project.ExecuteEvent("Import");
        Project.PostImport();

        APT.Log("APT", `Imported project at: ${AbsoluteProjectEntryDirectory}`);
        return Project;
    }
}