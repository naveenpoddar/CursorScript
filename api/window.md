# Window Library (`Window`) 🖼️

The `Window` library provides native windowing and 2D drawing capabilities using `skia-canvas`.

## Window Management

- `Window.create(width, height, title)` - Opens a new native window.
- `Window.onUpdate(callback)` - Registers a function to be called every frame for drawing/logic.
- `Window.close()` - Closes the window.

## Drawing Commands

- `Window.clear(color)` - Fills the entire window with a color (e.g., "black", "#ff0000").
- `Window.setColor(color)` - Sets the current fill and stroke color.
- `Window.drawRect(x, y, w, h)` - Draws a filled rectangle.
- `Window.strokeRect(x, y, w, h)` - Draws a rectangle outline.
- `Window.drawCircle(x, y, r)` - Draws a filled circle.
- `Window.drawText(text, x, y, size)` - Draws text at the specified position.

## Input Handling

- `Window.getKeyDown(key)` - Returns `true` if a specific key is held down (e.g. "ArrowUp", " ").
- `Window.getMouseX()`, `Window.getMouseY()` - Returns current mouse coordinates.
- `Window.getMouseButton()` - Returns `true` if mouse is clicked.
