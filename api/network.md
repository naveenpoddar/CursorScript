# Network Library (`Network`) 🌐

The `Network` library provides a powerful interface for making asynchronous HTTP requests using the `async/await` pattern. It supports all standard HTTP methods and global header management.

## Installation / Import

The `Network` library is built-in and globally available as `Network`.

## Async/Await Pattern

CursorScript's `await` operator automatically handles both the success and failure cases of an asynchronous operation by returning a **tuple**: `(data, error)`.

```cursor
const (data, error) = await Network.get("https://api.example.com/data");

if (error) {
    printError("Request failed:", error);
} else {
    print("Received data:", data);
}
```

---

## API Reference

### Global Configuration

#### `Network.AddHeader(key, value)`

Adds a single global header that will be sent with all subsequent requests.

- **key**: String - The header name (e.g., "Authorization").
- **value**: String - The header value.

#### `Network.SetHeaders(headersObj)`

Sets multiple global headers at once.

- **headersObj**: Object - A map of key-value pairs.

#### `Network.ClearHeaders()`

Removes all previously set global headers.

---

### Request Methods

All request methods are **asynchronous** and should be used with `await`.

#### `Network.get(url, [options])`

Performs an HTTP GET request.

- **url**: String - The destination URL.
- **options**: Object (Optional) - Request options such as custom headers.
- **Returns**: Promise resolving to the parsed response body.

#### `Network.post(url, body, [options])`

Performs an HTTP POST request.

- **url**: String - The destination URL.
- **body**: Any - Data to be sent in the request body (will be JSON stringified).
- **options**: Object (Optional) - Request options.

#### `Network.put(url, body, [options])`

Performs an HTTP PUT request.

#### `Network.patch(url, body, [options])`

Performs an HTTP PATCH request.

#### `Network.delete(url, [options])`

Performs an HTTP DELETE request.

#### `Network.head(url, [options])`

Performs an HTTP HEAD request.

- **Returns**: Promise resolving to an object containing the response headers.

---

### Response Handling

- **Automatic JSON Parsing**: If the response header `Content-Type` contains `application/json`, the `data` will be automatically parsed into a CursorScript Object or Array. Otherwise, it returns a String.
- **Error Handling**: On network failure or non-OK HTTP status codes (4xx, 5xx), the `error` part of the `await` tuple will contain a descriptive error string, and `data` will be `null`.

---

## Advanced Examples

### Sending Authorized POST Requests

```cursor
Network.AddHeader("Authorization", "Bearer my-token-123");

const payload = {
    title: "Awesome Post",
    content: "This was sent using CursorScript!"
};

const (response, error) = await Network.post("https://api.example.com/posts", payload);

if (error) {
    printError("Post failed:", error);
} else {
    print("Post created successfully:", response.id);
}
```

### Custom Per-Request Headers

```cursor
const (data, err) = await Network.get("https://api.myData.org", {
    headers: {
        "X-Custom-ID": "9988"
    }
});
```

### Checking Response Headers (HEAD)

```cursor
const (headers, err) = await Network.head("https://example.com/file.zip");
if (!err) {
    print("File size:", headers["content-length"]);
    print("Content Type:", headers["content-type"]);
}
```
