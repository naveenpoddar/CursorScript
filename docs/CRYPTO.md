# Crypto Library (`Crypto`) 🔒

## Methods Index

- [hash](#await-cryptohashpayload) | [verifyHash](#await-cryptoverifyhashpayload-hash)
- [uuid](#cryptouuid) | [uuid7](#cryptouuid7) | [sha256](#cryptosha256payload)
- [hmacSha256](#cryptohmac256payload-key) | [base64Encode](#cryptobase64encodepayload) | [base64Decode](#cryptobase64decodepayload)

## Asynchronous Methods

### `await Crypto.hash(payload)`

- **Example**: `let hash = await Crypto.hash("myPassword123");`

### `await Crypto.verifyHash(payload, hash)`

- **Example**: `let ok = await Crypto.verifyHash("myPassword123", storedHash);`

---

## Synchronous Methods

### `Crypto.uuid()`

- **Example**: `let id = Crypto.uuid(); // v4`

### `Crypto.uuid7()`

- **Example**: `let id = Crypto.uuid7(); // v7 (time-ordered)`

### `Crypto.sha256(payload)`

- **Example**: `let digest = Crypto.sha256("data");`

### `Crypto.hmac256(payload, key)`

- **Example**: `let sig = Crypto.hmac256("message", "secret-key");`

### `Crypto.base64Encode(payload)`

- **Example**: `let b64 = Crypto.base64Encode("hello");`

### `Crypto.base64Decode(payload)`

- **Example**: `let raw = Crypto.base64Decode("aGVsbG8=");`
