// 认证：密码哈希用 Node 内置 crypto.scrypt（不装 bcrypt），会话用 HMAC 签名 token。
// 零外部依赖。生产务必设 MINGLI_SECRET 环境变量，否则用不安全的开发默认值。
const crypto = require('crypto');

const SECRET = process.env.MINGLI_SECRET || 'dev-insecure-secret-change-me';
if (!process.env.MINGLI_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('[auth] 未设置 MINGLI_SECRET，正在使用开发默认密钥——上线前必须改。');
}

const SESSION_TTL_MS = 30 * 24 * 3600 * 1000; // 30 天

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, stored) => {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(test, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// token = base64url(payload).hmac，payload = { uid, exp }
const signToken = (uid) => {
  const payload = Buffer
    .from(JSON.stringify({ uid, exp: Date.now() + SESSION_TTL_MS }))
    .toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
};

const verifyToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data.exp || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
};

module.exports = {
  SESSION_TTL_MS,
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
};
