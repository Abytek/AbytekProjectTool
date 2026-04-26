
/**
 * Converts a value to a string, with special handling for arrays
 * @param {*} Value - Value to convert
 * @param {string} [ArrayCombinatorKeyword="/"] - String to join array elements with
 * @returns {string|null} Converted string or null if input is null
 */
APT.Common.ForwardString = function(Value, ArrayCombinatorKeyword = "/")
{
    if (Value == null)
    {
        return null;
    }
    if (Array.isArray(Value))
    {
        return Value.join(ArrayCombinatorKeyword);
    }
    return Value;
}

/**
 * Converts various string/number values to boolean
 * @param {*} Value - Value to convert
 * @returns {boolean} true for various "truthy" strings/numbers, false otherwise
 */
APT.Common.ForwardBool = function(Value)
{
    if (
        (Value == 1)
        || (Value == '1')
        || (Value == 'true')
        || (Value == 'True')
        || (Value == 'TRUE')
        || (Value == 'on')
        || (Value == 'On')
        || (Value == 'ON')
        || (Value == 'enable')
        || (Value == 'Enable')
        || (Value == 'ENABLE')
    )
    {
        return true;
    }
    return false;
}