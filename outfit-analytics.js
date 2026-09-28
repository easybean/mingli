const dayKey = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const nextDay = (day) => new Date(Date.parse(`${day}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);

const summarizeOutfit = (events, now = new Date()) => {
  const today = dayKey(now);
  const visits = new Map();
  for (const event of events) {
    const time = new Date(event.at);
    if (event.event !== 'outfit_visit' || typeof event.visitorId !== 'string' || !Number.isFinite(time.getTime()) || time > now) continue;
    if (!visits.has(event.visitorId)) visits.set(event.visitorId, new Set());
    visits.get(event.visitorId).add(dayKey(time));
  }
  const cohorts = new Map();
  for (const days of visits.values()) {
    const first = [...days].sort()[0];
    if (!cohorts.has(first)) cohorts.set(first, { day: first, observedBrowsers: 0, returned: 0, mature: nextDay(first) < today });
    const row = cohorts.get(first);
    row.observedBrowsers += 1;
    if (days.has(nextDay(first))) row.returned += 1;
  }
  const actions = ['outfit_open', 'outfit_personal', 'outfit_save_click', 'outfit_share_complete'].map(event => ({
    event, clicks: events.filter(item => item.event === event).length,
    sessions: new Set(events.filter(item => item.event === event).map(item => item.sessionId)).size,
  }));
  return { actions, cohorts: [...cohorts.values()].sort((a, b) => a.day.localeCompare(b.day)) };
};
module.exports = { summarizeOutfit };
