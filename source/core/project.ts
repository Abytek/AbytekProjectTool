import { A_APTProjectComponent } from "./project_component";

export class F_APTProject
{
    private _components: Map<string, A_APTProjectComponent> = new Map;
    public get components()
    {
        return this._components;
    }

    public constructor()
    {
    }

    public add_component(component: A_APTProjectComponent)
    {
        this._components.set(component.name, component);
    }
    public remove_component(name: string)
    {
        this._components.delete(name);
    }

    public start()
    {
    }
}