# CursorScript API

Welcome to the CursorScript API documentation. This index provides links to detailed documentation for each library and core language feature.

## Core Language Features

- [Global Functions](api/global_functions.md)
- [Modules & Imports](api/modules.md)
- [Lambda Functions](api/lambdas.md)
- [Control Flow & Operators](api/control_flow.md)

## Built-in Libraries

- [Math Library](./docs/MATH.md) - Mathematical constants and functions.
- [Game Library](./docs/GAME.md) - Physics, collisions, and gameplay utilities.
- [Window Library](./docs/WINDOW.md) - Native windowing and 2D drawing.
- [Network Library](./docs/NETWORK.md) - Asynchronous HTTP requests.
- [Thread Library](./docs/THREAD.md) - Multi-threading and background tasks.
- [Crypto Library](./docs/CRYPTO.md) - Hashing, encryption, and UUIDs.
- [JSON Library](./docs/JSON.md) - Serializing and deserializing data.
- [File Library](./docs/FILE.md) - Filesystem read/write operations.
- [Audio Library](./docs/AUDIO.md) - Loading and playing sounds.
- [Engine3D Library](./docs/ENGINE3D.md) - High-performance 3D rendering.
- [String Library](./docs/STRING.md) - String manipulation utilities.
- [DateTime Library](./docs/DATE_TIME.md) - Date and time utilities.
- [Server Library](./docs/SERVER.md) - HTTP and WebSocket server support.
- # [Perlin Noise Library](./docs/PERLIN_NOISE.md) - Procedural noise generation.

* [Math Library](api/math.md) - Mathematical constants and functions.
* [Game Library](api/game.md) - Physics, collisions, and gameplay utilities.
* [Window Library](api/window.md) - Native windowing and 2D drawing.
* [Network Library](api/network.md) - Asynchronous HTTP requests.
* [Thread Library](api/thread.md) - Multi-threading and background tasks.
* [Crypto Library](api/crypto.md) - Hashing, encryption, and UUIDs.
* [JSON Library](api/json.md) - Serializing and deserializing data.
* [File Library](api/file.md) - Filesystem read/write operations.
* [Server Library](api/server.md) - HTTP and WebSocket server support.

---

---

## Global Functions Quick Reference

| Function          | Description                                               | Example                              |
| ----------------- | --------------------------------------------------------- | ------------------------------------ |
| `print(args...)`  | Prints values to the console.                             | `print("Hello", 42);`                |
| `printError(...)` | Prints values to the error console (red).                 | `printError("Fetch failed!");`       |
| `time()`          | Returns the current time in milliseconds.                 | `let start = time();`                |
| `rand(min, max)`  | Returns a random integer between min and max (inclusive). | `let n = rand(1, 10);`               |
| `len(val)`        | Returns the length of a string or array.                  | `len("hello"); // 5`                 |
| `push(arr, v)`    | Appends a value to the end of an array.                   | `push(myArr, 10);`                   |
| `pop(arr)`        | Removes and returns the last element of an array.         | `let last = pop(myArr);`             |
| `shift(arr)`      | Removes and returns the first element of an array.        | `let first = shift(myArr);`          |
| `unshift(arr, v)` | Prepends a value to the start of an array.                | `unshift(myArr, 0);`                 |
| `str(val)`        | Converts a value to its string representation.            | `let s = str(123);`                  |
| `typeof(val)`     | Returns the type of a value as a string.                  | `let t = typeof(10); // "number"`    |
| `concat(args...)` | Concatenates values into a single string with spaces.     | `concat("foo", "bar"); // "foo bar"` |
| `exit()`          | Exits the program with code 1.                            | `exit();`                            |
| `clear()`         | Clears the console.                                       | `clear();`                           |
| `help()`          | Prints help information to the console.                   | `help();`                            |
| `wait(ms)`        | Asynchronously pauses execution for `ms` milliseconds.    | `await wait(1000);`                  |
