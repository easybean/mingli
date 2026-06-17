const NAV_ICONS = {
  today: `<svg viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="4"/><line x1="11" y1="2.5" x2="11" y2="4.3"/><line x1="11" y1="17.7" x2="11" y2="19.5"/><line x1="2.5" y1="11" x2="4.3" y2="11"/><line x1="17.7" y1="11" x2="19.5" y2="11"/><line x1="4.9" y1="4.9" x2="6.2" y2="6.2"/><line x1="15.8" y1="15.8" x2="17.1" y2="17.1"/><line x1="4.9" y1="17.1" x2="6.2" y2="15.8"/><line x1="15.8" y1="6.2" x2="17.1" y2="4.9"/></svg>`,
  game: `<svg viewBox="0 0 22 22"><path d="M11 3 L19 11 L11 19 L3 11 Z"/></svg>`,
  reading: `<svg viewBox="0 0 22 22"><rect x="4.5" y="4.5" width="13" height="13" rx="1.5"/><line x1="11" y1="4.5" x2="11" y2="17.5"/></svg>`,
  chart: `<svg viewBox="0 0 22 22"><line x1="5" y1="7" x2="17" y2="7"/><line x1="5" y1="11" x2="17" y2="11"/><line x1="5" y1="15" x2="17" y2="15"/></svg>`,
  profile: `<svg viewBox="0 0 22 22"><circle cx="11" cy="8" r="3"/><path d="M5 18 a6 6 0 0 1 12 0"/></svg>`,
};

const navItems = [
  { id: 'today', label: '今日' },
  { id: 'game', label: '游戏' },
  { id: 'reading', label: '解读' },
  { id: 'chart', label: '命盘' },
  { id: 'profile', label: '我的' },
];

export const renderBottomNav = ({ root, activePage, hasData }) => {
  root.hidden = !hasData;
  root.innerHTML = navItems.map((item) => `
    <button class="nav-item ${activePage === item.id ? 'is-active' : ''}" type="button" data-page="${item.id}">
      ${NAV_ICONS[item.id] || ''}
      <span>${item.label}</span>
    </button>
  `).join('');
};
