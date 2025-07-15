import { A_APTProjectComponent } from "./project_component";

export class F_APTProject
{
    private _components: A_APTProjectComponent[] = [];
    public get components()
    {
        return this._components;
    }

    public constructor()
    {
    }

    public add_component(component: A_APTProjectComponent)
    {
        this._components.push(component);
    }
    public remove_component(component: A_APTProjectComponent)
    {
        for(let i = 0; i < this._components.length; ++i)
        {
            if (this._components[i] === component)
            {
                this._components.splice(i, 1);
                break;
            }
        }
    }

    public start()
    {
    }
}