# Modules 📦

CursorScript supports a modern ES-style module system to help organize code into multiple files.

## Exporting

Use the `export` keyword before a variable or function declaration to make it available to other files.

```cursor
export const PI = 3.14;
export fn greet(name) {
    print("Hello", name)
}
```

## Importing

Use `import { ... } from "path"` to bring exported values into the current file. Paths are relative to the current file.

```cursor
import { PI, greet } from "./mathUtils"

print(PI)
greet("Developer")
```

## Module Resolution

- Paths starting with `./` or `../` are resolved relative to the current file.
- Names without a path prefix are resolved via the `cursorx` package manager in the `.cursorx` directory.
