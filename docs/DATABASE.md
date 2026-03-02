# Database Library API Documentation

The `Database` library provides built-in support for interacting with databases. Currently, it supports **SQLite** (local file-based databases using Bun's high-performance driver) and **MongoDB** (cloud or local document databases).

## SQLite Methods

To interact with a SQLite database, you initialize a connection using `Database.sqlite(path)`.

| Function | Description | Example |
| :--- | :--- | :--- |
| `Database.sqlite(path)` | Opens or creates a SQLite database at the specified path. | `let db = Database.sqlite("my_data.db");` |
| `db.query(sql, params)` | Executes a `SELECT` query and returns the rows. `params` is an array of bind variables. | `let rows = db.query("SELECT * FROM users WHERE age > ?", [18]);` |
| `db.execute(sql, params)` | Executes a mutating query (`INSERT`, `UPDATE`, `DELETE`, `CREATE`). Returns `{ lastInsertRowid, changes }`. | `db.execute("INSERT INTO users (name) VALUES (?)", ["Alice"]);` |
| `db.close()` | Closes the database connection. | `db.close();` |

### SQLite Example

```javascript
let db = Database.sqlite("test.db");

// Create a table
db.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");

// Insert data
let res = db.execute("INSERT INTO users (name) VALUES (?)", ["CursorBot"]);
print("Inserted ID:", res.lastInsertRowid);

// Query data
let users = db.query("SELECT * FROM users");
print("Users:", users);

db.close();
```

## MongoDB Methods

To interact with a MongoDB instance, you initialize a connection using `Database.mongodb(uri)`. Note that these operations are asynchronous, and you must `await` them. 

| Function | Description | Example |
| :--- | :--- | :--- |
| `Database.mongodb(uri)` | Creates a MongoDB client instance for the given connection string. | `let mongo = Database.mongodb("mongodb://localhost:27017");` |
| `await mongo.connect()` | Connects to the server. Required before other operations. | `await mongo.connect();` |
| `await mongo.find(db, collection, filter)` | Queries the collection and returns all matching documents as an array. | `let docs = await mongo.find("mydb", "users", { age: 25 });` |
| `await mongo.insertOne(db, collection, doc)` | Inserts a single document. Returns `{ insertedId }`. | `await mongo.insertOne("mydb", "users", { name: "Bob" });` |
| `await mongo.updateOne(db, collection, filter, update)` | Updates a single document. Returns `{ matchedCount, modifiedCount }`. | `await mongo.updateOne("mydb", "users", { name: "Bob" }, { age: 30 });` |
| `await mongo.deleteOne(db, collection, filter)` | Deletes a single document. Returns `{ deletedCount }`. | `await mongo.deleteOne("mydb", "users", { name: "Bob" });` |
| `await mongo.close()` | Closes the connection to the MongoDB cluster. | `await mongo.close();` |

### MongoDB Example

```javascript
// Connect to local MongoDB
let mongo = Database.mongodb("mongodb://127.0.0.1:27017");
await mongo.connect();

// Insert a document
let result = await mongo.insertOne("testdb", "users", { username: "Alice", role: "admin" });
print("Inserted ID:", result.insertedId);

// Find documents
let users = await mongo.find("testdb", "users", { role: "admin" });
print("Admin users:", users);

await mongo.close();
```
