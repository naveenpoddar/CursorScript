# CursorScript 🚀

CursorScript is a high-performance, interpreted programming language designed for rapid **Game Development** and logic experimentation. Built on [Bun](https://bun.sh), it combines a clean, modern syntax with powerful native capabilities.

![Version](https://img.shields.io/badge/version-0.1.0-green.svg) ![Type](https://img.shields.io/badge/environment-GameDev-orange.svg)

## Why CursorScript? ✨


* **🚀 Native Windowing**: Create windows, handle hardware-accelerated drawing, and capture input (keyboard/mouse) natively via `WindowLib`.
* **⚡ Logical Gates**: First-class support for `&&` (AND), `||` (OR), and `!` (NOT) with short-circuiting.
* **📦 Data Structures**: Support for nested **Objects** and dynamic **Arrays** (`push`, `pop`, `shift`, `unshift`, `len`).
* **🔄 Control Flow**: Powerful `if`/`else` branches and `while` loops for complex simulation logic.
* **🛡️ Strict & Clean**: Smart semicolon rules—semicolons are required **only** on `let` and `const` declarations. Expressions and blocks are clean.
* **🧩 VS Code Integration**: Seamless support with the CursorScript VS Code extension for syntax highlighting and snippets.
* **λ Lambda Functions**: Higher-order functions with arrow syntax `(a, b) -> { a + b }`.
* **📦 Module System**: Support for `import` and `export` to organize code into multiple files.
* **🌐 Network Library**: Built-in HTTP client for fetching data with async callback support.

## Getting Started 📦

### Installation

#### Linux & MacOS

```bash
curl -fsSL https://raw.githubusercontent.com/naveenpoddar/cursorscript/main/install.sh | bash
```

#### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/naveenpoddar/cursorscript/main/install.ps1 | iex
```

### IDE Support (VS Code Extension) 🧩

To significantly improve your development experience, install the official CursorScript extension:

* **For Cursor / Google Antigravity / Open Source IDEs**: [Open VSX Registry](https://open-vsx.org/extension/naveenpoddar/cursorscript)
* **For Official Visual Studio Code**: [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=NaveenPoddar.cursorscript)

Features include syntax highlighting, intelligent snippets, and code formatting.

### Manual Installation (From Source)

#### Prerequisites

You need [Bun](https://bun.sh/) installed.

1. `git clone https://github.com/naveenpoddar/cursorscript.git`
2. `cd CursorPP`
3. `bun install`

### Detailed API Documentation 📖

For a full list of built-in libraries, global functions, and language features, please visit the [**API Documentation Reference**](api-doc.md).

### Run the Snake Game! 🐍

Experience the full power of CursorScript by running our reference game:

```bash
cursorx ./test/test_snakegame.cursor
```

## CursorX: Package Management 📦

CursorScript comes with a built-in package manager called **CursorX** to manage external modules and dependencies.

### Commands

| Command                        | Description                                         |
| ------------------------------ | --------------------------------------------------- |
| `cursorx init`                 | Initialize a new project with a `cursor.json` file. |
| `cursorx install <github-url>` | Install a dependency from a GitHub repository.      |
| `cursorx install`              | Install all dependencies listed in `cursor.json`.   |
| `cursorx remove <slug>`        | Remove a dependency.                                |

### Creating a Package 📦

To create a reusable CursorScript package:

1.  **Initialize your project**:

    ```bash
    cursorx init
    ```

    This creates a `cursor.json` file in your root directory.
2.  **Configure your package**: Edit `cursor.json` to define your package name and entry point:

    ```json
    {
      "name": "my-cool-package",
      "version": "1.0.0",
      "main": "src/index.cursor"
    }
    ```
3.  **Export your code**: In your `main` file (e.g., `src/index.cursor`), export the functions or variables you want to share:

    ```cursor
    export fn sayHello(name) {
        print("Hello, " + name)
    }
    ```
4. **Publish to GitHub**: Push your project to a public GitHub repository.

### Installing a Package 📦

Other users can install your package by using its GitHub repository link:

```bash
cursorx install https://github.com/username/repo-name
```

### Using Packages

External packages are installed in the `.cursorx` directory and can be imported directly using the name defined in their `cursor.json`:

```cursor
import { sayHello } from "my-cool-package"
```

## Syntax At A Glance 📝

```cursor
Window.create(600, 600, "Demo Window")

let player = { x: 10, y: 10 };
let speed = 5;

fn update() {
    Window.clear("black")

    // Logic Gates and Input
    if (Window.getKeyDown("ArrowUp") && player.y > 0) {
        player.y = player.y - speed
    }

    Window.setColor("green")
    Window.drawRect(player.x, player.y, 20, 20)
}

Window.onUpdate(update)
```

## Language Features 🛠️

### Logical Operators (Gates)

Combine conditions naturally: `if (score > 100 || time() > 1000) { ... }`

### Array Management

```cursor
let enemies = [];
push(enemies, { id: 1 });
print(len(enemies)); // 1
```

### Semicolon Rules

* **REQUIRED**: After variable declarations (`let x = 10;`).
* **OPTIONAL/EXCLUDED**: After function calls, `if` blocks, and `while` loops.

## Quick Syntax Guide 📖

| Feature           | Syntax                                |
| ----------------- | ------------------------------------- |
| Feature           | Syntax                                |
| :---------------- | :------------------------------------ |
| **Variables**     | `let x = 10;` (Required `;`)          |
| **Constants**     | `const VELOCITY = 5;`                 |
| **Functions**     | `fn add(a, b) { a + b }`              |
| **If/Else**       | `if (x > 0) { ... } else { ... }`     |
| **While Loop**    | `while (i < 10) { i = i + 1 }`        |
| **Lambdas**       | `(a, b) -> { a + b }`                 |
| **Modules**       | `import { x } from "pkg"` or `./file` |
| **Arrays**        | `let arr = [1, 2, 3];`                |
| **Logic**         | `&&`, `\|\|`, `!`                     |
| **Member Access** | `obj.prop` or `arr[0]`                |

## Project Structure 📂

* `src/frontend/` - High-speed Lexer and Recursive Descent Parser.
* `src/runtime/` - Scoped environment and short-circuiting evaluator.
* `src/lib/` - Native bridges (`WindowLib`, `MathLib`).
* `test/` - Reference implementations like **Snake Game** and logic tests.

## Contribution

Built with ❤️ by the CursorScript team. Open an issue or PR to help make it even better.
