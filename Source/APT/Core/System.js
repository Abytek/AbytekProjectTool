AMJS.Import("./ProjectManager");
AMJS.Import("./CommandManager");
AMJS.Import("./Environment");

/**
 * Root system class that coordinates all major subsystems.
 * This is the main entry point for APT functionality.
 * 
 * System Hierarchy:
 * - System
 *   - CommandManager: Handles CLI and command execution
 *   - ProjectManager: Manages project instances
 * 
 * @class F_System
 * @memberof APT.Core
 */
AMJS.Namespace.F_System = class
{
    /**
     * Creates a new System instance and initializes subsystems
     */
    constructor()
    {
        /** @type {APT.Core.F_CommandManager} Command manager instance */
        this.CommandManager = new AMJS.Namespace.F_CommandManager(this);
        
        /** @type {APT.Core.F_ProjectManager} Project manager instance */
        this.ProjectManager = new AMJS.Namespace.F_ProjectManager(this);
        
        /** @type {APT.Core.F_Environment} Environment instance */
        this.Environment = new AMJS.Namespace.F_Environment(this);

        this.AutomaticExit = true;
    }

    /**
     * Starts the system by initiating command execution
     */
    Start()
    {
        this.CommandManager.Start();
        if (this.AutomaticExit)
        {
            process.exit(0);
        }
    }
};