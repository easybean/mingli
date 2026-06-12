export const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export const tags = (items = []) => items
  .filter(Boolean)
  .map((item, index) => `<span class="tag ${index === 0 ? 'tag-primary' : ''}">${escapeHtml(item)}</span>`)
  .join('');
