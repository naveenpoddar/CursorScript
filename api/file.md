# File Library (`File`) 📁

## Methods Index

- [readAsync](#await-filereadasyncpath) | [writeAsync](#await-filewriteasyncpath-data) | [readBytesAsync](#await-filereadbytesasyncpath) | [listAsync](#await-filelistasyncdirectory)
- [read](#filereadpath) | [write](#filewritepath-data) | [exists](#fileexistspath) | [delete](#filedeletepath) | [list](#filelistdirectory) | [info](#fileinfopath)

## Asynchronous Methods (Recommended)

### `await File.readAsync(path)`

- **Example**: `const (data, err) = await File.readAsync("./data.txt");`

### `await File.writeAsync(path, data)`

- **Example**: `const (ok, err) = await File.writeAsync("./log.txt", "Hello");`

### `await File.readBytesAsync(path)`

- **Example**: `const (bytes, err) = await File.readBytesAsync("./image.png");`

### `await File.listAsync(directory)`

- **Example**: `const (files, err) = await File.listAsync("./docs");`

---

## Synchronous Methods

### `File.read(path)`

- **Example**: `let content = File.read("./config.json");`

### `File.write(path, data)`

- **Example**: `File.write("./save.txt", "Score: 100");`

### `File.exists(path)`

- **Example**: `if (File.exists("./data.txt")) { /* ... */ }`

### `File.delete(path)`

- **Example**: `File.delete("./temp.tmp");`

### `File.list(directory)`

- **Example**: `let list = File.list("./assets");`

### `File.info(path)`

- **Example**: `let stats = File.info("./file.txt");`
