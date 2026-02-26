# Window Library (`Window`) 🖼️

Native windowing and 2D drawing.

## Methods Index

- [create](#windowcreatewidth-height-title-fullscreen) | [toggleFullscreen](#windowtogglefullscreen)
- [getMonitorWidth](#windowgetmonitorwidthindex-windowgetmonitorheightindex) | [getMonitorHeight](#windowgetmonitorwidthindex-windowgetmonitorheightindex) | [getCurrentMonitor](#windowgetcurrentmonitor)
- [getWidth](#windowgetwidth-windowgetheight) | [getHeight](#windowgetwidth-windowgetheight)
- [onUpdate](#windowonupdatecallback) | [onFixedUpdate](#windowonfixedupdatecallback)
- [getMouseX](#windowgetmousex-windowgetmousey) | [getMouseY](#windowgetmousex-windowgetmousey)
- [getMouseDeltaX](#windowgetmousedeltax-windowgetmousedeltay) | [getMouseDeltaY](#windowgetmousedeltax-windowgetmousedeltay) | [getMouseWheel](#windowgetmousewheel)
- [getKeyDown](#windowgetkeydownkey) | [getMouseButton](#windowgetmousebuttonbutton)
- [disableCursor](#windowdisablecursor-windowenablecursor) | [enableCursor](#windowdisablecursor-windowenablecursor)
- [clear](#windowclearcolor) | [setColor](#windowsetcolorcolor)
- [drawRect](#windowdrawrectx-y-w-h) | [drawTriangle](#windowdrawtrianglex1-y1-x2-y2-x3-y3) | [drawQuad](#windowdrawquadx1-y1-x2-y2-x3-y3-x4-y4)
- [drawLine](#windowdrawlinex1-y1-x2-y2) | [drawCircle](#windowdrawcirclex-y-radius) | [drawText](#windowdrawtexttext-x-y-size) | [measureText](#windowmeasuretexttext-size)

## Window Management

### `Window.create(width, height, title, [fullscreen])`

- **Example**: `Window.create(1280, 720, "My Game", false);`

### `Window.toggleFullscreen()`

- **Example**: `Window.toggleFullscreen();`

### `Window.getMonitorWidth(index)` / `Window.getMonitorHeight(index)`

- **Example**: `let mw = Window.getMonitorWidth(0);`

### `Window.getCurrentMonitor()`

- **Example**: `let id = Window.getCurrentMonitor();`

### `Window.getWidth()` / `Window.getHeight()`

- **Example**: `let sw = Window.getWidth();`

---

## Input Handling

### `Window.onUpdate(callback)`

- **Example**: `Window.onUpdate(() -> { /* draw here */ });`

### `Window.onFixedUpdate(callback)`

- **Example**: `Window.onFixedUpdate(() -> { /* physics here */ });`

### `Window.getMouseX()` / `Window.getMouseY()`

- **Example**: `let x = Window.getMouseX();`

### `Window.getMouseDeltaX()` / `Window.getMouseDeltaY()`

- **Example**: `let dx = Window.getMouseDeltaX();`

### `Window.getMouseWheel()`

- **Example**: `let scroll = Window.getMouseWheel();`

### `Window.getKeyDown(key)`

- **Example**: `if (Window.getKeyDown("Space")) { jump(); }`

### `Window.getMouseButton(button)`

- **Example**: `if (Window.getMouseButton("left")) { fire(); }`

### `Window.disableCursor()` / `Window.enableCursor()`

- **Example**: `Window.disableCursor();`

---

## Drawing Commands

### `Window.clear(color)`

- **Example**: `Window.clear("black");`

### `Window.setColor(color)`

- **Example**: `Window.setColor("#FF00FF");`

### `Window.drawRect(x, y, w, h)`

- **Example**: `Window.drawRect(10, 10, 100, 50);`

### `Window.drawTriangle(x1, y1, x2, y2, x3, y3)`

- **Example**: `Window.drawTriangle(0, 0, 10, 0, 5, 10);`

### `Window.drawQuad(x1, y1, x2, y2, x3, y3, x4, y4)`

- **Example**: `Window.drawQuad(0, 0, 10, 0, 10, 10, 0, 10);`

### `Window.drawLine(x1, y1, x2, y2)`

- **Example**: `Window.drawLine(0, 0, 100, 100);`

### `Window.drawCircle(x, y, radius)`

- **Example**: `Window.drawCircle(50, 50, 20);`

### `Window.drawText(text, x, y, [size])`

- **Example**: `Window.drawText("Hello World", 10, 10, 20);`

### `Window.measureText(text, size)`

- **Example**: `let width = Window.measureText("Hello", 20);`
