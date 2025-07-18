
console.log(`HelloAPT ${APT.Project.AbsoluteEntryFilePath}`);

APT.Project.ApplyPrototype(
    APT.Templates.AbytekCMake.ProjectPrototypes.Default
);

console.log();

{
    let AdditionalOptions = new Object();
    APT.ImportProject("./HelloAPT2", AdditionalOptions);
}

{
    let AdditionalOptions = new Object();
    APT.Common.TrySetPropertyByPath(
        AdditionalOptions,
        "InstanceData.APT.Templates.Common.ProjectComponents.PlatformTags.Value",
        [ APT.Common.PlatformTags.EMSCRIPTEN ]
    );
    APT.ImportProject("./HelloAPT2", AdditionalOptions);
}