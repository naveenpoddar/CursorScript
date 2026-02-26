# Audio Library (`Audio`) 🔊

## Methods Index

- [loadAsync](#await-audioloadasyncpath) | [load](#audioloadpath) | [play](#audioplayhandle-options)
- [pause](#audiopausehandle) | [resume](#audioresumehandle) | [stop](#audiostophandle) | [setOptions](#audiosetoptionshandle-options)

## Methods

### `await Audio.loadAsync(path)`

- **Example**: `const (handle, err) = await Audio.loadAsync("./bgm.mp3");`

### `Audio.load(path)`

- **Example**: `let handle = Audio.load("./click.wav");`

### `Audio.play(handle, [options])`

- **Example**: `Audio.play(handle, { volume: 0.8, loop: true });`

### `Audio.pause(handle)`

- **Example**: `Audio.pause(handle);`

### `Audio.resume(handle)`

- **Example**: `Audio.resume(handle);`

### `Audio.stop(handle)`

- **Example**: `Audio.stop(handle);`

### `Audio.setOptions(handle, options)`

- **Example**: `Audio.setOptions(handle, { volume: 0.2 });`
