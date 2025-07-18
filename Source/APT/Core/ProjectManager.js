
AMJS.Import("./Project")

AMJS.Namespace.F_ProjectManager = class
{
    constructor(System)
    {
        this.System = System;
        this.Projects = new Object();
    }

    ImportProject(BaseModule, ProjectEntryFilePath, AdditionalOptions, Required = true)
    {
        let AbsoluteProjectEntryFilePath = AMJS.ModuleSystem.SearchModuleAbsoluteFilePath(BaseModule, ProjectEntryFilePath);
        if (!AbsoluteProjectEntryFilePath)
        {
            if (Required)
            {
                throw new Error(`Project entry file ${ProjectEntryFilePath} not found`);
            }
            return false;
        }

        let Project = new AMJS.Namespace.F_Project(AbsoluteProjectEntryFilePath, AdditionalOptions);

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
                    Context.APT.Project = Project;
                }
            }
        );

        if (!ProjectContext)
        {
            return false;
        }

        if (Project.Name in this.Projects)
        {
            console.log(`Project ${Project.Name} was already added`);
            if (Required)
            {
                throw new Error(`Project ${Project.Name} was already added`);
            }
            return false;
        }

        this.Projects[Project.Name] = Project;
        return Project;
    }
}