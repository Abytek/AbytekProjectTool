
AMJS.Import("../../Templates/CMake/ProjectComponents/ProjectStructure");
AMJS.Import("../../Templates/UnrealEngine/ProjectComponents/ProjectStructure");

const open = require("open");
const path = require("path");
const fs = require("fs");

AMJS.Namespace.OpenEditor = function(Project)
{
    try 
    {
        let SolutionFile = null;
        {
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

                   SolutionFile = path.join(ProjectStructure.RootDirectory, slnFiles[0]);
                }
            }

            {
                let ProjectStructure = Project.FindComponent(
                    APT.Templates.UnrealEngine.ProjectComponents.F_ProjectStructure
                );
                if (ProjectStructure)
                {
                    const files = fs.readdirSync(ProjectStructure.RootDirectory);
                    const slnFiles = files.filter(file => file.endsWith('.sln'));

                    if (slnFiles.length === 0) {
                        console.log('No .sln files found.');
                        return;
                    }

                   SolutionFile = path.join(ProjectStructure.RootDirectory, slnFiles[0]);
                }
            }
        }
         
        if (!SolutionFile)
        {
            throw new Error(`Not found solution file`);
        }

        console.log(`Opening editor: ${SolutionFile}`);
        open.default(SolutionFile);
    } 
    catch (err) 
    {
        console.error('Error opening editor:', err);
    }
}