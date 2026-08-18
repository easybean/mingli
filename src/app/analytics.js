import { postAnalyticsEvent } from '../api/mingli-api.js';

const SESSION_KEY = 'mingli.analytics.session.v1';
const newSessionId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : null);

const sessionId = () => {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) { id = newSessionId(); if (id) sessionStorage.setItem(SESSION_KEY, id); }
    return id;
  } catch { return null; }
};

// Do not accept an arbitrary payload here. The server repeats this allowlist.
export const track = (event, fields = {}) => {
  const id = sessionId();
  if (!id) return;
  postAnalyticsEvent({ event, sessionId: id, ...fields }).catch(() => {});
};
