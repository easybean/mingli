import { postAnalyticsEvent } from '../api/mingli-api.js';

const SESSION_KEY = 'mingli.analytics.session.v1';
const RETENTION_KEY = 'mingli.analytics.outfit-retention.v1';
const RETENTION_TTL = 30 * 86400000;
const newSessionId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : null);

const sessionId = () => {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) { id = newSessionId(); if (id) sessionStorage.setItem(SESSION_KEY, id); }
    return id;
  } catch { return null; }
};

export const outfitRetentionEnabled = () => {
  try {
    const value = JSON.parse(localStorage.getItem(RETENTION_KEY) || 'null');
    if (value && typeof value.id === 'string' && Number.isFinite(value.expires) && value.expires > Date.now() && value.expires <= Date.now() + RETENTION_TTL) return true;
    localStorage.removeItem(RETENTION_KEY);
  } catch { /* Storage can be disabled. Never block the feature. */ }
  return false;
};

export const setOutfitRetention = (enabled) => {
  try {
    if (!enabled) localStorage.removeItem(RETENTION_KEY);
    else if (!outfitRetentionEnabled()) {
      const id = newSessionId();
      if (id) localStorage.setItem(RETENTION_KEY, JSON.stringify({ id, expires: Date.now() + RETENTION_TTL }));
    }
  } catch { /* Consent cannot persist, so do not send a visitor identifier. */ }
  return outfitRetentionEnabled();
};

export const trackOutfitVisit = () => {
  if (!outfitRetentionEnabled()) return;
  try {
    const { id: visitorId } = JSON.parse(localStorage.getItem(RETENTION_KEY));
    track('outfit_visit', { visitorId });
  } catch { /* No birth fields, fingerprints, or cross-site identifiers. */ }
};

// Do not accept an arbitrary payload here. The server repeats this allowlist.
export const track = (event, fields = {}) => {
  const id = sessionId();
  if (!id) return;
  postAnalyticsEvent({ event, sessionId: id, ...fields }).catch(() => {});
};
