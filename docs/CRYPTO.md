# Crypto Library (`Crypto`) 🔒

The `Crypto` library provides utility functions for cryptography and unique ID generation.

## ID Generation

- `Crypto.uuid()` - Returns a standard random UUID v4 string.
- `Crypto.uuid7()` - Returns a time-ordered UUID v7 string.

## Hashing & Verification

- `await Crypto.hash(data)` - Asynchronously hashes a string using bcrypt. Returns a tuple `(hash, error)`.
- `await Crypto.verifyHash(data, hash)` - Asynchronously verifies a string against a hash. Returns a tuple `(isMatch, error)`.
- `Crypto.sha256(data)` - Synchronously returns the SHA-256 hash of the string, formatted in hex.
- `Crypto.hmacSha256(data, key)` - Synchronously returns the HMAC-SHA-256 hash for the given data and secret key, formatted in hex.

## Base64 Encoding

- `Crypto.base64Encode(data)` - Encodes a string or array of bytes into a Base64 string.
- `Crypto.base64Decode(string)` - Decodes a Base64 string back into a standard string.
