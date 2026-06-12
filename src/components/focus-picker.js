import { escapeHtml } from './html.js';

export const renderFocusPicker = (options = []) => `
  <div class="focus-picker" role="group" aria-label="今日关注主题">
    ${options.map((item) => `
      <button
        class="focus-chip ${item.selected ? 'is-selected' : ''}"
        type="button"
        data-today-focus="${escapeHtml(item.id)}"
      >
        ${escapeHtml(item.label)}
      </button>
    `).join('')}
  </div>
`;
