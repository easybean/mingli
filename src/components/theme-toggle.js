// 全局昼夜切换（固定右上角）。两套星象主题：夜(star) / 昼(star-day)。
// 由 main.js 渲染进 #theme-toggle，点击走 setTheme（events.js 的 bindThemeToggle）。
export const renderThemeToggle = (theme) => `
  <div class="theme-toggle-inner" role="group" aria-label="昼夜切换">
    <button class="theme-tab ${theme === 'star' ? 'is-active' : ''}" type="button" data-theme-set="star" aria-pressed="${theme === 'star'}">夜</button>
    <button class="theme-tab ${theme === 'star-day' ? 'is-active' : ''}" type="button" data-theme-set="star-day" aria-pressed="${theme === 'star-day'}">昼</button>
  </div>
`;
