# String Library (`String`) 文本

The `String` library provides robust string manipulation utilities.

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

### `String.test(str, regex)`

Tests if a string matches a regex pattern.

- **Example**: `String.test("abc", r"^[a-z]+$"); // true`

### `String.reverse(str)`

- **Example**: `String.reverse("abc"); // "cba"`
