import { F_APTProject } from "../../core/project";
import { APTCMakeJSProjectComponents } from "./project_components";

export function APTCMakeJSProjectPrototype(project: F_APTProject)
{
    let project_structure = new APTCMakeJSProjectComponents.F_ProjectStructure();
    project.add_component(project_structure);
}