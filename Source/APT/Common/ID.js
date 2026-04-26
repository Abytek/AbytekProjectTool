
const crypto = require('crypto');


APT.Common.StringToUUID = function(input) 
{
  const hash = crypto.createHash('sha1').update(input).digest('hex'); // 40 chars

  // Format as UUIDv4-like string: 8-4-4-4-12
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16), // force version 4
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.substring(18, 20), // force variant
    hash.substring(20, 32)
  ].join('-');
}

APT.Common.StringToShortID = function(input) 
{
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }
  
  // FNV-1a 64-bit hash - commonly used in game engines
  let hash = 0xcbf29ce484222325n; // FNV offset basis (64-bit)
  const fnvPrime = 0x100000001b3n;   // FNV prime (64-bit)
  
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash *= fnvPrime;
    // Keep it within 64-bit range
    hash &= 0xffffffffffffffffn;
  }
  
  // Convert 64-bit hash to base36 for compact representation  
  // Base36 is simpler, portable, and doesn't require Buffer
  const result = hash.toString(36);
  
  // Pad to ensure consistent length and take first 8 chars
  return result.padStart(12, '0');
}

APT.Common.StringToShortIDBase36 = function(input) 
{
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }
  
  const hash = crypto.createHash('sha1').update(input).digest('hex');
  
  if (hash.length < 10) {
    throw new Error('Hash digest too short');
  }
  
  // Convert hex to base36 (0-9, a-z) for better readability
  // Take more hex chars since base36 is more compact
  const hexChars = hash.slice(0, 10); // 10 hex chars = 40 bits
  const number = BigInt('0x' + hexChars);
  
  // Convert to base36 and pad to ensure consistent length
  const result = number.toString(36).padStart(8, '0');
  
  // Safely return first 8 characters
  return result.slice(0, 8);
}