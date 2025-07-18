
AMJS.ImportNamespace("../Commands");

AMJS.Namespace.F_CommandManager = class
{
    constructor(System)
    {
        this.System = System;
    
        this.CLIInput = new Object();
    }

    Start()
    {
        this.ParseCLIInput();
        this.ExecuteCLI();
    }

    ParseCLIInput()
    {
        function ParseArgs(argv, startIndex = 0, defaultKeyName) 
        {
            const parsed = new Map();
            let currentKey = defaultKeyName;

            // Initialize default key bucket
            parsed.set(currentKey, []);

            for (let i = startIndex; i < argv.length; ++i) {
                const token = argv[i];

                if (token.startsWith('--')) {
                // New key begins (drop the `--` prefix)
                currentKey = token.substring(2);
                if (!parsed.has(currentKey)) {
                    parsed.set(currentKey, []);
                }
                } else {
                // Append to current key’s values
                parsed.get(currentKey).push(token);
                }
            }

            return parsed;
        }

        this.CLIInput = ParseArgs(process.argv, 2, 'main_project_entry_file_path');
    }

    ExecuteCLI()
    {
        APT.Commands.ImportMainProject(this);
    }
}