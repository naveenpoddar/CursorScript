# ServerLib API Documentation

The `Server` library allows you to start robust HTTP and WebSocket servers natively within CursorScript. Because CursorScript is built on top of Bun, `Server.start()` utilizes Bun's highly optimized `Bun.serve()` under the hood.

> Note: To use WebSockets, use the `websocket` object inside the `options` dictionary.

## Starting an HTTP Server

To start an HTTP Server, call `Server.start()`. It takes two arguments: an options dictionary, and a request handler function.

```javascript
// Start a server on port 8080
let msg = Server.start({ port: 8080 }, lambda (request, server) {
    print("Received a request at: " + request.pathname);
    
    // Return a simple string response
    if (request.pathname == "/hello") {
        return "Hello World!";
    }

    // Return a custom JSON response with status codes and headers
    if (request.pathname == "/json") {
         return {
              status: 200,
              headers: { "X-Served-By": "CursorScript" },
              body: { "success": true, "message": "JSON response block" }
         };
    }

    // Default 404 response
    return {
         status: 404,
         body: "Not Found"
    };
});

print(msg); // Outputs: Server started on http://localhost:8080
```

## `request` Properties

The `request` object passed to your handler function contains the following properties:

- `method` (String): The HTTP method (e.g., "GET", "POST").
- `url` (String): The full URL string requested.
- `pathname` (String): The path requested (e.g., `/api/users`).
- `search` (String): The query string, including the `?` mark.
- `headers` (Object): A dictionary of the request headers.
- `bodyText` (String | null): The raw text representation of the request body (if not a GET/HEAD request).
- `bodyJson` (Object | null): The JSON parsed representation of the request body (if valid JSON).

## Response Types

Your handler can return three types of responses:
1. **String**: Returns a standard `200 OK` response with `text/plain` content type.
2. **Object**: Returns a completely customizable response. If `body` is an object, it automatically serialize it to JSON and sets the `Content-Type` to `application/json`.
   - `status` (Number): Optional (Default 200). The HTTP status code.
   - `headers` (Object): Optional. A dictionary of response headers to set.
   - `body` (Any): Optional. The response body (String or Object).
3. **Null**: If your handler function implicitly returns nothing, CursorScript will respond with a `200 OK` status.

## Stopping the Server

```javascript
let result = Server.stop();
print(result); // Outputs: Server stopped.
```
