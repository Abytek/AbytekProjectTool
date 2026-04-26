
APT.Extensions.AbytekCMake.F_Instance = class
{
    constructor(Context)
    {
        this.Context = Context;
        this.Environment = this.Context.APT.Get("Environment");
    }
}