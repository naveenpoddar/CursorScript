# Terminal Library

The `Terminal` library provides advanced terminal interaction capabilities, wrapping the powerful `terminal-kit` library.

## Printing & Styling

- `Terminal.print(text)` - Prints text without a newline.
- `Terminal.println(text)` - Prints text with a newline.
- `Terminal.color(name)` - Sets the foreground color (e.g., "red", "green", "blue", "yellow", "magenta", "cyan", "white", "black").
- `Terminal.bgColor(name)` - Sets the background color.
- `Terminal.bold()` - Enables bold text.
- `Terminal.italic()` - Enables italic text.
- `Terminal.underline()` - Enables underlined text.
- `Terminal.inverse()` - Inverts foreground and background colors.
- `Terminal.reset()` - Resets all styling and colors.

## Cursor & Screen Control

- `Terminal.moveTo(x, y)` - Moves the cursor to absolute position (x, y).
- `Terminal.move(x, y)` - Moves the cursor relative to its current position.
- `Terminal.up(n)` - Moves the cursor up by `n` lines (default 1).
- `Terminal.down(n)` - Moves the cursor down.
- `Terminal.left(n)` - Moves the cursor left.
- `Terminal.right(n)` - Moves the cursor right.
- `Terminal.clear()` - Clears the entire screen.
- `Terminal.eraseLine()` - Erases the current line.
- `Terminal.eraseLineAfter()` - Erases from cursor to end of line.
- `Terminal.eraseLineBefore()` - Erases from start of line to cursor.

## Terminal Info

- `Terminal.getWidth()` - Returns the terminal width in columns.
- `Terminal.getHeight()` - Returns the terminal height in rows.

## Input Handling

- `Terminal.grabInput(bool)` - Enables or disables raw input grabbing (capturing individual keys/mouse).
- `Terminal.onKey(callback)` - Sets a callback for key events. Callback receives `(name, matches, data)`.
- `Terminal.onMouse(callback)` - Sets a callback for mouse events. Callback receives `(name, data)`.

## Interactive Widgets (Async)

These functions return promises and should be used with `await`.

- `await Terminal.inputField(options)` - Displays an interactive input field.
- `await Terminal.yesOrNo(options)` - Displays a (y/n) prompt.
- `await Terminal.gridMenu(items, options)` - Displays a grid-based menu.
- `await Terminal.singleColumnMenu(items, options)` - Displays a single-column menu.

## Other Utilities

- `Terminal.progressBar(options)` - Creates and returns a progress bar object.
  - `bar.update(progress)` - Updates progress (0.0 to 1.0).
  - `bar.stop()` - Stops the progress bar.
- `Terminal.beep()` - Triggers a terminal beep sound.
- `Terminal.fullscreen(bool)` - Enters or exits fullscreen mode.
- `Terminal.processExit()` - Gracefully exits the process.

## Example

```typescript
Terminal.clear();
Terminal.moveTo(5, 5);
Terminal.color("cyan");
Terminal.bold();
Terminal.println("Welcome to CursorScript Terminal!");

let choice = await Terminal.singleColumnMenu(["Play", "Settings", "Exit"]);
print("You chose: " + choice);

if (choice == "Exit") {
  Terminal.processExit();
}
```
