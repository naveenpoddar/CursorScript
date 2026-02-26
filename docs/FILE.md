# File Library (`File`) 📁

The `File` library provides methods for reading, writing, and traversing the filesystem.

## Methods

### Asynchronous Methods (Recommended)

- `await File.readAsync(path)` - Asynchronously reads a text file's contents. Returns `(data, error)`.
- `await File.writeAsync(path, data)` - Asynchronously writes a string to a file. Returns `(success, error)`.
- `await File.readBytesAsync(path)` - Asynchronously reads a file as an array of bytes. Returns `(bytes, error)`.
- `await File.listAsync(directory)` - Asynchronously lists files in a directory. Returns `(list, error)`.

### Synchronous Methods

- `File.read(path)` - Synchronously reads and returns a text file's contents as a string.
- `File.write(path, data)` - Synchronously writes a string `data` to the requested text file path. Returns `true` on success.
- `File.readBytes(path)` - Synchronously reads a file containing binary data (like images or audio) and returns it as an array of bytes.
- `File.exists(path)` - Checks if a file or directory exists. Returns a boolean.
- `File.list(directory)` - Returns an array of file and directory names contained within the requested folder path.
