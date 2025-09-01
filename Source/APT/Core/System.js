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
        /** @type {APT.Core.F_Logger} Logger instance */
        this.Logger = new AMJS.Namespace.F_Logger(this);

        /** @type {APT.Core.F_CommandManager} Command manager instance */
        this.CommandManager = new AMJS.Namespace.F_CommandManager(this);

        // Apply LoggerDefault
        if (this.CommandManager.CLIInput.has('GlobalDefault'))
        {
            const GlobalDefault = this.CommandManager.CLIInput.get('GlobalDefault');
            if ("Logger" in GlobalDefault)
            {
                const LoggerDefault = GlobalDefault.Logger;
                if (LoggerDefault.HiddenCategories)
                {
                    if (Array.isArray(LoggerDefault.HiddenCategories))
                    {
                        for(const Category of LoggerDefault.HiddenCategories)
                        {
                            this.Logger.HideCategory(Category);
                        }
                    }
                }
                if (LoggerDefault.HiddenTypes)
                {
                    if (Array.isArray(LoggerDefault.HiddenTypes))
                    {
                        for(const Type of LoggerDefault.HiddenTypes)
                        {
                            this.Logger.HideType(Type);
                        }
                    }
                }
            }
        }
        
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