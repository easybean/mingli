const STEM_ELEMENTS = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};

const STEM_YANG = {
  甲: true,
  乙: false,
  丙: true,
  丁: false,
  戊: true,
  己: false,
  庚: true,
  辛: false,
  壬: true,
  癸: false,
};

const GENERATES = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
};

const CONTROLS = {
  木: '土',
  火: '金',
  土: '水',
  金: '木',
  水: '火',
};

const tenGod = (dayStem, targetStem) => {
  const dayElement = STEM_ELEMENTS[dayStem];
  const targetElement = STEM_ELEMENTS[targetStem];
  const samePolarity = STEM_YANG[dayStem] === STEM_YANG[targetStem];

  if (!dayElement || !targetElement) {
    return '';
  }
  if (dayElement === targetElement) {
    return samePolarity ? '比肩' : '劫财';
  }
  if (GENERATES[dayElement] === targetElement) {
    return samePolarity ? '食神' : '伤官';
  }
  if (GENERATES[targetElement] === dayElement) {
    return samePolarity ? '偏印' : '正印';
  }
  if (CONTROLS[dayElement] === targetElement) {
    return samePolarity ? '偏财' : '正财';
  }
  if (CONTROLS[targetElement] === dayElement) {
    return samePolarity ? '七杀' : '正官';
  }
  return '';
};

module.exports = {
  tenGod,
  STEM_ELEMENTS,
  STEM_YANG,
  GENERATES,
  CONTROLS,
};
