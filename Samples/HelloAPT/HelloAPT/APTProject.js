
console.log(`HelloAPT ${APT.Project.AbsoluteEntryFile}`);

APT.Project.ApplyPrototype(
    APT.Templates.AbytekCMake.ProjectPrototypes.Default
);
APT.Project.TryFinalize();

{
    let AdditionalOptions = new Object();
    APT.Common.TrySetPropertyByPath(
        AdditionalOptions,
        "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.Generator",
        [ APT.Templates.CMake.Utilities.Generators.VS2022 ]
    );
    APT.ImportProject("../HelloAPT2/APTProject", AdditionalOptions);
}

{
    let AdditionalOptions = new Object();
    APT.Common.TrySetPropertyByPath(
        AdditionalOptions,
        "InstanceData.APT.Templates.Common.ProjectComponents.ProjectStructure.PlatformTags",
        [ APT.Common.PlatformTags.EMSCRIPTEN ]
    );
}