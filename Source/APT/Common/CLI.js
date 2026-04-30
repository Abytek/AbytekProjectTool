
APT.Common.ToCLIArgument = function(Value)
{
    return `\"${
        Value
        .replaceAll("\"", "\\\"")
        .replaceAll("\\", "/")
    }\"`;
}