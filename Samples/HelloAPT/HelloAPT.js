
console.log(`HelloAPT ${APT.Project.AbsoluteEntryFilePath}`);

APT.Project.ApplyPrototype(
    APT.Templates.AbytekCMake.ProjectPrototypes.Default
);

APT.ImportProject("./HelloAPT2");
APT.ImportProject("./HelloAPT2", { InstanceData: 3 });