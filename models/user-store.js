// models/user-store.js
import { join } from "node:path";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";

const file = join(process.cwd(), "models", "users.json");
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, { users: [] });
db.read();
db.data ||= { users: [] };

function write() {
  db.write();
}

export const userStore = {
  async addUser(user) {
    db.read();
    db.data.users.push(user);
    write();
    return user;
  },

  async getUserByEmail(email) {
    db.read();
    const e = String(email || "").trim().toLowerCase();
    return db.data.users.find((u) => String(u.email || "").toLowerCase() === e) || null;
  },

  async getUserById(id) {
    db.read();
    return db.data.users.find((u) => u._id === id) || null;
  },

  async updateUser(id, patch = {}) {
    db.read();
    const u = db.data.users.find((x) => x._id === id);
    if (!u) return null;
    Object.assign(u, patch);
    write();
    return u;
  },

  async list() {
    db.read();
    return [...db.data.users];
  },
};
