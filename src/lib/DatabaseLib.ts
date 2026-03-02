import ConvertTOMK_Object from "./BaseLibConverter";
import { Database } from "bun:sqlite";
import { MongoClient, ObjectId } from "mongodb";
import { toNative } from "./Utils";

class QueryCache {
    enabled = false;
    maxSize = 1000;
    ttl = 60000;
    cache = new Map<string, { data: any, expires: number }>();
    hits = 0;
    misses = 0;

    enable(options: any) {
        this.enabled = true;
        if (options?.maxSize) this.maxSize = options.maxSize;
        if (options?.ttl) this.ttl = options.ttl;
    }

    get(key: string) {
        if (!this.enabled) return null;
        const entry = this.cache.get(key);
        if (entry) {
            if (Date.now() < entry.expires) {
                this.hits++;
                return entry.data;
            } else {
                this.cache.delete(key);
            }
        }
        this.misses++;
        return null;
    }

    set(key: string, data: any, ttlOverride?: number) {
        if (!this.enabled) return;
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }
        this.cache.set(key, {
            data,
            expires: Date.now() + (ttlOverride || this.ttl)
        });
    }

    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }

    stats() {
        return { hits: this.hits, misses: this.misses, size: this.cache.size };
    }
}

class SQLiteConnection {
    #db: Database;
    #cache = new QueryCache();
    #timestamps = new Map<string, string[]>();
    #softDeletes = new Map<string, string>();

    // Phase 3 Configuration
    #queryLoggerEnabled = false;
    #queryLog: Array<{ query: string, time: number, rows?: number }> = [];
    #dbPath: string;

    constructor(path: string) {
        this.#dbPath = path;
        this.#db = new Database(path);
    }

    // --- Phase 3 Configuration Methods ---

    enableQueryLog() { this.#queryLoggerEnabled = true; }
    getQueryLog() { return this.#queryLog; }
    getSlowQueries(thresholdMs: number) {
        return this.#queryLog.filter(log => log.time > thresholdMs);
    }

    private _logQuery(sql: string, executeFunc: () => any) {
        if (!this.#queryLoggerEnabled) return executeFunc();
        const start = performance.now();
        const res = executeFunc();
        const time = performance.now() - start;
        let rows = 0;
        if (Array.isArray(res)) rows = res.length;
        else if (res && typeof res.changes === 'number') rows = res.changes;
        this.#queryLog.push({ query: sql, time, rows });
        return res;
    }

    // --- Phase 2 Configuration Methods ---

    enableCache(options: any = {}) { this.#cache.enable(toNative(options)); }
    clearCache() { this.#cache.clear(); }
    getCacheStats() { return this.#cache.stats(); }

    enableTimestamps(table: string, fields?: any) {
        let f = toNative(fields);
        if (!f || (Array.isArray(f) && typeof f[0] !== 'string')) {
            f = ["created_at", "updated_at"];
        }
        this.#timestamps.set(table, f);
    }

    enableSoftDelete(table: string, column?: any) {
        let c = toNative(column);
        if (!c || typeof c !== 'string') {
            c = "deleted_at";
        }
        this.#softDeletes.set(table, c);
    }

    private _processTimestamps(table: string, data: any, isUpdate: boolean = false) {
        const tsFields = this.#timestamps.get(table);
        if (tsFields) {
            const now = new Date().toISOString();
            if (!isUpdate && tsFields[0]) data[tsFields[0]] = now;
            if (tsFields[1]) data[tsFields[1]] = now;
        }
        return data;
    }

    // --- Core Execute ---

    query(sql: string, params: any = [], options: any = {}) {
        return this._logQuery(sql, () => {
            try {
                const opt = toNative(options) || {};
                let finalSql = sql;
                if (!opt.withTrashed) {
                    for (const [table, sdCol] of this.#softDeletes.entries()) {
                        const regex = new RegExp(`FROM\\s+${table}\\b`, 'i');
                        if (regex.test(finalSql)) {
                            if (/WHERE/i.test(finalSql)) {
                                finalSql = finalSql.replace(/WHERE/i, `WHERE ${sdCol} IS NULL AND `);
                            } else {
                                finalSql = finalSql.replace(/(ORDER BY|LIMIT|GROUP BY|$)/i, ` WHERE ${sdCol} IS NULL $1`);
                            }
                        }
                    }
                }
                const query = this.#db.query(finalSql);
                let p = toNative(params);
                if (p && typeof p === "object" && !Array.isArray(p) && p.type === "array") {
                    p = p.elements || [];
                }
                if (!Array.isArray(p)) p = [];
                return query.all(...p);
            } catch (e: any) {
                throw `SQLite Query Error: ${e.message}`;
            }
        });
    }

    cacheQuery(sql: string, params: any = [], ttl?: any) {
        const p = toNative(params) || [];
        const key = sql + JSON.stringify(p);
        const cached = this.#cache.get(key);
        if (cached) return cached;
        const result = this.query(sql, p);

        let t = toNative(ttl);
        if (typeof t !== 'number') t = undefined;

        this.#cache.set(key, result, t);
        return result;
    }

    execute(sql: string, params: any = []) {
        return this._logQuery(sql, () => {
            try {
                const query = this.#db.query(sql);
                let p = toNative(params);
                if (p && typeof p === "object" && !Array.isArray(p) && p.type === "array") {
                    p = p.elements || []; // Fallback if toNative didn't catch it
                }
                if (!Array.isArray(p)) p = [];
                const result = query.run(...p);
                return { lastInsertRowid: result.lastInsertRowid, changes: result.changes };
            } catch (e: any) {
                throw `SQLite Execute Error: ${e.message}`;
            }
        });
    }

    querySafe(sql: string, params: any = []) {
        try {
            const query = this.#db.query(sql);
            let p = toNative(params);
            if (p && typeof p === "object" && !Array.isArray(p) && p.type === "array") {
                p = p.elements || [];
            }
            if (!Array.isArray(p)) p = [];
            return [query.all(...p), null];
        } catch (e: any) {
            return [null, e.message];
        }
    }

    executeSafe(sql: string, params: any = []) {
        try {
            const query = this.#db.query(sql);
            let p = toNative(params);
            if (p && typeof p === "object" && !Array.isArray(p) && p.type === "array") {
                p = p.elements || [];
            }
            if (!Array.isArray(p)) p = [];
            const result = query.run(...p);
            return [{ lastInsertRowid: result.lastInsertRowid, changes: result.changes }, null];
        } catch (e: any) {
            return [null, e.message];
        }
    }

    insert(table: string, data: any) {
        try {
            let d = toNative(data) || {};
            d = this._processTimestamps(table, Object.assign({}, d), false);
            const keys = Object.keys(d);
            if (keys.length === 0) return { changes: 0 };
            const columns = keys.join(", ");
            const placeholders = keys.map(() => "?").join(", ");
            const values = keys.map(k => d[k]);
            const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
            const result = this.#db.query(sql).run(...values);
            return { lastInsertRowid: result.lastInsertRowid, changes: result.changes };
        } catch (e: any) {
            throw `SQLite Insert Error: ${e.message}`;
        }
    }

    update(table: string, whereClause: any, params: any[], updateData: any) {
        return this.updateMany(table, whereClause, params, updateData);
    }

    delete(table: string, whereClause: any, params: any[]) {
        return this.deleteMany(table, whereClause, params);
    }

    insertMany(table: string, rows: any[]) {
        try {
            const r = toNative(rows);
            if (!r || !Array.isArray(r) || r.length === 0) return { changes: 0 };

            const firstRow = this._processTimestamps(table, Object.assign({}, r[0]), false);
            const keys = Object.keys(firstRow);
            const columns = keys.join(", ");
            const placeholders = keys.map(() => "?").join(", ");
            const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

            const insert = this.#db.query(sql);
            let changes = 0;
            const tx = this.#db.transaction((data) => {
                for (const row of data as any[]) {
                    const rowData = this._processTimestamps(table, Object.assign({}, row), false);
                    const values = keys.map(k => rowData[k]);
                    insert.run(...values);
                    changes++;
                }
            });
            tx(r);
            return { changes };
        } catch (e: any) {
            throw `SQLite InsertMany Error: ${e.message}`;
        }
    }

    updateMany(table: string, whereClause: any, params: any[], updateData: any) {
        try {
            const upd = this._processTimestamps(table, Object.assign({}, toNative(updateData)), true);
            const keys = Object.keys(upd);
            const setClause = keys.map(k => `${k} = ?`).join(", ");
            const values = keys.map(k => upd[k]);

            let p = toNative(params) || [];
            if (!Array.isArray(p)) p = [p];

            const wc = typeof whereClause === "string" ? whereClause : "";
            const sql = `UPDATE ${table} SET ${setClause} ${wc ? 'WHERE ' + wc : ''}`;
            const query = this.#db.query(sql);
            const result = query.run(...values, ...p);
            return { changes: result.changes };
        } catch (e: any) {
            throw `SQLite UpdateMany Error: ${e.message}`;
        }
    }

    // --- Phase 3 Advanced ---

    upsert(table: string, uniqueKeys: any, insertData: any) {
        try {
            let uKeys = toNative(uniqueKeys);
            if (!Array.isArray(uKeys)) uKeys = [uKeys];

            let d = toNative(insertData) || {};
            d = this._processTimestamps(table, Object.assign({}, d), false);
            const keys = Object.keys(d);
            if (keys.length === 0) return { changes: 0 };

            const columns = keys.join(", ");
            const placeholders = keys.map(() => "?").join(", ");
            const values = keys.map(k => d[k]);

            const conflictColumns = uKeys.join(", ");

            const dUpdate = this._processTimestamps(table, Object.assign({}, d), true);
            const updateKeys = Object.keys(dUpdate).filter(k => !uKeys.includes(k));
            const updateSet = updateKeys.map(k => `${k} = excluded.${k}`).join(", ");

            const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) ON CONFLICT(${conflictColumns}) DO ${updateSet ? 'UPDATE SET ' + updateSet : 'NOTHING'}`;
            return this.execute(sql, values);
        } catch (e: any) {
            throw `SQLite Upsert Error: ${e.message}`;
        }
    }

    backup(destinationPath: string) {
        try {
            const fs = require('fs');
            // Check if we are memory DB, which requires raw backup commands or saving
            if (this.#dbPath === ':memory:') {
                throw new Error("Cannot directly backup ':memory:' database this way.");
            }
            // bun:sqlite closes DB momentarily on copy conceptually or we just OS copy it
            fs.copyFileSync(this.#dbPath, destinationPath);
            return destinationPath;
        } catch (e: any) {
            throw `SQLite Backup Error: ${e.message}`;
        }
    }

    restore(sourcePath: string) {
        try {
            const fs = require('fs');
            if (this.#dbPath === ':memory:') {
                throw new Error("Cannot directly restore into ':memory:' this way.");
            }
            this.#db.close();
            fs.copyFileSync(sourcePath, this.#dbPath);
            this.#db = new Database(this.#dbPath); // Re-open
            return true;
        } catch (e: any) {
            throw `SQLite Restore Error: ${e.message}`;
        }
    }

    deleteMany(table: string, whereClause: any, params: any[]) {
        try {
            const sdCol = this.#softDeletes.get(table);
            if (sdCol) {
                const obj: any = {};
                obj[sdCol] = new Date().toISOString();
                return this.updateMany(table, whereClause, params, obj);
            }

            let p = toNative(params) || [];
            if (!Array.isArray(p)) p = [p];
            const wc = typeof whereClause === "string" ? whereClause : "";
            const sql = `DELETE FROM ${table} ${wc ? 'WHERE ' + wc : ''}`;
            const query = this.#db.query(sql);
            const result = query.run(...p);
            return { changes: result.changes };
        } catch (e: any) {
            throw `SQLite DeleteMany Error: ${e.message}`;
        }
    }

    onlyTrashed(table: string) {
        const sdCol = this.#softDeletes.get(table);
        if (!sdCol) throw new Error(`Soft delete not enabled for ${table}`);
        return this.query(`SELECT * FROM ${table} WHERE ${sdCol} IS NOT NULL`, [], { withTrashed: true });
    }

    restoreTrashed(table: string, whereClause: any, params: any[]) {
        const sdCol = this.#softDeletes.get(table);
        if (!sdCol) throw new Error(`Soft delete not enabled for ${table}`);
        const obj: any = {};
        obj[sdCol] = null;
        return this.updateMany(table, whereClause, params, obj);
    }

    forceDelete(table: string, whereClause: any, params: any[]) {
        try {
            let p = toNative(params) || [];
            if (!Array.isArray(p)) p = [p];
            const wc = typeof whereClause === "string" ? whereClause : "";
            const sql = `DELETE FROM ${table} ${wc ? 'WHERE ' + wc : ''}`;
            const query = this.#db.query(sql);
            const result = query.run(...p);
            return { changes: result.changes };
        } catch (e: any) {
            throw `SQLite ForceDelete Error: ${e.message}`;
        }
    }

    findOne(table: string, whereClause: any = "", params: any[] = [], options: any = {}) {
        try {
            const opt = toNative(options) || {};
            const withTrashed = opt && typeof opt === 'object' && opt.withTrashed === true;
            let wc = typeof whereClause === "string" ? whereClause : "";
            const sdCol = this.#softDeletes.get(table);
            if (sdCol && !withTrashed) {
                wc = wc ? `(${wc}) AND ${sdCol} IS NULL` : `${sdCol} IS NULL`;
            }

            let p = toNative(params) || [];
            if (!Array.isArray(p)) p = [p];
            const sql = `SELECT * FROM ${table} ${wc ? 'WHERE ' + wc : ''} LIMIT 1`;
            const query = this.#db.query(sql);
            return query.get(...p);
        } catch (e: any) {
            throw `SQLite FindOne Error: ${e.message}`;
        }
    }

    count(table: string, whereClause: any = "", params: any[] = [], options: any = {}) {
        try {
            const opt = toNative(options) || {};
            const withTrashed = opt && typeof opt === 'object' && opt.withTrashed === true;
            let wc = typeof whereClause === "string" ? whereClause : "";
            const sdCol = this.#softDeletes.get(table);
            if (sdCol && !withTrashed) {
                wc = wc ? `(${wc}) AND ${sdCol} IS NULL` : `${sdCol} IS NULL`;
            }

            let p = toNative(params) || [];
            if (!Array.isArray(p)) p = [p];
            const sql = `SELECT COUNT(*) as count FROM ${table} ${wc ? 'WHERE ' + wc : ''}`;
            const query = this.#db.query(sql);
            const result = query.get(...p) as any;
            return result ? result.count : 0;
        } catch (e: any) {
            throw `SQLite Count Error: ${e.message}`;
        }
    }

    exists(table: string, whereClause: any = "", params: any[] = [], options: any = {}) {
        return this.count(table, whereClause, params, options) > 0;
    }

    async transaction(callback: any) {
        try {
            const cb = toNative(callback);
            if (typeof cb !== 'function') throw new Error("Callback must be a function");

            this.beginTransaction();
            try {
                const result = cb();
                if (result instanceof Promise) {
                    await result;
                }
                this.commit();
                return true;
            } catch (err) {
                this.rollback();
                return false;
            }
        } catch (e: any) {
            return false;
        }
    }

    paginate(table: string, page: number, perPage: number, options: any = {}) {
        try {
            const opt = toNative(options) || {};
            let sqlWhere = opt.where ? `WHERE ${opt.where}` : "";
            let sqlOrder = opt.orderBy ? `ORDER BY ${opt.orderBy}` : "";
            let p = opt.params || [];
            if (!Array.isArray(p)) p = [p];

            const sdCol = this.#softDeletes.get(table);
            if (sdCol && !opt.withTrashed) {
                if (sqlWhere) {
                    sqlWhere += ` AND ${sdCol} IS NULL`;
                } else {
                    sqlWhere = `WHERE ${sdCol} IS NULL`;
                }
            }

            const countSql = `SELECT COUNT(*) as count FROM ${table} ${sqlWhere}`;
            const countRes = this.#db.query(countSql).get(...p) as any;
            const total = countRes ? countRes.count : 0;
            const pages = Math.ceil(total / perPage);

            const offset = (page - 1) * perPage;
            const dataSql = `SELECT * FROM ${table} ${sqlWhere} ${sqlOrder} LIMIT ${perPage} OFFSET ${offset}`;
            const data = this.#db.query(dataSql).all(...p);

            return { data, total, pages, currentPage: page, perPage, hasNext: page < pages };
        } catch (e: any) {
            throw `SQLite Paginate Error: ${e.message}`;
        }
    }

    insertJSON(table: string, data: any) {
        let d = toNative(data) || {};
        const dCopy = Object.assign({}, d);
        for (const k of Object.keys(dCopy)) {
            if (typeof dCopy[k] === 'object' && dCopy[k] !== null) {
                dCopy[k] = JSON.stringify(dCopy[k]);
            }
        }
        return this.insert(table, dCopy);
    }

    updateJSON(table: string, whereClause: any, params: any[], updateData: any) {
        let d = toNative(updateData) || {};
        const dCopy = Object.assign({}, d);
        for (const k of Object.keys(dCopy)) {
            if (typeof dCopy[k] === 'object' && dCopy[k] !== null) {
                dCopy[k] = JSON.stringify(dCopy[k]);
            }
        }
        return this.updateMany(table, whereClause, params, dCopy);
    }

    getJSON(table: string, column: string, whereClause: any, params: any[]) {
        const row: any = this.findOne(table, whereClause, params);
        if (!row) return null;
        try {
            return JSON.parse(row[column]);
        } catch {
            return row[column];
        }
    }

    beginTransaction() {
        this.#db.query("BEGIN TRANSACTION").run();
        return true;
    }

    commit() {
        this.#db.query("COMMIT").run();
        return true;
    }

    rollback() {
        this.#db.query("ROLLBACK").run();
        return true;
    }

    isHealthy() {
        try {
            this.#db.query("SELECT 1").get();
            return true;
        } catch {
            return false;
        }
    }

    close() {
        this.#db.close();
        return true;
    }
}

class MongoDBConnection {
    #client: MongoClient;
    #cache = new QueryCache();

    constructor(uri: string) {
        this.#client = new MongoClient(uri);
    }

    async connect() {
        try {
            await this.#client.connect();
            return true;
        } catch (e: any) {
            throw `MongoDB Connect Error: ${e.message}`;
        }
    }

    async find(dbName: string, collectionName: string, filter: any = {}, options: any = {}) {
        try {
            const db = this.#client.db(dbName);
            const collection = db.collection(collectionName);
            const f = toNative(filter) || {};
            const opt = toNative(options) || {};

            let cursor = collection.find(f);
            if (opt.sort) cursor = cursor.sort(opt.sort);
            if (opt.skip) cursor = cursor.skip(opt.skip);
            if (opt.limit) cursor = cursor.limit(opt.limit);
            if (opt.projection) cursor = cursor.project(opt.projection);

            return await cursor.toArray();
        } catch (e: any) {
            throw `MongoDB Find Error: ${e.message}`;
        }
    }

    async insertOne(dbName: string, collectionName: string, doc: any) {
        try {
            const db = this.#client.db(dbName);
            const collection = db.collection(collectionName);
            const result = await collection.insertOne(toNative(doc));
            return { insertedId: result.insertedId.toString() };
        } catch (e: any) {
            throw `MongoDB Insert Error: ${e.message}`;
        }
    }

    async updateOne(dbName: string, collectionName: string, filter: any, update: any, options: any = {}) {
        try {
            const db = this.#client.db(dbName);
            const collection = db.collection(collectionName);
            const opt = toNative(options) || {};
            const result = await collection.updateOne(toNative(filter), { $set: toNative(update) }, opt);
            return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount, upsertedId: result.upsertedId?.toString() };
        } catch (e: any) {
            throw `MongoDB Update Error: ${e.message}`;
        }
    }

    async deleteOne(dbName: string, collectionName: string, filter: any) {
        try {
            const db = this.#client.db(dbName);
            const collection = db.collection(collectionName);
            const result = await collection.deleteOne(toNative(filter));
            return { deletedCount: result.deletedCount };
        } catch (e: any) {
            throw `MongoDB Delete Error: ${e.message}`;
        }
    }

    async insertMany(dbName: string, collectionName: string, docs: any[]) {
        try {
            const db = this.#client.db(dbName);
            const collection = db.collection(collectionName);
            const result = await collection.insertMany(toNative(docs));
            const ids: Record<number, string> = {};
            if (result.insertedIds) {
                for (const key of Object.keys(result.insertedIds!)) {
                    ids[Number(key)] = String(result.insertedIds![Number(key)]);
                }
            }
            return { insertedCount: result.insertedCount, insertedIds: ids };
        } catch (e: any) {
            throw `MongoDB InsertMany Error: ${e.message}`;
        }
    }

    async updateMany(dbName: string, collectionName: string, filter: any, update: any) {
        try {
            const db = this.#client.db(dbName);
            const collection = db.collection(collectionName);
            const result = await collection.updateMany(toNative(filter), toNative(update));
            return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
        } catch (e: any) {
            throw `MongoDB UpdateMany Error: ${e.message}`;
        }
    }

    async deleteMany(dbName: string, collectionName: string, filter: any) {
        try {
            const db = this.#client.db(dbName);
            const collection = db.collection(collectionName);
            const result = await collection.deleteMany(toNative(filter));
            return { deletedCount: result.deletedCount };
        } catch (e: any) {
            throw `MongoDB DeleteMany Error: ${e.message}`;
        }
    }

    async findOne(dbName: string, collectionName: string, filter: any = {}) {
        try {
            const db = this.#client.db(dbName);
            const collection = db.collection(collectionName);
            return await collection.findOne(toNative(filter));
        } catch (e: any) {
            throw `MongoDB FindOne Error: ${e.message}`;
        }
    }

    async count(dbName: string, collectionName: string, filter: any = {}) {
        try {
            const db = this.#client.db(dbName);
            const collection = db.collection(collectionName);
            return await collection.countDocuments(toNative(filter));
        } catch (e: any) {
            throw `MongoDB Count Error: ${e.message}`;
        }
    }

    async bulkWrite(dbName: string, collectionName: string, operations: any[], options: any = {}) {
        try {
            const db = this.#client.db(dbName);
            const collection = db.collection(collectionName);
            const ops = toNative(operations) || [];
            const opt = toNative(options) || {};
            if (!Array.isArray(ops) || ops.length === 0) return { insertedCount: 0, matchedCount: 0, modifiedCount: 0, deletedCount: 0, upsertedCount: 0 };
            const result = await collection.bulkWrite(ops, opt);
            return {
                insertedCount: result.insertedCount,
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount,
                deletedCount: result.deletedCount,
                upsertedCount: result.upsertedCount
            };
        } catch (e: any) {
            throw `MongoDB BulkWrite Error: ${e.message}`;
        }
    }

    async aggregate(dbName: string, collectionName: string, pipeline: any[]) {
        try {
            const db = this.#client.db(dbName);
            const collection = db.collection(collectionName);
            const p = toNative(pipeline) || [];
            if (!Array.isArray(p)) throw new Error("Aggregation pipeline must be an array.");
            return await collection.aggregate(p).toArray();
        } catch (e: any) {
            throw `MongoDB Aggregate Error: ${e.message}`;
        }
    }

    async upsert(dbName: string, collectionName: string, filter: any, update: any) {
        return this.updateOne(dbName, collectionName, filter, update, { upsert: true });
    }

    async exists(dbName: string, collectionName: string, filter: any = {}) {
        const count = await this.count(dbName, collectionName, filter);
        return count > 0;
    }

    async startSession() {
        try {
            const session = this.#client.startSession();
            return ConvertTOMK_Object({
                withTransaction: async (callback: any) => {
                    try {
                        const cb = toNative(callback);
                        await session.withTransaction(async () => {
                            await cb();
                        });
                        return true;
                    } catch (e: any) {
                        return false;
                    }
                },
                endSession: async () => {
                    await session.endSession();
                    return true;
                }
            });
        } catch (e: any) {
            throw `MongoDB StartSession Error: ${e.message}`;
        }
    }

    async isHealthy() {
        try {
            await this.#client.db("admin").command({ ping: 1 });
            return true;
        } catch {
            return false;
        }
    }

    async ping() {
        try {
            const start = performance.now();
            await this.#client.db("admin").command({ ping: 1 });
            return performance.now() - start;
        } catch (e: any) {
            throw `MongoDB Ping Error: ${e.message}`;
        }
    }

    async close() {
        try {
            await this.#client.close();
            return true;
        } catch (e: any) {
            throw `MongoDB Close Error: ${e.message}`;
        }
    }
}

class CursorSchema {
    #schema: any;
    constructor(s: any) { this.#schema = s; }
    validate(data: any) {
        const d = toNative(data) || {};
        const errors: any[] = [];
        for (const [field, rule] of Object.entries(this.#schema)) {
            const r: any = rule;
            const val = d[field];

            if (r.required && (val === undefined || val === null || val === "")) {
                errors.push({ field, message: "is required" });
                continue;
            }
            if (val === undefined || val === null) continue;

            if (r.type === "string" && typeof val !== "string") {
                errors.push({ field, message: "must be a string" });
            }
            if (r.type === "number" && typeof val !== "number") {
                errors.push({ field, message: "must be a number" });
            }
            if (r.minLength && typeof val === "string" && val.length < r.minLength) {
                errors.push({ field, message: `minimum length is ${r.minLength}` });
            }
            if (r.maxLength && typeof val === "string" && val.length > r.maxLength) {
                errors.push({ field, message: `maximum length is ${r.maxLength}` });
            }
            if (r.min !== undefined && typeof val === "number" && val < r.min) {
                errors.push({ field, message: `minimum value is ${r.min}` });
            }
            if (r.max !== undefined && typeof val === "number" && val > r.max) {
                errors.push({ field, message: `maximum value is ${r.max}` });
            }
            if (r.pattern && typeof val === "string") {
                const regex = new RegExp(r.pattern);
                if (!regex.test(val)) errors.push({ field, message: "does not match pattern" });
            }
            if (r.enum && Array.isArray(r.enum) && !r.enum.includes(val)) {
                errors.push({ field, message: `must be one of ${r.enum.join(', ')}` });
            }
        }
        return [errors.length === 0, errors];
    }
}

class DatabaseLib {
    validation(schemaDefinition: any) {
        const schema = toNative(schemaDefinition) || {};
        return ConvertTOMK_Object(new CursorSchema(schema));
    }

    sqlite(path: string) {
        try {
            return ConvertTOMK_Object(new SQLiteConnection(path));
        } catch (e: any) {
            throw `Failed to initialize SQLite: ${e.message}`;
        }
    }

    mongodb(uri: string) {
        try {
            return ConvertTOMK_Object(new MongoDBConnection(uri));
        } catch (e: any) {
            throw `Failed to initialize MongoDB: ${e.message}`;
        }
    }
}

export const DatabaseL = ConvertTOMK_Object(new DatabaseLib());
