
AMJS.Import("./ProjectManager");

AMJS.Namespace.F_System = class
{
    constructor()
    {
        this.ProjectManager = new AMJS.Namespace.F_ProjectManager(this);
    }
};