# Audio Library (`Audio`) 🔊

The `Audio` library provides methods for loading and playing sounds using native system bridges.

## Methods

### `await Audio.loadAsync(path)`

Asynchronously loads an audio file and returns a handle ID.

- **Example**: `const (handle, err) = await Audio.loadAsync("music.mp3");`

### `Audio.load(path)`

Synchronously loads an audio file and returns a handle ID.

- **Example**: `let music = Audio.load("sound.wav");`

### `Audio.play(handle, [options])`

Plays the audio associated with the handle.

- **Example**: `Audio.play(music, { volume: 0.5 });`

### `Audio.pause(handle)`

Pauses playback.

- **Example**: `Audio.pause(music);`

### `Audio.resume(handle)`

Resumes paused playback.

- **Example**: `Audio.resume(music);`

### `Audio.stop(handle)`

Stops playback immediately.

- **Example**: `Audio.stop(music);`

### `Audio.setOptions(handle, options)`

Updates playback options like volume or pitch.

- **Example**: `Audio.setOptions(music, { pitch: 1.2 });`
