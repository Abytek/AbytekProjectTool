
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.Import("./CommonGenerator");

AMJS.Namespace.GenerateProjectFiles_CLion = function(ProjectStructure)
{
    console.log("CLion project files generated successfully");
}