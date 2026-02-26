# String Library (`String`) 文本

## Methods Index

- [length](#stringlengthstr) | [charAt](#stringcharatstr-index) | [charCodeAt](#stringcharcodeatstr-index)
- [toLowerCase](#stringtoolowercasestr-stringtouppercasestr) | [toUpperCase](#stringtoolowercasestr-stringtouppercasestr)
- [trim](#stringtrimstr-stringtrimstart-stringtrimend) | [trimStart](#stringtrimstr-stringtrimstart-stringtrimend) | [trimEnd](#stringtrimstr-stringtrimstart-stringtrimend)
- [startsWith](#stringstartswithstr-search-stringendswithstr-search) | [endsWith](#stringstartswithstr-search-stringendswithstr-search)
- [contains](#stringcontainsstr-search) | [replace](#stringreplacestr-search-replacement) | [split](#stringsplitstr-separator)
- [join](#stringjoinarray-separator) | [take](#stringtakestr-n-stringskipstr-n) | [skip](#stringtakestr-n-stringskipstr-n)
- [substr](#stringsubstrstr-start-length) | [reverse](#stringreversestr)

## Methods

### `String.length(str)`

- **Example**: `let len = String.length("hello"); // 5`

### `String.charAt(str, index)`

- **Example**: `let c = String.charAt("abc", 0); // "a"`

### `String.charCodeAt(str, index)`

- **Example**: `let code = String.charCodeAt("A", 0); // 65`

### `String.toLowerCase(str)` / `String.toUpperCase(str)`

- **Example**: `let lower = String.toLowerCase("HELLO");`

### `String.trim(str)` / `String.trimStart()` / `String.trimEnd()`

- **Example**: `let clean = String.trim("  fix  ");`

### `String.startsWith(str, search)` / `String.endsWith(str, search)`

- **Example**: `let ok = String.startsWith("file.txt", "file");`

### `String.contains(str, search)`

- **Example**: `let has = String.contains("hello world", "world");`

### `String.replace(str, search, replacement)`

- **Example**: `let s = String.replace("foo bar", "foo", "baz");`

### `String.split(str, separator)`

- **Example**: `let parts = String.split("a,b,c", ",");`

### `String.join(array, separator)`

- **Example**: `let s = String.join(["a", "b"], "-");`

### `String.take(str, n)` / `String.skip(str, n)`

- **Example**: `let start = String.take("hello", 2); // "he"`

### `String.substr(str, start, length)`

- **Example**: `let sub = String.substr("hello", 1, 2); // "el"`

### `String.reverse(str)`

- **Example**: `let back = String.reverse("abc"); // "cba"`
