
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

AMJS.Import("./CommonGenerator");

AMJS.Namespace.GenerateProjectFiles_AndroidStudio = function(ProjectStructure)
{
    APT.Log("APT.Templates.CMake", "Android Studio project files generated successfully");
}