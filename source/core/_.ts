
import { F_APTSystem } from "./system"
import { F_APTScriptExecutor } from "./script_executor"
import { F_APTScriptLoader } from "./script_loader"
import { F_APTProject } from "./project"
import { A_APTProjectComponent } from "./project_component"

export let APTCore = 
{
    F_System: F_APTSystem,
    F_ScriptExecutor: F_APTScriptExecutor,
    F_ScriptLoader: F_APTScriptLoader,
    F_Project: F_APTProject,
    A_ProjectComponent: A_APTProjectComponent
}