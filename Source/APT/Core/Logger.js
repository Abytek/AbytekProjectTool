const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Ajv = require("ajv");

AMJS.Namespace.F_Logger = class
{
    /**
     * Creates a new F_Logger instance
     * @param {APT.Core.F_System} System - Parent system instance
     */
    constructor(System)
    {
        /** @type {APT.Core.F_System} Parent system reference */
        this.System = System;

        this.HiddenTypes = new Object();
        this.HiddenCategories = new Object();

        if (!fs.existsSync(APT.Common.GetLogsDirectory()))
        {
            fs.mkdirSync(APT.Common.GetLogsDirectory(), { recursive: true });
        }

        this.LogFile = path.join(APT.Common.GetLogsDirectory(), `${this.CurrentTimestapString()}.log`);
        console.log(`[Log] [APT] ${this.CurrentTimestapString()} Log file:`, this.LogFile);

        APT.Log = (Category, ...Args) => this.Log(Category, ...Args);
        APT.Warning = (Category, ...Args) => this.Warning(Category, ...Args);
        APT.Error = (Category, ...Args) => this.Error(Category, ...Args);
    }

    CurrentTimestapString()
    {
        const FileDate = new Date();
        return `${
            FileDate.toLocaleDateString().replaceAll("/", ".")
        }_${
            FileDate.toLocaleTimeString().replaceAll(":", ".").replaceAll(" ", "_")
        }_${
            FileDate.getMilliseconds().toString()
        }`;
    }
    ValidateWriteContent(Content)
    {
        const ajv = new Ajv();
        const Schema = {
            type: "object",
            properties: {
                Type: {
                    type: "string"
                },
                Category: {
                    type: "string"
                },
                Args: {
                    type: "array"
                }
            },
            additionalProperties: false,
        };
        const Validator = ajv.compile(Schema);

        let Result = {
            Status: true,
            Errors: []
        };
        
        if (!Validator(Content)) 
        {
            Result.Status = false;
            Result.Errors.push({
                Message: "Invalid syntax",
                ChildErrors: Validator.errors
            });
            return Result;
        }
        return Result;
    }
    Write(Content)
    {
        const ValidatedResult = this.ValidateWriteContent(Content);
        if (!ValidatedResult.Status)
        {
            throw new Error(`Invalid write content:`, APT.Common.NiceJSONStringify(ValidatedResult.Errors));
        }
        if (this.HiddenTypes[Content.Type])
        {
            return;
        }
        if (this.HiddenCategories[Content.Category])
        {
            return;
        }
        const Message = `[${Content.Type}] [${Content.Category}] [${this.CurrentTimestapString()}] ${Content.Args.join(" ")}`;
        if (Content.Type == "Log")
        {
            console.log(Message);
            fs.appendFileSync(this.LogFile, `${Message}\n`);
        }
        else if (Content.Type == "Warning")
        {
            console.warn(Message);
            fs.appendFileSync(this.LogFile, `${Message}\n`);
        }
        else if (Content.Type == "Error")
        {
            console.error(Message); 
            fs.appendFileSync(this.LogFile, `${Message}\n`);
        }
        else
        {
            throw new Error(`Invalid write type:`, Content.Type);
        }
    }
    Log(Category, ...Args)
    {
        this.Write({ Type: "Log", Category: (Category ?? "Temp"), Args });
    }
    Warning(Category, ...Args)
    {
        this.Write({ Type: "Warning", Category: (Category ?? "Temp"), Args });
    }
    Error(Category, ...Args)
    {
        this.Write({ Type: "Error", Category: (Category ?? "Temp"), Args });
    }
    HideType(Type)
    {
        this.HiddenTypes[Type] = true;
    }
    ShowType(Type)
    {
        this.HiddenTypes[Type] = false;
    }
    HideCategory(Category)
    {
        this.HiddenCategories[Category] = true;
    }
    ShowCategory(Category)
    {
        this.HiddenCategories[Category] = false;
    }
}