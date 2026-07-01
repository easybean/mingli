const requestJson = async (url) => {
  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || '请求失败，请稍后再试。');
  }
  return payload;
};

export const fetchAstrolabe = (input) => {
  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });
  params.set('language', 'zh-CN');
  params.set('algorithm', 'default');
  params.set('calendar', input.calendar || 'solar');
  params.set('trueSolarTime', input.trueSolarTime ? 'true' : 'false');
  params.set('daylightSaving', input.daylightSaving ? 'true' : 'false');
  return requestJson(`/api/astrolabe?${params.toString()}`);
};

export const fetchCities = () => requestJson('/api/cities');

// 云存档：按匿名 ID 拉取/上传答题记录 + 命盘。失败由调用方静默兜底（保留本地）。
export const cloudLoad = (id) => requestJson(`/api/sync?id=${encodeURIComponent(id)}`);

const postJson = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '请求失败，请稍后再试。');
  }
  return data;
};

export const cloudSave = (id, payload) => postJson('/api/sync', { id, payload });

// 账号：会话走 HttpOnly Cookie，同源 fetch 自动带上，无需手动传 token。
export const authMe = () => requestJson('/api/auth/me');
export const authRegister = (payload) => postJson('/api/auth/register', payload);
export const authLogin = (payload) => postJson('/api/auth/login', payload);
export const authLogout = () => postJson('/api/auth/logout', {});
