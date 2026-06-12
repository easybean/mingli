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
      <span>${item.label}</span>
    </button>
  `).join('');
};
