const audit = require('./data/knowledge-rules/bazi-tiaohou-audit.json');
const ELEMENT = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };

const buildAuditedGuide = (dayStem, monthBranch) => {
  const index = audit.months.indexOf(monthBranch);
  const row = Object.hasOwn(audit.rows, dayStem || '') && index >= 0 ? audit.rows[dayStem][index] : null;
  if (!row) return { favored: [], status: 'unavailable', basis: '日干或节气月支资料不完整，暂不提供个人取色。', auditVersion: audit.version };
  const [stems, locator, caveat] = row;
  const source = audit.sourceOverrides?.[`${dayStem}${monthBranch}`];
  const favored = [...new Set([...stems].map(stem => ELEMENT[stem]))].slice(0, 2);
  return {
    dayElement: ELEMENT[dayStem], favored, stems: [...stems], status: stems ? 'baseline-only' : 'conditional-paused',
    method: 'audited-monthly-baseline', auditVersion: audit.version,
    source: source?.sourceTitle || audit.sourceTitle, sourceUrl: source?.sourceUrl || audit.sourceUrl, locator: source?.locator || locator, caveat,
    verification: source?.verification || '已核对单一转录本，尚未完成影印本逐项校勘',
    basis: stems ? `日干${dayStem}、节气月支${monthBranch}：取本转录本基础论述中的${stems}作配色灵感。不是完整八字喜用判断。`
      : '此项存在尚未建模的条件或文本缺口，暂不输出个人参考色；仍可使用通用色卡。',
  };
};
module.exports = { buildAuditedGuide };
