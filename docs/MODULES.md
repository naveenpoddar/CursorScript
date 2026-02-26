# Modules & Imports 📦

Organize your code across multiple files using the module system.

## Exporting

Use the `export` keyword before variables, constants, or functions to make them available to other files.

```cursor
// math_utils.cursor
export const PI = 3.14;
export fn add(a, b) {
    return a + b;
}
```

---

## Importing

Use the `import` keyword to bring in values from other files.

```cursor
import { PI, add } from "./math_utils";

print(add(PI, 2));
```

- **Path Rules**: Paths must be relative (starting with `./` or `../`) and do not require the `.cursor` extension.
