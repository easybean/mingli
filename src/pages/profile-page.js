import { escapeHtml } from '../components/html.js';

export const renderProfilePage = (state) => {
  return `
    <section class="page placeholder-page">
      <header class="page-header">
        <h1 class="page-title">我的</h1>
        <p class="page-subtitle">你的出生信息、推演进度和主题设置只保存在这台设备的浏览器中。</p>
      </header>

      <section class="account-card">
        <div class="page-kicker page-kicker--muted">本机数据</div>
        <p class="focus-hint">这里不提供登录、注册或云端同步入口；你可以随时清除本机保存的命盘与推演进度。</p>
      </section>

      <section class="accessory-card">
        <button
          class="accessory-toggle"
          type="button"
          data-daily-outfit="personal"
        >
          <span class="accessory-toggle-text">
            <span class="accessory-toggle-title">我的搭配 · 穿什么，戴什么</span>
            <span class="accessory-toggle-sub">八字调候配色参考 · 衣服和配饰一起搭</span>
          </span>
          <span class="accessory-toggle-icon" aria-hidden="true">›</span>
        </button>
      </section>

      <section class="accessory-card">
        <button class="accessory-toggle" type="button" data-ziling-open>
          <span class="accessory-toggle-text">
            <span class="accessory-toggle-title">紫灵牌问事 ✦</span>
            <span class="accessory-toggle-sub">紫微五星成阵，为心中一事抽牌问趋势 · 趣味占卜</span>
          </span>
          <span class="accessory-toggle-icon" aria-hidden="true">›</span>
        </button>
      </section>

      ${state.astrolabeData ? `
        <section class="birth-reset">
          <div class="page-kicker page-kicker--muted">出生信息</div>
          <p class="birth-reset-summary">${escapeHtml(state.astrolabeData.summary?.solarDate || '')}${state.astrolabeData.summary?.time ? ` · ${escapeHtml(state.astrolabeData.summary.time)}` : ''}${state.astrolabeData.input?.birthPlace ? ` · ${escapeHtml(state.astrolabeData.input.birthPlace)}` : ''}</p>
          <button class="button button-secondary" type="button" data-reset-chart>重新填写出生信息</button>
          <p class="focus-hint">会清掉当前命盘和闯关进度，回到出生表单重新生成。</p>
        </section>
      ` : ''}

      <button class="button button-primary" type="button" data-page="work">返回首页</button>
    </section>
  `;
};
