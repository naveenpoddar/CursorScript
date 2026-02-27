# String Library (`String`) 文本

The `String` library provides robust string manipulation utilities.

## Literals & Escaping

String literals are enclosed in double quotes `"..."`. You can use the backslash `\` to escape characters:

- `\"` - Double quote
- `\\` - Backslash
- `\n` - New line
- `\t` - Tab
- `\r` - Carriage return

**Example**: `print("Hello \"World\""); // Hello "World"`

## Methods

### `String.length(str)`

Returns the number of characters in a string.

- **Example**: `String.length("hello"); // 5`

### `String.charAt(str, index)`

Returns the character at the specified index.

- **Example**: `String.charAt("abc", 1); // "b"`

### `String.toLowerCase(str)`

- **Example**: `String.toLowerCase("HELLO"); // "hello"`

### `String.toUpperCase(str)`

- **Example**: `String.toUpperCase("hello"); // "HELLO"`

### `String.trim(str)`

Removes leading and trailing whitespace.

- **Example**: `String.trim("  foo  "); // "foo"`

### `String.replace(str, search, replacement)`

Replaces occurrences of a substring.

- **Example**: `String.replace("apple", "p", "b"); // "abble"`

### `String.split(str, separator)`

Splits a string into an array.

- **Example**: `String.split("a,b,c", ","); // ["a", "b", "c"]`

### `String.substr(str, start, length)`

- **Example**: `String.substr("hello", 1, 3); // "ell"`

Tests if a string matches a regex pattern. Regex literals use the `r"..."` prefix and support escaping the double quote `\"` without interfering with regex backslashes.

- **Example**: `String.test("abc", r"^[a-z]+$"); // true`
- **Example**: `String.test("quote\"", r"\"$"); // true`

### `String.reverse(str)`

- **Example**: `String.reverse("abc"); // "cba"`
