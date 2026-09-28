export const OUTFIT_SCENES = { everyday: '日常', work: '通勤', accent: '只加配饰' };

export const buildPersonalOutfit = (data, favored, selectedElement, scene = 'everyday') => {
  const groups = [...new Set(favored)].map(element => data.groups.find(group => group.element === element)).filter(Boolean);
  if (!groups.length) return null;
  const top = groups.find(group => group.element === selectedElement) || groups[0];
  const style = Object.hasOwn(OUTFIT_SCENES, scene) ? scene : 'everyday';
  const looks = {
    everyday: [`${top.colors[0]}上衣 ＋ 日常中性色长裤`, `基础款衣服 ＋ ${top.colors[1]}包或表带`],
    work: [`${top.colors[0]}衬衫 ＋ 深灰直筒裤`, `素色外套 ＋ ${top.colors[1]}内搭`],
    accent: [`已有的基础款 ＋ ${top.colors[0]}包袋`, `不换整套，用${top.colors[1]}表带点缀`],
  }[style];
  return { ...data, personal: true, groups: [top], scene: style, sceneLabel: OUTFIT_SCENES[style],
    referenceColors: groups.map(group => group.colors.join(' / ')),
    overlap: groups.some(group => group.element === data.groups[0].element),
    looks, rule: '个人版 · 八字调候配色参考' };
};

export const outfitShareText = data => [
  `${data.date}｜${data.personal ? '我的五行搭配' : '今日五行色卡'}`,
  `配色灵感：${data.groups[0].colors.join('、')}`,
  ...(data.personal ? [`搭配场景：${data.sceneLabel}`] : []),
  ...data.looks,
  '穿得舒服、自己喜欢更重要。民俗配色参考，不代表吉凶或收益。',
  'MINGLI · https://ming.mimedtech.com/',
].join('\n');
