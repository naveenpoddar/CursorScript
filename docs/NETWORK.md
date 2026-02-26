# Network Library (`Network`) 🌐

## Methods Index

- [get](#await-networkgeturl-options) | [post](#await-networkposturl-body-options) | [put](#await-networkputurl-body-options)
- [patch](#await-networkpatchurl-body-options) | [delete](#await-networkdeleteurl-options) | [head](#await-networkheadurl-options)
- [SetHeaders](#networksetheadersheadersobject) | [AddHeader](#networkaddheaderkey-value) | [ClearHeaders](#networkclearheaders)

## Asynchronous Methods

All methods return a tuple `(data, error)`.

### `await Network.get(url, [options])`

- **Example**: `const (data, err) = await Network.get("https://api.example.com/items");`

### `await Network.post(url, body, [options])`

- **Example**: `const (res, err) = await Network.post("https://api.example.com/items", { name: "New Item" });`

### `await Network.put(url, body, [options])`

- **Example**: `const (res, err) = await Network.put("https://api.example.com/items/1", { name: "Updated" });`

### `await Network.patch(url, body, [options])`

- **Example**: `const (res, err) = await Network.patch("https://api.example.com/items/1", { status: "sold" });`

### `await Network.delete(url, [options])`

- **Example**: `const (res, err) = await Network.delete("https://api.example.com/items/1");`

### `await Network.head(url, [options])`

Returns response headers.

- **Example**: `const (headers, err) = await Network.head("https://example.com");`

---

## Global Configuration

### `Network.SetHeaders(headersObject)`

- **Example**: `Network.SetHeaders({ "Authorization": "Bearer token" });`

### `Network.AddHeader(key, value)`

- **Example**: `Network.AddHeader("X-Custom", "Value");`

### `Network.ClearHeaders()`

- **Example**: `Network.ClearHeaders();`
