
AMJS.Import("../../Templates/CMake/ProjectComponents/ProjectStructure");

const open = require("open");
const path = require("path");
const fs = require("fs");

AMJS.Namespace.OpenEditor = function(Project)
{
    try 
    {
        let ProjectStructure = Project.FindComponent(
            APT.Templates.CMake.ProjectComponents.F_ProjectStructure
        );
        if (ProjectStructure)
        {
            const files = fs.readdirSync(ProjectStructure.BuildDirectory);
            const slnFiles = files.filter(file => file.endsWith('.sln'));

            if (slnFiles.length === 0) {
                console.log('No .sln files found.');
                return;
            }

            const slnPath = path.join(ProjectStructure.BuildDirectory, slnFiles[0]);
            console.log(`Opening editor: ${slnPath}`);
            
            open.default(slnPath);
        }
    } 
    catch (err) 
    {
        console.error('Error opening editor:', err);
    }
}