
console.log(`HelloAPT2`, APT.Project.AdditionalOptions);

APT.Project.ApplyPrototype(
    APT.Templates.AbytekCMake.ProjectPrototypes.Default
);

console.log(
    APT.Project.GetComponent(
        APT.Templates.Common.ProjectComponents.F_PlatformTags
    ).Value
);