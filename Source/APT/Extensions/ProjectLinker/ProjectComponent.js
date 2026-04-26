
AMJS.Import("./Common");
AMJS.Import("./Management");


APT.Extensions.ProjectLinker.F_ProjectComponent = class extends APT.Core.A_ProjectComponent
{
    constructor(Context)
    {
        super(Context);

        APT.Extensions.ProjectLinker.LinkDirectory(this.Project.EntryDirectory);
    }
}