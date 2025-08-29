const path = require("path");

AMJS.ImportNamespace("../Commands");

/**
 * Manages command-line interface and command execution.
 * Handles parsing of CLI arguments and routing to appropriate command handlers.
 * 
 * CLI Format:
 * apt [MainProjectEntryDirectory] [:Command] [AdditionalArguments...]
 * 
 * Special Input Categories:
 * - ProjectDefault: Default settings for project instances
 * - GlobalDefault: Global system settings
 * 
 * @class F_CommandManager
 * @memberof APT.Core
 */
AMJS.Namespace.F_CommandManager = class
{
    /**
     * Creates a new CommandManager instance
     * @param {APT.Core.F_System} System - Parent system instance
     */
    constructor(System)
    {
        /** @type {APT.Core.F_System} Parent system reference */
        this.System = System;
    
        /** @type {Map<string, Array<string>|Object>} Parsed CLI input */
        this.CLIInput = new Object();

        /** @type {Array<Function>} List of available commands */
        this.Commands = [
            APT.Commands.CleanCache,
            APT.Commands.CleanData,
            APT.Commands.OpenEditor,
            APT.Commands.LogCache,
            APT.Commands.ImportMainProject,
            APT.Commands.BuildGUI,
            APT.Commands.OpenGUI,
            APT.Commands.Help,
        ];

        this.ParseCLIInput();
    }

    /**
     * Starts command execution
     */
    Start()
    {
        this.ExecuteCLI();
    }

    /**
     * Parses command line arguments into structured input.
     * 
     * Handles:
     * - Command arguments with ':' prefix
     * - Default project entry file
     * - Project and global default settings
     * - Nested property paths (e.g. "Category.SubCategory.Setting")
     * 
     * @private
     */
    ParseCLIInput()
    {
        /**
         * Internal helper to parse argv-style arguments
         * @param {string[]} argv - Argument array
         * @param {number} startIndex - Index to start parsing from
         * @param {string} defaultKeyName - Default key for arguments without explicit key
         * @returns {Map<string, string[]>} Parsed arguments
         */
        function ParseArgs(argv, startIndex = 0, defaultKeyName) 
        {
            const parsed = new Map();
            let currentKey = defaultKeyName;

            // Initialize default key bucket
            parsed.set(currentKey, []);

            for (let i = startIndex; i < argv.length; ++i) {
                const token = argv[i];

                if (token.startsWith(':'))
                {
                    // New key begins (drop the ':' prefix)
                    currentKey = token.substring(1);
                    if (!parsed.has(currentKey)) {
                        parsed.set(currentKey, []);
                    }
                } 
                else {
                    // Append to current key's values
                    parsed.get(currentKey).push(token);
                }
            }

            return parsed;
        }

        this.CLIInput = ParseArgs(process.argv, 2, 'MainProjectEntryDirectory');

        // Handle special categories (ProjectDefault, GlobalDefault)
        let Categories = [ 
            'ProjectDefault',
            'GlobalDefault'
        ];
        for(let Category of Categories)
        {
            if (!(this.CLIInput.has(Category)))
            {
                this.CLIInput.set(Category, new Object());
            }

            // Process nested properties (e.g. "Category.SubCategory.Setting")
            let KeysToDelete = [];
            this.CLIInput.forEach(
                (Value, Key, Map) =>
                {
                    let KeyParts = Key.split(".");
                    if (KeyParts[0] == Category)
                    {
                        if (KeyParts.length > 1)
                        {
                            APT.Common.SetPropertyByPath(
                                this.CLIInput.get(Category),
                                KeyParts.slice(1).join('.'),
                                Value
                            );
                            KeysToDelete.push(Key);
                        }      
                    } 
                }
            );
            for(let KeyToDelete of KeysToDelete)
            {
                this.CLIInput.delete(KeyToDelete);
            }
        }

        // Handle main project entry file
        {
            let MainProjectEntryDirectorySlot = this.CLIInput.get('MainProjectEntryDirectory');
            if (MainProjectEntryDirectorySlot.length == 1)
            {
                this.CLIInput.get("GlobalDefault").ProjectEntryDirectory = path.resolve(MainProjectEntryDirectorySlot[0]);
            }
            if (MainProjectEntryDirectorySlot.length > 1)
            {
                throw new Error(`Too much argument for MainProjectEntryDirectory`);
            }
        }

        console.log(`CLI input:`, this.CLIInput);
    }

    /**
     * Executes CLI commands based on parsed input
     * @returns {boolean} true if any command was executed successfully
     */
    ExecuteCLI()
    {
        for(let Command of this.Commands)
        {
            if (Command(this))
            {
                return true;
            }
        }
        return false;
    }
}