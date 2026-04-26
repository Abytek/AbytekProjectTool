
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Ajv = require("ajv");
const { execSync } = require('child_process');

AMJS.Import("./SystemChild");


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
        APT.Log("APT", `Imported main project`);
    }

    ImportProject(BaseDirectories, RelativeEntryDirectory, Data, Required = true)
    {
        APT.Log("APT", `Import project ${RelativeProjectEntryDirectory}`);

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
        let Project = new AMJS.Namespace.F_Project(AbsoluteProjectEntryDirectory, ParsedAdditionalOptions, SharedAdditionalOptionKeys);

        let ProjectManager = this;

        let PostImportModuleCallback = function()
        {
            Project.Events.PrepareSignature();
        }

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
                            Context.APT.HasPublic = function(Key)
                            {
                                return Project.Data.HasPublic(Key);
                            }
                            Context.APT.AddPublic = function(Key, Value)
                            {
                                return Project.Data.AddPublic(Key, Value);
                            }
                            Context.APT.GetPublic = function(Key)
                            {
                                return Project.Data.GetPublic(Key);
                            }
                            Context.APT.FindPublic = function(Key)
                            {
                                return Project.Data.FindPublic(Key);
                            }
                            Context.APT.GetOrAddPublic = function(Key, DefaultValue)
                            {
                                return Project.Data.GetOrAddPublic(Key, DefaultValue);
                            }

                            Context.APT.HasPrivate(Key)
                            {
                                return Project.Data.HasPrivate(Key);
                            }
                            Context.APT.AddPrivate = function(Key, Value)
                            {
                                return Project.Data.AddPrivate(Key, Value);
                            }
                            Context.APT.GetPrivate = function(Key)
                            {
                                return Project.Data.GetPrivate(Key);
                            }
                            Context.APT.FindPrivate = function(Key)
                            {
                                return Project.Data.FindPrivate(Key);
                            }
                            Context.APT.GetOrAddPrivate = function(Key, DefaultValue)
                            {
                                return Project.Data.GetOrAddPrivate(Key, DefaultValue);
                            }

                            Context.APT.Has = function(Key)
                            {
                                return Project.Data.Has(Key);
                            }
                            Context.APT.Get = function(Key)
                            {
                                return Project.Data.Get(Key);
                            }
                            Context.APT.Find = function(Key)
                            {
                                return Project.Data.Find(Key);
                            }

                            Context.APT.GetSignature = function()
                            {
                                return Project.Data.GetSignature();
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
                            Project.Events[EventName] = Callback;   
                        }
                        PostImportModuleCallback();
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
        else
        {
            PostImportModuleCallback();
        }        
        
        this.Projects.set(ProjectKey, Project);

        Project.PostImport();

        APT.Log("APT", `Imported project at: ${AbsoluteProjectEntryDirectory}`);
        return Project;
    }
}