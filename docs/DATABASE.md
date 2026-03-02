# Database Library API Documentation

The `Database` library provides built-in support for interacting with databases. Currently, it supports **SQLite** (local file-based databases using Bun's high-performance driver) and **MongoDB** (cloud or local document databases).

---

## Validation Layer
The Database library exposes a utility schema validator to verify JSON payloads before inserting them into a database.

| Function | Description |
| :--- | :--- |
| `Database.validation(schema)` | Returns a `CursorSchema` object. Valid types are: `string`, `number`. Optional rules: `required`, `minLength`, `maxLength`, `min`, `max`, `pattern`, `enum`. |
| `schema.validate(data)` | Returns an array `[isValid, errorsArray]`. |

**Example:**
```javascript
let schema = Database.validation({
    username: { type: "string", required: true, minLength: 3 },
    age: { type: "number", min: 18 }
});

let result = schema.validate({ username: "ai", age: 15 });
let isValid = result[0]; // false
let errors = result[1]; // [{ field: "age", message: "minimum value is 18" }]
```

---

## SQLite Connection

To interact with a SQLite database, initialize a connection using `Database.sqlite(path)`.

`let db = Database.sqlite("my_data.db"); // Use ":memory:" for RAM-only Database.`

### 1. Basic Operations
| Function | Description |
| :--- | :--- |
| `db.query(sql, params)` | Executes a `SELECT` query and returns the rows as an array. |
| `db.execute(sql, params)` | Executes a mutating query (`INSERT`, `UPDATE`, `DELETE`, `CREATE`). Returns `{ lastInsertRowid, changes }`. |
| `db.isHealthy()` | Returns `true` if the database string works by invoking `SELECT 1`. |
| `db.close()` | Closes the database connection safely. |

### 2. Quick Helpers
| Function | Description |
| :--- | :--- |
| `db.findOne(table, whereClause, params)` | Similar to query, but appended with `LIMIT 1` and returns the single row or null. |
| `db.count(table, whereClause, params)` | Returns the exact `COUNT(*)` as an integer. |
| `db.exists(table, whereClause, params)` | Returns `true` if `count > 0`. |

### 3. Inserting, Updating, & Deleting Maps
| Function | Description |
| :--- | :--- |
| `db.insert(table, dataMap)` | Safely inserts key-values binding parameters. Returns `{ lastInsertRowid, changes }`. |
| `db.update(table, whereClause, params, updateData)` | Maps data keys sequentially. Identical to `updateMany`. |
| `db.delete(table, whereClause, params)` | Exerts simple deletes using standard parameters. |
| `db.upsert(table, uniqueKeysArray, insertData)` | Built-in wrapper for `ON CONFLICT` replacing rows or inserting cleanly. |

### 4. Bulk Operations
| Function | Description |
| :--- | :--- |
| `db.insertMany(table, rowArrays)` | Safely wraps batch insertions into a single mapped Database transaction. |
| `db.updateMany(table, whereClause, params, updateData)` | Batch queries `SET x = ?`. Maps key values dynamically. |
| `db.deleteMany(table, whereClause, params)` | Resolves multiple record drops. Evaluates down to `DELETE`. |

### 5. Advanced Configuration (Phase 2 & 3)
| Function | Description |
| :--- | :--- |
| `db.enableTimestamps(table, fieldsArray?)` | Auto-injects `created_at` and `updated_at` (default ISO strings) to helpers on the specified table. |
| `db.enableSoftDelete(table, column?)` | Points simple `.delete` routes towards `UPDATE deleted_at = NOW()`. Suppresses mapping in `.query()`. |
| `db.onlyTrashed(table)` | Reverses soft delete query mapping specifically searching for non-null drop maps. |
| `db.restoreTrashed(table, whereClause, params)` | Recovers matched rows reverting deleted_at to Null. |
| `db.forceDelete(table, whereClause, params)` | Executes a physical hard-delete despite soft-delete options. |
| `db.paginate(table, page, limit, options?)` | Returns `{ data, total, pages, currentPage, perPage, hasNext }`. |
| `db.enableCache(options?)` | Turns on in-memory LRU Query storage map. |
| `db.cacheQuery(sql, params, ttl?)` | Identical to `db.query` but writes result array blocks to Map limits utilizing optional TTL timeouts. |
| `db.clearCache() / db.getCacheStats()` | Purges TTL Map limits / Reads current `[hits, misses, size]`. |
| `db.insertJSON / updateJSON / getJSON` | Parses standard Javascript JSON sub-trees directly within fields safely avoiding string constraints. |

### 6. Transactions & System Ops
| Function | Description |
| :--- | :--- |
| `db.transaction(callback)` | Wraps multi-action SQL chains blocking async processes natively preserving integrity. Reverses upon exception. |
| `db.enableQueryLog() / getQueryLog()` | Spools a logging dictionary measuring speed (`time: ms`) and actions resolving slow commands natively. |
| `db.backup(destPath) / db.restore(source)` | Physically wraps replication logic copying out stable OS `.db` lock blocks asynchronously to save states. |

---

## MongoDB Connection

To interact with a MongoDB instance, initialize connection streams asynchronously returning Cursor Promises.

`let mongo = Database.mongodb("mongodb://127.0.0.1:27017");`

### Core Commands
| Function | Description |
| :--- | :--- |
| `await mongo.connect()` | Connects to the server. Required before other operations. |
| `await mongo.ping()` | Pings the `admin` db returning millisecond latency counts. |
| `await mongo.find(db, collection, filter, options?)` | Queries the collection. `options` map natively allowing `{ sort, skip, limit, projection }`. |
| `await mongo.insertOne` / `insertMany` | Pushes single mapped docs or arrays returning `insertedId`/`insertedCount`. |
| `await mongo.updateOne` / `updateMany` | Resolves modifying commands returning matched metadata. Supports `{upsert: true}` inside `options`. |
| `await mongo.deleteOne` / `deleteMany` | Clears target paths natively mapping filter nodes. |
| `await mongo.findOne`, `count`, `exists` | Aggregates simple validation parameters reducing syntax. |

### Advanced MongoDB Operations
| Function | Description |
| :--- | :--- |
| `await mongo.upsert(db, coll, filter, update)` | Shorthand function mapping straight to `{upsert: true}` safely. |
| `await mongo.aggregate(db, coll, pipeline_Array)` | Natively triggers the aggregate pipeline processing complex data matches. |
| `await mongo.bulkWrite(db, coll, operationsArray)` | Triggers complex multi-action instructions natively bridging Cursor Objects downward to the DB node array handler. |
| `await mongo.cachedFind(...)` | Uses LRU internal hashing exactly like SQLite `cacheQuery` reducing network strain for massive fetch loads. |
| `await mongo.paginate(..)` | Maps straightforward chunk blocks resolving matching count arrays precisely natively checking filters. |
| `await mongo.startSession()` | Maps to isolated Transaction clusters bridging `withTransaction(() => actions)` reliably. |

`await mongo.close()` must be called upon script teardown to successfully destroy connection bounds preserving server side I/O pools correctly securely.
