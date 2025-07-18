
AMJS.Import("./ProjectManager");
AMJS.Import("./CommandManager");

AMJS.Namespace.F_System = class
{
    constructor()
    {
        this.CommandManager = new AMJS.Namespace.F_CommandManager(this);
        this.ProjectManager = new AMJS.Namespace.F_ProjectManager(this);
    }

    Start()
    {
        this.CommandManager.Start();
    }
};