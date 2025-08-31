/**
 * Base class for all project components.
 * Components provide modular functionality to projects and follow a defined lifecycle.
 * 
 * Lifecycle methods are called in order:
 * 1. Init() - Initial setup
 * 2. PostInit() - Post-initialization configuration
 * 3. Start() - Component startup
 * 
 * @class A_ProjectComponent
 * @memberof APT.Core
 */
AMJS.Namespace.A_ProjectComponent = class
{
    /**
     * Creates a new component instance
     * @param {APT.Core.F_Project} Project - The project this component belongs to
     */
    constructor(Project)
    {
        this.Project = Project;
    }

    /**
     * Initial setup phase
     * Called first in component lifecycle
     */
    Init()
    {
    }

    /**
     * Post-initialization phase
     * Called after all components have completed Init()
     */
    PostInit()
    {
    }

    /**
     * Startup phase
     * Called after all components have completed PostInit()
     */
    GenerateActions(OutActions)
    {
    }

    /**
     * Startup phase
     * Called after all components have completed PostInit()
     */
    Start()
    {
    }
};