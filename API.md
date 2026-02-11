# CursorScript API Documentation 📖

Welcome to the CursorScript API documentation. This document covers the built-in libraries and global functions available in the language.

## Global Functions

| Function          | Description                                               | Example                              |
| :---------------- | :-------------------------------------------------------- | :----------------------------------- |
| `print(args...)`  | Prints values to the console.                             | `print("Hello", 42);`                |
| `time()`          | Returns the current time in milliseconds.                 | `let start = time();`                |
| `rand(min, max)`  | Returns a random integer between min and max (inclusive). | `let n = rand(1, 10);`               |
| `len(val)`        | Returns the length of a string or array.                  | `len("hello"); // 5`                 |
| `push(arr, v)`    | Appends a value to the end of an array.                   | `push(myArr, 10);`                   |
| `pop(arr)`        | Removes and returns the last element of an array.         | `let last = pop(myArr);`             |
| `shift(arr)`      | Removes and returns the first element of an array.        | `let first = shift(myArr);`          |
| `unshift(arr, v)` | Prepends a value to the start of an array.                | `unshift(myArr, 0);`                 |
| `str(val)`        | Converts a value to its string representation.            | `let s = str(123);`                  |
| `typeof(val)`     | Returns the type of a value as a string.                  | `let t = typeof(10); // "number"`    |
| `concat(args...)` | Concatenates values into a single string with spaces.     | `concat("foo", "bar"); // "foo bar"` |
| `exit()`          | Exits the program with code 1.                            | `exit();`                            |
| `clear()`         | Clears the console.                                       | `clear();`                           |
| `help()`          | Prints help information to the console.                   | `help();`                            |

---

## Math Library (`Math`)

The `Math` library provides standard mathematical constants and functions.

### Constants

- `Math.PI` - 3.14159...
- `Math.E` - 2.71828...
- `Math.TAU` - 2 \* PI
- `Math.PHI` - 1.618... (Golden Ratio)
- `Math.SQRT2` - Square root of 2

### Functions

- `Math.abs(n)` - Absolute value.
- `Math.floor(n)`, `Math.ceil(n)`, `Math.round(n)` - Rounding.
- `Math.pow(base, exp)`, `Math.sqrt(n)`, `Math.cbrt(n)` - Powers and roots.
- `Math.sin(rad)`, `Math.cos(rad)`, `Math.tan(rad)` - Trigonometry (Radians).
- `Math.sinDeg(deg)`, `Math.cosDeg(deg)`, `Math.tanDeg(deg)` - Trigonometry (Degrees).
- `Math.clamp(n, min, max)` - Clamps a value.
- `Math.lerp(a, b, t)` - Linear interpolation.
- `Math.randomInt(min, max)` - Random integer.

---

## Game Library (`Game`) 🎮

The `Game` library provides essential utilities for game development, physics, and gameplay logic.

### Collision Detection

- `Game.intersectRect(x1, y1, w1, h1, x2, y2, w2, h2)` - Returns `true` if two rectangles overlap.
- `Game.pointInRect(px, py, rx, ry, rw, rh)` - Returns `true` if a point is inside a rectangle.

### Movement & Math

- `Game.moveTowards(current, target, maxDelta)` - Moves `current` towards `target` without overshooting.
- `Game.lerp(a, b, t)` - Linearly interpolates between `a` and `b`.
- `Game.smoothstep(edge0, edge1, x)` - Smooth interpolation between 0 and 1.
- `Game.angleTo(x1, y1, x2, y2)` - Returns the angle (radians) from point 1 to point 2.
- `Game.deltaAngle(a, b)` - Shortest distance between two angles (radians).

### Gameplay Utilities

- `Game.chance(p)` - Returns `true` with probability `p` (0.0 to 1.0).
- `Game.shake(mag)` - Returns a random value between `-mag` and `+mag`.
- `Game.choose(args...)` - Returns a random element from the provided arguments.
- `Game.deadzone(val, threshold)` - Returns 0 if `abs(val) < threshold`.
- `Game.repeat(t, length)` - Loops `t` so it is never larger than `length` and never smaller than 0.
- `Game.pingPong(t, length)` - Returns a value that oscillates between 0 and `length`.

### Conversion

- `Game.degToRad(deg)` - Converts degrees to radians.
- `Game.radToDeg(rad)` - Converts radians to degrees.

---

## Window Library (`Window`) 🖼️

The `Window` library provides native windowing and 2D drawing capabilities using `skia-canvas`.

### Window Management

- `Window.create(width, height, title)` - Opens a new native window.
- `Window.onUpdate(callback)` - Registers a function to be called every frame for drawing/logic.
- `Window.close()` - Closes the window.

### Drawing Commands

- `Window.clear(color)` - Fills the entire window with a color (e.g., "black", "#ff0000").
- `Window.setColor(color)` - Sets the current fill and stroke color.
- `Window.drawRect(x, y, w, h)` - Draws a filled rectangle.
- `Window.strokeRect(x, y, w, h)` - Draws a rectangle outline.
- `Window.drawCircle(x, y, r)` - Draws a filled circle.
- Window.drawText(text, x, y, size) - Draws text at the specified position.

### Input Handling

- `Window.getKeyDown(key)` - Returns `true` if a specific key is held down (e.g. "ArrowUp", " ").
- `Window.getMouseX()`, `Window.getMouseY()` - Returns current mouse coordinates.
- `Window.getMouseButton()` - Returns `true` if mouse is clicked.

---

## Control Flow & Operators

### Comparison Operators

- `==` - Equals
- `!=` - Not Equals
- `<` - Less Than
- `>` - Greater Than

### Logical Operators (Gates) ⚡

- `&&` - AND
- `||` - OR
- `!` - NOT (Unary)

### If Statements

```cursor
if (score > 10 && gameOver == false) {
    print("Keep playing!");
}
```

### While Loops

```cursor
let i = 0;
while (i < 10) {
    print(i)
    i = i + 1
}
```

_Note: Semicolons are required on `let`/`const` declarations, but not after `if` blocks, `while` loops, or expression statements._
