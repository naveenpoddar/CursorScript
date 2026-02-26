# Lambda Functions (Anonymous Functions) λ

Lambdas are values that represent functions. They are defined using the `->` (arrow) operator.

## Syntax

- `(a, b) -> expression` (Single expression return)
- `(a) -> { ... }` (Multi-statement block)
- `async (a, b) -> { ... }` (Asynchronous lambda)

## Examples

### Basic Lambda

```cursor
let add = (a, b) -> a + b
let result = add(5, 10)
```

### Passing to Functions

```cursor
fn runCallback(cb) {
    cb()
}

runCallback(() -> {
    print("Callback executed!")
})
```

### Async Lambda

```cursor
let fetchData = async () -> {
    const (data, err) = await Network.get("https://api.example.com");
    return data;
}
```
