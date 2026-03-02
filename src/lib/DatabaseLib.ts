import ConvertTOMK_Object from "./BaseLibConverter";
import { Database } from "bun:sqlite";
import { MongoClient, ObjectId } from "mongodb";
import { toNative } from "./Utils";

class SQLiteConnection {
    #db: Database;

    constructor(path: string) {
        this.#db = new Database(path);
    }

    query(sql: string, params: any = []) {
        try {
            const query = this.#db.query(sql);
            let p = toNative(params);
            if (p && typeof p === "object" && !Array.isArray(p) && p.type === "array") {
                p = p.elements || []; // Fallback if toNative didn't catch it
            }
            if (!Array.isArray(p)) p = [];
            return query.all(...p);
        } catch (e: any) {
            throw `SQLite Query Error: ${e.message}`;
        }
    }

    execute(sql: string, params: any = []) {
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
    }

    close() {
        this.#db.close();
        return true;
    }
}

class MongoDBConnection {
    #client: MongoClient;

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

    async find(dbName: string, collectionName: string, filter: any = {}) {
        try {
            const db = this.#client.db(dbName);
            const collection = db.collection(collectionName);
            return await collection.find(toNative(filter) || {}).toArray();
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

    async updateOne(dbName: string, collectionName: string, filter: any, update: any) {
        try {
            const db = this.#client.db(dbName);
            const collection = db.collection(collectionName);
            const result = await collection.updateOne(toNative(filter), { $set: toNative(update) });
            return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
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

    async close() {
        try {
            await this.#client.close();
            return true;
        } catch (e: any) {
            throw `MongoDB Close Error: ${e.message}`;
        }
    }
}

class DatabaseLib {
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
