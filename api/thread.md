# Thread Library (`Thread`) 🧵

The `Thread` library provides high-level concurrent execution using Bun.js Workers. It allows you to run heavy logic or background tasks without blocking the main thread.

## Methods

- `Thread.spawn(path, [options])` - Spawns a new background thread running the specified script. Options can be `{ smol: boolean, name: string }` or just a boolean for `smol` mode.
- `Thread.spawnSmol(path)` - Convenience method to spawn a thread in "smol" mode (reduced memory usage).
- `Thread.list()` - Returns an array of information for all active threads.
- `Thread.sleep(ms)` - Synchronously pauses the current thread for the specified duration (useful in workers).
- `Thread.terminateAll()` - Forcefully closes all active background threads.

## Thread Object Methods

When you spawn a thread, it returns a Thread object with:

- `id` - The numeric unique ID of the thread.
- `name` - The name of the thread.
- `status` - Current state ("running", "finished", "error", "terminated").
- `send(data)` - Sends data to the thread.
- `onMessage(callback)` - Registers a callback `(data) -> { ... }` that triggers when the thread sends a reply.
- `onError(callback)` - Registers a callback triggered if the thread crashes.
- `terminate()` - Forcefully closes this specific thread.
- `isAlive()` - Returns `true` if the thread is currently running.

## Global Worker Functions

Inside a background thread, the following global functions are available:

- `send(data)` - Sends data back to the main thread.
- `onMessage(callback)` - Listens for data sent from the main thread.
- `id` - The ID of the current thread.

## Example

```cursor
let worker = Thread.spawn("./logic.cursor", { smol: true })

worker.onMessage((result) -> {
    print("Background Result:", result)
})

worker.send("Start Task")
```
