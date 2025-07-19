
console.log(`HelloAPT ${APT.Project.AbsoluteEntryFilePath}`);

APT.Project.ApplyPrototype(
    APT.Templates.AbytekCMake.ProjectPrototypes.Default
);
APT.Project.TryFinalize();

{
    let AdditionalOptions = new Object();
    APT.Common.TrySetPropertyByPath(
        AdditionalOptions,
        "InstanceData.APT.Templates.CMake.ProjectComponents.ProjectStructure.Generator",
        [ APT.Templates.CMake.Utilities.Generators.CLION ]
    );
    APT.ImportProject("../HelloAPT2/APTProject", AdditionalOptions);
}

{
    let AdditionalOptions = new Object();
    APT.Common.TrySetPropertyByPath(
        AdditionalOptions,
        "InstanceData.APT.Templates.Common.ProjectComponents.PlatformTags.Value",
        [ APT.Common.PlatformTags.EMSCRIPTEN ]
    );
}