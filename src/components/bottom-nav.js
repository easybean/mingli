const NAV_ICONS = {
  work: `<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M4 18.5V8.5h14v10"/><path d="M8 8.5V6.2c0-1.2 1.1-2.2 2.5-2.2h1c1.4 0 2.5 1 2.5 2.2v2.3"/><path d="M4 12h14"/><path d="M9 12v2h4v-2"/></svg>`,
  chart: `<svg viewBox="0 0 22 22"><line x1="5" y1="7" x2="17" y2="7"/><line x1="5" y1="11" x2="17" y2="11"/><line x1="5" y1="15" x2="17" y2="15"/></svg>`,
  profile: `<svg viewBox="0 0 22 22"><circle cx="11" cy="8" r="3"/><path d="M5 18 a6 6 0 0 1 12 0"/></svg>`,
};

const navItems = [
  { id: 'work', label: '工作岔路' },
  { id: 'chart', label: '命盘' },
  { id: 'profile', label: '我的' },
];

export const renderBottomNav = ({ root, activeItem = 'work', visible = true }) => {
  root.hidden = !visible;
  root.innerHTML = navItems.map((item) => `
    <button class="nav-item ${activeItem === item.id ? 'is-active' : ''}" type="button" data-page="${item.id}" aria-current="${activeItem === item.id ? 'page' : 'false'}">
      ${NAV_ICONS[item.id] || ''}
      <span>${item.label}</span>
    </button>
  `).join('');
};
