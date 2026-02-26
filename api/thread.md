# Thread Library (`Thread`) 🧵

## Methods Index

- [spawn](#threadspawnpath-options) | [spawnSmol](#threadspawnsmolpath) | [sleep](#threadsleepms) | [terminateAll](#threadterminateall) | [list](#threadlist)
- [send](#workersenddata) | [onMessage](#workeronmessagecallback) | [onError](#workeronerrorcallback) | [isAlive](#workerisalive) | [getStatus](#workergetstatus) | [terminate](#workerterminate) | [getInfo](#workergetinfo)

## Methods

### `Thread.spawn(path, [options])`

- **Example**: `let worker = Thread.spawn("./worker.cursor", { smol: true });`

### `Thread.spawnSmol(path)`

- **Example**: `let worker = Thread.spawnSmol("./tiny.cursor");`

### `Thread.sleep(ms)`

- **Example**: `Thread.sleep(1000);`

### `Thread.terminateAll()`

- **Example**: `Thread.terminateAll();`

### `Thread.list()`

- **Example**: `let threads = Thread.list();`

---

## Thread Object Methods

### `worker.send(data)`

- **Example**: `worker.send({ task: "compute" });`

### `worker.onMessage(callback)`

- **Example**: `worker.onMessage((msg) -> print("Got:", msg));`

### `worker.onError(callback)`

- **Example**: `worker.onError((err) -> print("Error:", err));`

### `worker.isAlive()`

- **Example**: `if (worker.isAlive()) { /* ... */ }`

### `worker.getStatus()`

- **Example**: `let s = worker.getStatus();`

### `worker.terminate()`

- **Example**: `worker.terminate();`

### `worker.getInfo()`

- **Example**: `let info = worker.getInfo();`
