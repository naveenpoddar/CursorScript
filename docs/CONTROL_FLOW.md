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
    print(i)
    i = i + 1
}
```

## Async/Await

Asynchronous operations are handled using `async` functions and the `await` keyword.

```cursor
async fn main() {
    const (res, err) = await someAsyncTask();
    if (!err) print(res);
}
```
