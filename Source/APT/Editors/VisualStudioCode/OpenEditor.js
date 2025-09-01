
const { execSync } = require('child_process');
const path = require("path");
const fs = require("fs");

AMJS.Namespace.OpenEditor = function(Project)
{
    try 
    {
        APT.Log("APT", `Opening editor: ${Project.EntryDirectory}`);
        execSync(`code \"${Project.EntryDirectory}\"`);
    } 
    catch (err) 
    {
        console.error('Error opening editor:', err);
    }
}