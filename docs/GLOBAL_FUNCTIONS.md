# Global Functions

These functions are built into the global scope of CursorScript and are available everywhere.

## Console & Output

- `print(args...)` - Prints values to the standard output.
- `printError(args...)` - Prints values to the error output (usually in red).
- `input(prompt)` - Reads a line of input from the console (alias for `prompt`).
- `prompt(prompt)` - Reads a line of input from the console.
- `clear()` - Clears the console screen.

## Math & Random

- `rand(min, max)` - Returns a random integer between `min` and `max` (inclusive).
- `time()` - Returns the current system time in milliseconds.

## Data Structures

- `len(val)` - Returns the length of a string or array.
- `push(arr, value)` - Appends a value to the end of an array.
- `pop(arr)` - Removes and returns the last value of an array.
- `shift(arr)` - Removes and returns the first value of an array.
- `unshift(arr, value)` - Prepends a value to the start of an array.

## Type Conversion & Info

- `str(val)` - Converts any value to a string string.
- `typeof(val)` - Returns the type of the value as a string (e.g., "number", "object", "array", "function", "promise").
- `concat(args...)` - Joins multiple values into a single string separated by spaces.

## Asynchronous

- `wait(ms)` - Returns a promise that resolves after `ms` milliseconds. Must be used with `await`. (Alias: `sleep(ms)`)

## System

- `exit()` - Terminates the program immediately.
- `help()` - Prints basic language help and version info.
