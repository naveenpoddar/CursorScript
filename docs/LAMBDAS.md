# Lambda Functions ƛ

Lambdas (or Arrow Functions) allow you to write anonymous functions concisely.

## Basic Syntax

`(parameters) -> expression`

```cursor
let double = (n) -> n * 2;
print(double(5)); // 10
```

---

## Block Body Lambdas

If you need multi-line logic, use curly braces. You must use an explicit `return` if you want to return a value (defaults to `null` otherwise).

```cursor
let greet = (name) -> {
    print("Hello", name);
    return true;
};
```

---

## Async Lambdas

You can create asynchronous lambdas by adding the `async` prefix.

```cursor
let fetchData = async (url) -> {
    const (res, err) = await Network.get(url);
    return res;
};
```
