const THEME_OPTIONS = [
  { id: 'star', name: '星象', desc: '深空星图 · 北斗指紫微 · 八卦缓旋 · 玻璃卡片' },
  { id: 'dark', name: '深暖墨金', desc: '近黑墨底 · 金色点缀 · 暗色奢华' },
  { id: 'ink', name: '水墨禅意', desc: '宣纸浅底 · 若有若无的青 · 大量留白' },
];

export const renderProfilePage = (state) => {
  const current = state.ui.theme;
  return `
    <section class="page placeholder-page">
      <header class="page-header">
        <h1 class="page-title">我的</h1>
        <p class="page-subtitle">这里后续承载出生信息、当前路线、设置和说明，避免首页堆太多内容。</p>
      </header>

      <section class="theme-switch">
        <div class="page-kicker page-kicker--muted">外观风格</div>
        <div class="theme-option-list">
          ${THEME_OPTIONS.map((opt) => `
            <button
              class="theme-option ${current === opt.id ? 'is-active' : ''}"
              type="button"
              data-theme-set="${opt.id}"
              aria-pressed="${current === opt.id}"
            >
              <span class="theme-swatch theme-swatch--${opt.id}" aria-hidden="true"></span>
              <span class="theme-option-text">
                <span class="theme-option-name">${opt.name}</span>
                <span class="theme-option-desc">${opt.desc}</span>
              </span>
              <span class="theme-option-check" aria-hidden="true"></span>
            </button>
          `).join('')}
        </div>
        <p class="focus-hint">切换会立即生效，并记住你的选择。</p>
      </section>

      <button class="button button-primary" type="button" data-page="today">返回今日</button>
    </section>
  `;
};
