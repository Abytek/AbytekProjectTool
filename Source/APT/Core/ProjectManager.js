
AMJS.Import("./Project")

AMJS.Namespace.F_ProjectManager = class
{
    constructor(System)
    {
        this.System = System;
        this.Projects = new Object();
    }

    CalculateProjectKey(AbsoluteProjectEntryFilePath, InstanceData = new Object())
    {
        return { AbsoluteProjectEntryFilePath, InstanceData }.toString();
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
        if (ProjectKey in this.Projects)
        {
            return this.Projects[ProjectKey];
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
                }
            }
        );

        if (!ProjectContext)
        {
            return false;
        }

        this.Projects[ProjectKey] = Project;
        return Project;
    }
}