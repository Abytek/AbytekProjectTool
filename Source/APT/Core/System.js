
AMJS.Import("./ProjectManager");
AMJS.Import("./CommandManager");

AMJS.Namespace.F_System = class
{
    constructor()
    {
        this.ProjectManager = new AMJS.Namespace.F_ProjectManager(this);
        this.CommandManager = new AMJS.Namespace.F_CommandManager(this);
    }

    Start()
    {
        this.CommandManager.Start();
    }
};