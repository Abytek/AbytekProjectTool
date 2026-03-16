
AMJS.Import("../../Templates/CMake/ProjectComponents/ProjectStructure");
AMJS.Import("../../Templates/UnrealEngine/ProjectComponents/ProjectStructure");

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

AMJS.Namespace.OpenEditor = function(Project)
{
    try 
    {
        let SolutionFile = null;
        (() => {
            let FindSolutionFile = function(Directory)
            {
                const files = fs.readdirSync(Directory);
                const slnFiles = files.filter(file => file.endsWith('.slnx'));
                if (slnFiles.length === 0) 
                {
                    return false;
                }
                SolutionFile = path.join(Directory, slnFiles[0]);
                return true;
            }

            {
                let ProjectStructure = Project.FindComponent(
                    APT.Templates.CMake.ProjectComponents.F_ProjectStructure
                );
                if (ProjectStructure)
                {
                    if (FindSolutionFile(ProjectStructure.BuildDirectory))
                    {
                        return;
                    }
                }
            }

            {
                let ProjectStructure = Project.FindComponent(
                    APT.Templates.UnrealEngine.ProjectComponents.F_ProjectStructure
                );
                if (ProjectStructure)
                {
                    if (FindSolutionFile(ProjectStructure.MainDirectory))
                    {
                        return;
                    }
                }
            }

            if (FindSolutionFile(Project.EntryDirectory))
            {
                return;
            }
        })();
         
        if (!SolutionFile)
        {
            throw new Error(`Not found solution file`);
        }

        APT.Log("APT", `Opening editor: ${SolutionFile}`);
        const child = spawn(`start`, [ SolutionFile ], {
            detached: true,
            stdio: 'ignore',
            env: { ...process.env },
            shell: true // Use shell to execute commands
        });
        child.unref();          
    } 
    catch (err) 
    {
        console.error('Error opening editor:', err);
    }
}