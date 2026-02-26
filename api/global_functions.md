# Global Functions

## Functions Index

- [print](#printargs) | [printError](#printerrorargs) | [len](#lenval) | [typeof](#typeofval) | [wait](#waitms)

These functions are built-in and available in every CursorScript program.

## Output

### `print(args...)`

Prints values to the console, separated by spaces.

- **Example**: `print("Health:", player.hp);`

### `printError(args...)`

Prints values to the console with error formatting (red text).

---

## Utility Functions

### `len(val)`

Returns the length of a string or array.

- **Parameters**: `val` (string | array).
- **Returns**: `number`.

### `typeof(val)`

Returns the internal type name of a value.

- **Returns**: "number", "string", "array", "object", "function", "promise", "null".

### `wait(ms)`

Returns a promise that resolves after the specified time. **Must be awaited.**

- **Parameters**: `ms` (number).
- **Example**: `await wait(2000); // Wait 2 seconds`
