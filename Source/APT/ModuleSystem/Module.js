
const path = require("path");
const fs = require("fs");
         
module.exports = class F_Module
{
    constructor(System, AbsolutePath)
    {
        this.System = System;
        this.AbsolutePath = AbsolutePath;
        this.FileContent = fs.readFileSync(AbsolutePath);
    }
}