// 「今日运势」——每日回访理由（第二击）。
// 用今天的流日天干 vs 日主求流日十神，给一句"今天对你是怎样一天"的具体体感 + 软提示。
// 数据全前端现成：流日干支=horoscope.daily，日主=bazi.dayMaster；十神纯函数算。
// 再叠一层调候喜用：流日五行落在喜用上，标一句"顺势"。文案守约束：说倾向不说命定。

import { tenGod } from '../ten-god.js';

const STEM_ELEMENT = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

// 流日十神 → 今天的体感 + 软提示（宜/别）
const FORTUNE = {
  比肩: '今天适合自己拿主意、独立把事推进，但也容易跟人暗暗较劲——该坚持的坚持，别为争口气把事僵住。',
  劫财: '今天行动力很旺，也容易冲动花钱、揽事上身——该出手就出手，但大额决定先压一压再说。',
  食神: '今天状态是松的、出活顺，适合慢慢把手头的事做细做好——也别光顾着干，记得好好吃饭、对自己好点。',
  伤官: '今天表达欲和才气都在线，适合展示、输出、秀一把——但话别太冲，今天的你容易一不小心顶到人。',
  偏财: '今天容易有意外的钱、机会或人脉冒出来，你的嗅觉也灵——放亮眼睛去抓，但别上头乱投、乱许诺。',
  正财: '今天适合务实地把账算清、把活干扎实，稳扎稳打的事最有回报——别惦记一口吃成胖子。',
  七杀: '今天压力或硬茬子容易找上门，而这正是你顶上去的时候——迎着难上能立住，但别硬到伤了自己。',
  正官: '今天讲规矩、讲名分的事会冒头，适合处理正事、对接上级、把流程走正——别图省事抄近道。',
  偏印: '今天容易想得深、想得多，适合独处、钻研、学点偏门的东西——但别钻进牛角尖，也别忘了吃饭睡觉。',
  正印: '今天适合学习、休整、靠一靠靠谱的人，是回血的一天——别硬扛，该求助求助、该歇就歇。',
};

export const createTodayFortuneViewModel = (state) => {
  const data = state.astrolabeData;
  const daily = data?.horoscope?.daily;
  const dayStem = data?.bazi?.dayMaster?.stem;
  const flowStem = daily?.heavenlyStem;
  if (!dayStem || !flowStem) return { ready: false };

  const god = tenGod(dayStem, flowStem);
  const line = FORTUNE[god];
  if (!god || !line) return { ready: false };

  const ganZhi = `${flowStem}${daily.earthlyBranch || ''}`;
  const flowElement = STEM_ELEMENT[flowStem];
  const favored = data?.reading?.fiveElement?.favored || [];
  const inFavored = flowElement && favored.includes(flowElement);

  return {
    ready: true,
    kicker: '今日运势',
    ganZhi,
    label: `${god}日`,
    line,
    favoredHint: inFavored
      ? `今天走的是「${flowElement}」气，正对你的喜用——顺势使，会比平时省力。`
      : '',
  };
};
