
/**
 * Creates a deep copy of a value using JSON serialization
 * @param {*} Value - Value to copy
 * @returns {*} Deep copy of the value
 */
APT.Common.SimpleDeepCopy = function(Value)
{
    return JSON.parse(
        JSON.stringify(Value)
    );
}