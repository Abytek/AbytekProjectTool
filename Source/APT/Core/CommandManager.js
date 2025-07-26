
AMJS.ImportNamespace("../Commands");

AMJS.Namespace.F_CommandManager = class
{
    constructor(System)
    {
        this.System = System;
    
        this.CLIInput = new Object();

        this.ParseCLIInput();
    }

    Start()
    {
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

                if (token.startsWith(':'))
                {
                    // New key begins (drop the `:` prefix)
                    currentKey = token.substring(1);
                    if (!parsed.has(currentKey)) {
                        parsed.set(currentKey, []);
                    }
                } 
                else {
                    // Append to current key’s values
                    parsed.get(currentKey).push(token);
                }
            }

            return parsed;
        }

        this.CLIInput = ParseArgs(process.argv, 2, 'MainProjectEntryFile');

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

        {
            let MainProjectEntryFileSlot = this.CLIInput.get('MainProjectEntryFile');
            if (MainProjectEntryFileSlot.length == 1)
            {
                this.CLIInput.get("GlobalDefault").ProjectEntryFile = MainProjectEntryFileSlot[0];
            }
            if (MainProjectEntryFileSlot.length > 1)
            {
                throw new Error(`Too much argument for MainProjectEntryFile`);
            }
        }

        console.log(`CLI input:`, this.CLIInput);
    }

    ExecuteCLI()
    {
        if (APT.Commands.CleanCache(this))
        {
            return true;
        }
        if (APT.Commands.OpenEditor(this))
        {
            return true;
        }
        if (APT.Commands.ImportMainProject(this))
        {
            return true;
        }
        return false;
    }
}