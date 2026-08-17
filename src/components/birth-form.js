import { escapeHtml } from './html.js';
import { todayBirthDateMax, MIN_BIRTH_DATE } from '../domain/birth-date.js';

export const renderBirthForm = ({ input, loading, error }) => {
  const maxBirthDate = todayBirthDateMax();
  return `
  <form class="card card-main home-form" data-birth-form>
    <div class="field-grid">
      <div class="field">
        <label for="gender">性别</label>
        <select id="gender" name="gender">
          <option value="女" ${input.gender === '女' ? 'selected' : ''}>女</option>
          <option value="男" ${input.gender === '男' ? 'selected' : ''}>男</option>
        </select>
      </div>
      <div class="field">
        <label for="date">出生日期</label>
        <input id="date" name="date" type="date" value="${escapeHtml(input.date)}" min="${MIN_BIRTH_DATE}" max="${maxBirthDate}" pattern="\\d{4}-\\d{2}-\\d{2}" inputmode="numeric" data-birth-date required>
      </div>
      <div class="field">
        <label for="birthTime">出生时间</label>
        <input id="birthTime" name="birthTime" type="time" value="${escapeHtml(input.birthTime)}" required>
      </div>
      <div class="field">
        <label for="birthPlace">出生地点</label>
        <input id="birthPlace" name="birthPlace" value="${escapeHtml(input.birthPlace)}" placeholder="例如：徐州" required>
      </div>
      <div class="field">
        <label for="calendar">历法</label>
        <select id="calendar" name="calendar">
          <option value="solar" ${input.calendar === 'solar' ? 'selected' : ''}>公历</option>
          <option value="lunar" ${input.calendar === 'lunar' ? 'selected' : ''}>农历</option>
        </select>
      </div>
    </div>
    <label class="row">
      <input name="trueSolarTime" type="checkbox" value="true" ${input.trueSolarTime ? 'checked' : ''}>
      <span class="page-subtitle">使用真太阳时</span>
    </label>
    <button class="button button-primary" type="submit" ${loading ? 'disabled' : ''}>
      ${loading ? '生成中...' : '生成我的关卡'}
    </button>
    ${error ? `<p class="page-subtitle">${escapeHtml(error)}</p>` : ''}
    <p class="page-subtitle">出生信息会发送至本项目服务端用于即时排盘；不做账号同步或云端存档。推演结果保存在本机浏览器，可随时一键清除；这是选择模拟，不是现实预测或职业建议。</p>
  </form>
`;
};
