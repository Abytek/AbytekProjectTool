
APT.Extensions.AbytekCMake.F_ProjectComponent = class extends APT.Core.A_ProjectComponent
{
    constructor(Context, IsEngine)
    {
        super(Context);

        this.Set("IsEngine", IsEngine);
    }
}