
AMJS.Import("./Project")

AMJS.Namespace.F_ProjectManager = class
{
    constructor(System)
    {
        this.System = System;
        this.Projects = new Map();

        this.DefaultInstanceData = this.System.CommandManager.CLIInput.get('ProjectDefault').InstanceData ?? new Object();
    }

    CalculateProjectKey(AbsoluteProjectEntryFile, InstanceData = new Object())
    {
        return { AbsoluteProjectEntryFile, InstanceData };
    }
    ImportProject(BaseModule, ProjectEntryFile, AdditionalOptions = new Object(), Required = true)
    {
        let ParsedAdditionalOptions = { ...AdditionalOptions };

        let InstanceData = APT.Common.SimpleDeepCopy(this.DefaultInstanceData);
        if (AdditionalOptions.InstanceData)
        {
            for(let Key in AdditionalOptions.InstanceData)
            {
                InstanceData[Key] = AdditionalOptions.InstanceData[Key];
            }
        }
        ParsedAdditionalOptions.InstanceData = InstanceData;

        let AbsoluteProjectEntryFile = AMJS.ModuleSystem.SearchModuleAbsoluteFile(BaseModule, ProjectEntryFile);
        if (!AbsoluteProjectEntryFile)
        {
            if (Required)
            {
                throw new Error(`Project entry file ${ProjectEntryFile} not found`);
            }
            return false;
        }

        const ProjectKey = this.CalculateProjectKey(AbsoluteProjectEntryFile, InstanceData);
        if (this.Projects.has(ProjectKey))
        {
            return this.Projects.get(ProjectKey);
        }

        let Project = new AMJS.Namespace.F_Project(AbsoluteProjectEntryFile, ParsedAdditionalOptions);

        let ProjectManager = this;

        let ProjectContext = AMJS.ModuleSystem.Import(
            BaseModule,
            ProjectEntryFile,
            Required,
            {
                ModifyContext(Context)
                {
                    Context.APT = {
                        ...Context.APT
                    };
                    Project.Context = Context;
                    Context.APT.Project = Project;
                    Context.APT.ImportProject = function(ProjectEntryFile2, AdditionalOptions2 = new Object(), Required2 = true)
                    {
                        return ProjectManager.ImportProject(Context.AMJS.Module, ProjectEntryFile2, AdditionalOptions2, Required2);
                    }
                },
                IsAnonymous: true
            }
        );

        if (!ProjectContext)
        {
            return false;
        }

        this.Projects.set(ProjectKey, Project);
        Project.TryFinalize();
        return Project;
    }
}