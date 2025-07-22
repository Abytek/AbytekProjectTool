
console.log(`HelloAPT2`, APT.Project.AdditionalOptions);

APT.Project.ApplyPrototype(
    APT.Templates.AbytekCMake.ProjectPrototypes.Default
);
APT.Project.TryFinalize();

{
    let ProjectComponent = APT.Project.GetComponent(
        APT.Templates.Common.ProjectComponents.F_PlatformTags
    );
    console.log(
        'Platform tags:',
        ProjectComponent.Value
    );
}
{
    let ProjectComponent = APT.Project.GetComponent(
        APT.Templates.CMake.ProjectComponents.F_ProjectStructure
    );
    console.log(
        'CMake config:',
        ProjectComponent.Config
    );
    console.log(
        'CMake generator:',
        ProjectComponent.Generator
    );
    console.log(
        'Build directory path:',
        ProjectComponent.BuildDirectory
    );
}
{
    let ProjectComponent = APT.Project.GetComponent(
        APT.Templates.AbytekCMake.ProjectComponents.F_ProjectStructure
    );
    console.log(
        'A project type:',
        ProjectComponent.AProjectType
    );
}

console.log();