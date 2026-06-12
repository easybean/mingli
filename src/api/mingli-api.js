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
