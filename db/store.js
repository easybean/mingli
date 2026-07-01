// 轻量持久化层：第一版用单个 JSON 文件 + 原子写（temp + rename），零外部依赖、
// npm run verify 不受影响。流量上来后只换本模块内部实现（如 SQLite），路由不动。
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'app-store.json');

const emptyDb = () => ({ users: {}, usersByEmail: {}, saves: {}, seq: { user: 0 } });

let db = emptyDb();
try {
  db = { ...emptyDb(), ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) };
} catch {
  // 首次启动尚无文件：用空库，第一次写入时落盘。
}

const flush = () => {
  try {
    const tmp = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db));
    fs.renameSync(tmp, DB_FILE);
  } catch {
    // 磁盘不可写时仍以内存态服务本次进程，不抛错打断请求。
  }
};

// 容量保护：整个库常驻内存且每次写都重写文件，必须给 key 总数封顶，
// 否则有人灌海量随机 id 就能撑爆内存/磁盘。已有 key 的更新永远放行。
const MAX_SAVES = 50000;
let saveCount = Object.keys(db.saves).length;

// —— 用户存档（answer records / 命盘）按 ownerKey 存取。ownerKey 现为匿名 ID，
//    将来登录后改为 user:<id>，匿名数据迁移见 reassignSave。 ——
const getSave = (ownerKey) => db.saves[ownerKey] || null;

// 写入成功返回记录；容量已满且为新 key 时返回 null（调用方应回 507）。
const putSave = (ownerKey, payload) => {
  const isNew = !db.saves[ownerKey];
  if (isNew && saveCount >= MAX_SAVES) return null;
  const record = { ownerKey, payload, updatedAt: new Date().toISOString() };
  db.saves[ownerKey] = record;
  if (isNew) saveCount += 1;
  flush();
  return record;
};

const reassignSave = (fromKey, toKey) => {
  const source = db.saves[fromKey];
  if (!source) return null;
  const toIsNew = !db.saves[toKey];
  const record = { ...source, ownerKey: toKey, updatedAt: new Date().toISOString() };
  db.saves[toKey] = record;
  delete db.saves[fromKey];
  saveCount += (toIsNew ? 1 : 0) - 1; // 删了 fromKey，可能新增 toKey
  flush();
  return record;
};

// —— 用户表：邮箱唯一，密码哈希由 db/auth.js 生成后传入。id 自增。 ——
const findUserByEmail = (email) => {
  const id = db.usersByEmail[String(email || '').toLowerCase()];
  return id ? db.users[id] || null : null;
};

const getUserById = (id) => db.users[id] || null;

// 邮箱已存在返回 null；否则创建并返回用户记录。
const createUser = (email, passHash) => {
  const emailLower = String(email).toLowerCase();
  if (db.usersByEmail[emailLower]) return null;
  const id = (db.seq.user += 1);
  const user = { id, email, passHash, createdAt: new Date().toISOString() };
  db.users[id] = user;
  db.usersByEmail[emailLower] = id;
  flush();
  return user;
};

module.exports = {
  getSave, putSave, reassignSave,
  findUserByEmail, getUserById, createUser,
};
