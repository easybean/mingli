// 紫灵牌 ↔ 主 app 的【唯一耦合点】：把用户真命盘按宫取数喂给工具。
// 这是工具内部唯一允许读 astrolabeData 的地方。无命盘 → ready:false（工具降级为纯随机问事）。
// 迁小程序 / 单独输出时，只需替换本文件实现，其余模块不动。

// 六组对宫
const OPPOSITE = {
  命宫: '迁移', 迁移: '命宫',
  兄弟: '仆役', 仆役: '兄弟',
  夫妻: '官禄', 官禄: '夫妻',
  子女: '田宅', 田宅: '子女',
  财帛: '福德', 福德: '财帛',
  疾厄: '父母', 父母: '疾厄',
};

const palaceStars = (palace) => {
  if (!palace) return null;
  const majors = (palace.majorStars || []).map((s) => ({
    名: s.name,
    庙旺: s.brightness || '',
    四化: s.mutagen ? `${s.name}化${s.mutagen}` : '',
  }));
  const mutagens = [palace.majorStars, palace.minorStars, palace.adjectiveStars]
    .flat()
    .filter((s) => s && s.mutagen)
    .map((s) => `${s.name}化${s.mutagen}`);
  return {
    宫: palace.name,
    主星: majors,
    庙旺: majors[0]?.庙旺 || '',
    四化: mutagens,
    空宫: majors.length === 0,
  };
};

// createChartAdapter(astrolabeData) → { ready, getPalace(宫名), getOpposite(宫名) }
export const createChartAdapter = (astrolabeData) => {
  const palaces = (astrolabeData && astrolabeData.palaces) || [];
  const byName = new Map(palaces.map((p) => [p.name, p]));
  const ready = palaces.length > 0;

  const getPalace = (name) => (ready ? palaceStars(byName.get(name)) : null);
  const getOpposite = (name) => (ready ? palaceStars(byName.get(OPPOSITE[name])) : null);

  return { ready, getPalace, getOpposite };
};
