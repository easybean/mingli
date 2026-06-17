import { escapeHtml } from './html.js';

export const renderFocusPicker = (options = []) => `
  <div class="focus-picker" role="group" aria-label="今日关注主题">
    ${options.map((item) => {
      const unavailable = item.available === false;
      return `
      <button
        class="focus-chip ${item.selected ? 'is-selected' : ''} ${unavailable ? 'is-unavailable' : ''}"
        type="button"
        data-today-focus="${escapeHtml(item.id)}"
        ${unavailable ? `disabled aria-disabled="true" title="今天命盘没有「${escapeHtml(item.label)}」这道题"` : ''}
      >
        ${escapeHtml(item.label)}
      </button>
    `;
    }).join('')}
  </div>
`;
