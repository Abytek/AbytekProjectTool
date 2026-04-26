
/**
 * Asserts that a value is truthy, throws error if not
 * @param {*} Value - Value to check
 * @param {...*} Args - Arguments to pass to Error constructor if assertion fails
 * @returns {*} The input value if assertion passes
 * @throws {Error} If assertion fails
 */
APT.Common.Assert = function(Value, ...Args)
{
    if (!Value)
    {
        throw new Error(...Args);
        return null;
    }
    return Value;
}