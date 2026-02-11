# CursorScript 🚀

CursorScript is a dynamic, interpreted programming language written in TypeScript and powered by the [Bun](https://bun.sh) runtime. It features a clean syntax, first-class functions, closures, and object-oriented capabilities, making it a modern playground for language concepts.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.0.1-green.svg)

## Features ✨

- **Simple Syntax**: derived from modern JavaScript/TypeScript conventions.
- **First-Class Functions**: Support for closures, nested functions, and higher-order functions.
- **Object Literals**: JSON-like object definitions with nested support.
- **Built-in Libraries**: Includes `Math` and `Game` libraries for advanced logic. Read the [API Documentation](API.md) 📖.
- **REPL**: Interactive Read-Eval-Print Loop for quick experimentation.
- **Cross-Platform**: Builds native binaries for Windows, macOS, and Linux.

## Getting Started 📦

### Prerequisites

You need [Bun](https://bun.sh/) installed on your machine to build and run the source code.

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
```

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/naveenpoddar/cursorscript.git
   cd CursorPP
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

## Usage 🛠️

### Running the REPL

To start the interactive shell, run the interpreter without any arguments:

```bash
bun run cursorx
```

### Running a Script

To execute a `.cursor` file, pass the file path as an argument:

```bash
bun run cursorx ./test/Main.cursor
```

## Building Binaries 🏗️

You can compile CursorScript into standalone executables for multiple platforms using the build script.

```bash
bun run build
```

This will generate the following binaries in the `./dist` folder:

- `cursorscript-linux-x64`
- `cursorscript-linux-arm64`
- `cursorscript-darwin-x64` (macOS Intel)
- `cursorscript-darwin-arm64` (macOS Silicon)
- `cursorscript-windows-x64.exe`

## Syntax Example 📝

Here's a snippet demonstrating variables, objects, and closures in CursorScript:

```cursor
let foo = 50 / 2;

let config = {
    version: 1,
    settings: {
        debug: true,
        maxRetries: 3
    }
};

fn makeAdder(offset) {
    fn add(x, y) {
        x + y + offset
    }
}

const addTen = makeAdder(10);
const result = addTen(5, 5); // 20

print(result, time());
```

## Project Structure 📂

- `src/` - Source code for the interpreter and runtime.
  - `frontend/` - Lexer and Parser logic.
  - `runtime/` - Environment and Interpreter implementation.
- `test/` - Example `.cursor` scripts for testing.
- `build.ts` - Build script for cross-platform compilation.

## Contributing 🤝

Contributions are welcome! Feel free to open issues or submit pull requests to improve the language.

## License

This project is licensed under the MIT License.
