# Control Flow & Operators

## Comparison Operators

- `==` - Equals
- `!=` - Not Equals
- `<` - Less Than
- `>` - Greater Than
- `<=` - Less Than or Equals
- `>=` - Greater Than or Equals

## Logical Operators (Gates) ⚡

CursorScript uses logical gates with short-circuiting:

- `&&` - AND
- `||` - OR
- `!` - NOT (Unary)

## If Statements

```cursor
if (score > 10 && gameOver == false) {
    print("Keep playing!");
} else {
    print("Game Over");
}
```

## While Loops

```cursor
let i = 0;
while (i < 10) {
    if (i == 5) break;
    if (i % 2 == 0) {
        i = i + 1;
        continue;
    }
    print(i)
    i = i + 1
}
```

## Break & Continue

- `break` - Exits the current loop immediately.
- `continue` - Skips the rest of the current loop iteration and moves to the next check.

## Async/Await

Asynchronous operations are handled using `async` functions and the `await` keyword.

```cursor
async fn main() {
    const (res, err) = await someAsyncTask();
    if (!err) print(res);
}
```
