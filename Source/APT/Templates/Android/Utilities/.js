
AMJS.Namespace.DefaultPlatformTags = [
    APT.Common.PlatformTags.ANDROID,
    APT.Common.PlatformTags.POSIX,
]

AMJS.Namespace.DefaultPlatformTags_AsString = '';
for (let Tag of AMJS.Namespace.DefaultPlatformTags)
{
    AMJS.Namespace.DefaultPlatformTags_AsString += `${Tag} `;
}