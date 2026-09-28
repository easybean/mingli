const { Solar } = require('lunar-typescript');
const ELEMENTS = {
  木: { colors: ['青绿', '鼠尾草绿', '森林绿'], hex: ['#B9C9AD', '#849A83', '#344E41'], look: ['鼠尾草绿衬衫 ＋ 深绿直筒裤', '青绿针织衫 ＋ 森林绿半裙'] },
  火: { colors: ['胭脂红', '柔粉', '莓紫'], hex: ['#AC494B', '#E7B6B6', '#79536F'], look: ['柔粉衬衫 ＋ 莓紫半裙', '胭脂红针织衫 ＋ 深紫长裤'] },
  土: { colors: ['奶油黄', '卡其', '咖棕'], hex: ['#E8D9A9', '#B9A17B', '#725446'], look: ['卡其外套 ＋ 咖棕直筒裤', '奶油黄针织衫 ＋ 浅棕半裙'] },
  金: { colors: ['暖白', '银色', '香槟金'], hex: ['#F1EEE5', '#BFC3C6', '#CCB77E'], look: ['暖白衬衫 ＋ 香槟色长裤', '白色连衣裙 ＋ 银色配饰'] },
  水: { colors: ['墨黑', '雾蓝', '深海蓝'], hex: ['#303537', '#9DAFBE', '#384E69'], look: ['雾蓝衬衫 ＋ 墨黑直筒裤', '深海蓝针织衫 ＋ 黑色半裙'] },
};
const BRANCH = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
const GENERATES = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const CONTROLS = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
const beijingDate = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
const buildDailyOutfit = (date = beijingDate()) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('请使用 YYYY-MM-DD 日期。');
  const [y, m, d] = date.split('-').map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (y < 1900 || y > 2100 || check.toISOString().slice(0, 10) !== date) throw new Error('日期无效，支持 1900—2100 年。');
  const lunar = Solar.fromYmd(y, m, d).getLunar();
  const element = BRANCH[lunar.getDayZhi()];
  const inverse = (map) => Object.keys(map).find((key) => map[key] === element);
  const groups = [
    ['大吉色', GENERATES[element], '日支五行生颜色五行'], ['次吉色', element, '与日支五行相同'],
    ['努力色', inverse(CONTROLS), '颜色五行克日支五行'], ['消耗色', inverse(GENERATES), '颜色五行生日支五行'],
    ['不宜色', CONTROLS[element], '日支五行克颜色五行'],
  ].map(([label, item, relation]) => ({ label, element: item, relation, ...ELEMENTS[item] }));
  return { date, day: lunar.getDayInGanZhi(), lunar: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`, element, groups, looks: groups[0].look, rule: '日支五行法 · 北京时间 00:00 换日', note: '民俗配色灵感，不代表吉凶或收益预测。' };
};
module.exports = { buildDailyOutfit, beijingDate };
