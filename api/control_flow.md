# Control Flow & Operators ⚡

CursorScript supports standard procedural control flow with some modern additions like `async/await` and tuple destructuring.

## Conditionals

### `if` / `else if` / `else`

```cursor
if (score > 100) {
    print("Win!");
} else {
    print("Keep playing.");
}
```

---

## Loops

### `while`

```cursor
let i = 0;
while (i < 5) {
    print(i);
    i = i + 1;
}
```

---

## Modern Async Features

### `async` / `await`

Functions marked as `async` can use the `await` keyword to pause execution for promises.

```cursor
async fn loadData() {
    print("Loading...");
    await wait(1000); // Pauses for 1 second
    print("Done!");
}
```

### Tuple Destructuring

When awaiting functions that returns multiple values (like Network requests), you can destructure them directly.

```cursor
const (data, err) = await Network.get(url);
```
