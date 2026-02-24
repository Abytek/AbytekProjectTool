
AMJS.Namespace.DefaultPlatformTags = [
    APT.Common.PlatformTags.WINDOWS,
]

AMJS.Namespace.DefaultPlatformTags_AsString = '';
for (let Tag of AMJS.Namespace.DefaultPlatformTags)
{
    AMJS.Namespace.DefaultPlatformTags_AsString += `${Tag} `;
}