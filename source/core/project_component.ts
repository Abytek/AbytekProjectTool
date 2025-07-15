
export class A_APTProjectComponent
{
    private _name: string = "";
    public get name()
    {
        return this._name;
    }

    public constructor(in_name: string)
    {
        this._name = in_name;
    }
}