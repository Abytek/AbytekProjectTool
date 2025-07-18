
AMJS.Import("./Project")

AMJS.Namespace.F_ProjectManager = class
{
    constructor(System)
    {
        this.System = System;
        this.Projects = new Map();
    }

    CalculateProjectKey(AbsoluteProjectEntryFilePath, InstanceData = new Object())
    {
        return { AbsoluteProjectEntryFilePath, InstanceData };
    }
    ImportProject(BaseModule, ProjectEntryFilePath, AdditionalOptions = new Object(), Required = true)
    {
        const InstanceData = AdditionalOptions.InstanceData ?? new Object();

        let AbsoluteProjectEntryFilePath = AMJS.ModuleSystem.SearchModuleAbsoluteFilePath(BaseModule, ProjectEntryFilePath);
        if (!AbsoluteProjectEntryFilePath)
        {
            if (Required)
            {
                throw new Error(`Project entry file ${ProjectEntryFilePath} not found`);
            }
            return false;
        }

        const ProjectKey = this.CalculateProjectKey(AbsoluteProjectEntryFilePath, InstanceData);
        if (this.Projects.has(ProjectKey))
        {
            return this.Projects.get(ProjectKey);
        }

        let Project = new AMJS.Namespace.F_Project(AbsoluteProjectEntryFilePath, AdditionalOptions);

        let ProjectManager = this;

        let ProjectContext = AMJS.ModuleSystem.Import(
            BaseModule,
            ProjectEntryFilePath,
            Required,
            {
                ModifyContext(Context)
                {
                    Context.APT = {
                        ...Context.APT
                    };
                    Project.Context = Context;
                    Context.APT.Project = Project;
                    Context.APT.ImportProject = function(ProjectEntryFilePath2, AdditionalOptions2 = new Object(), Required2 = true)
                    {
                        return ProjectManager.ImportProject(Context.AMJS.Module, ProjectEntryFilePath2, AdditionalOptions2, Required2);
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
        return Project;
    }
}