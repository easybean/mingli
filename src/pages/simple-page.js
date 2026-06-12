export const renderSimplePage = ({ title, body, actionLabel = '返回今日' }) => `
  <section class="page">
    <header class="page-header">
      <h1 class="page-title">${title}</h1>
      <p class="page-subtitle">${body}</p>
    </header>
    <button class="button button-primary" type="button" data-page="today">${actionLabel}</button>
  </section>
`;
