
const { execSync } = require('child_process');
const path = require("path");
const fs = require("fs");

AMJS.Namespace.OpenEditor = function(Project)
{
    try 
    {
        console.log(`Opening editor: ${Project.EntryDirectory}`);
        execSync(`code \"${Project.EntryDirectory}\"`);
    } 
    catch (err) 
    {
        console.error('Error opening editor:', err);
    }
}