
console.log(`AbytekImporter ${APT.Project.AbsoluteEntryFile}`);

let ProjectAccessor = new APT.Templates.AbytekCMake.Utilities.F_ProjectAccessor();

{
    let AbytekProject = APT.ImportProject(APT.Common.ReadCache("ABYTEK_PROJECT_ENTRY_FILE"));

    console.log(ProjectAccessor.GetModule(AbytekProject, "Abytek.Editor"));

    ProjectAccessor.Build(AbytekProject, "Abytek.Editor");

    console.log(ProjectAccessor.ResolveModuleTargetFile(AbytekProject, "Abytek.Editor"));
}

APT.Project.TryFinalize();