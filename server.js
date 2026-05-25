const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { astro } = require('iztro');
const { LunarUtil, Solar } = require('lunar-typescript');
const { buildKnowledgeProfile } = require('./knowledge');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');
const MINUTES_PER_DAY = 24 * 60;
const CHINA_STANDARD_LONGITUDE = 120;
const CITY_LONGITUDES = require('./data/city-longitudes.json');
const CITY_NAMES = Object.keys(CITY_LONGITUDES);
const CHINA_DAYLIGHT_SAVING_RANGES = [
  ['1986-5-4', '1986-9-14'],
  ['1987-4-12', '1987-9-13'],
  ['1988-4-10', '1988-9-11'],
  ['1989-4-16', '1989-9-17'],
  ['1990-4-15', '1990-9-16'],
  ['1991-4-14', '1991-9-15'],
];
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

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload, null, 2));
};

const text = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(payload);
};

const sendFile = (res, filePath) => {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      text(res, 404, 'Not found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
    }[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
};

const compactStar = (star) => ({
  name: star.name,
  type: star.type,
  scope: star.scope,
  brightness: star.brightness,
  mutagen: star.mutagen,
});

const compactPalace = (palace) => ({
  index: palace.index,
  name: palace.name,
  branch: palace.earthlyBranch,
  stem: palace.heavenlyStem,
  isBodyPalace: palace.isBodyPalace,
  isOriginalPalace: palace.isOriginalPalace,
  majorStars: palace.majorStars.map(compactStar),
  minorStars: palace.minorStars.map(compactStar),
  adjectiveStars: palace.adjectiveStars.map(compactStar),
  changsheng12: palace.changsheng12,
  boshi12: palace.boshi12,
  jiangqian12: palace.jiangqian12,
  suiqian12: palace.suiqian12,
  decadal: palace.decadal,
  ages: palace.ages,
});

const compactHoroscope = (item) => ({
  index: item.index,
  heavenlyStem: item.heavenlyStem,
  earthlyBranch: item.earthlyBranch,
  palaceNames: item.palaceNames,
  mutagen: item.mutagen,
});

const toList = (value) => (Array.isArray(value) ? value : String(value || '').split(',').filter(Boolean));

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

const ganZhiDetails = (ganZhi, dayStem) => {
  const gan = ganZhi[0];
  const zhi = ganZhi[1];
  const hiddenGan = LunarUtil.ZHI_HIDE_GAN[zhi] || [];

  return {
    ganZhi,
    gan,
    zhi,
    ganWuXing: LunarUtil.WU_XING_GAN[gan],
    zhiWuXing: LunarUtil.WU_XING_ZHI[zhi],
    ganShiShen: tenGod(dayStem, gan),
    hiddenGan,
    hiddenShiShen: hiddenGan.map((item) => tenGod(dayStem, item)),
    naYin: LunarUtil.NAYIN[ganZhi],
  };
};

const parseBool = (value) => value === 'true' || value === '1' || value === 'yes' || value === 'on';

const formatTargetDateTime = (date = new Date()) => (
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} `
  + `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
);

const parseDateParts = (date) => {
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(date);

  if (!match) {
    const err = new Error('date must use YYYY-M-D format.');
    err.statusCode = 400;
    throw err;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
};

const shiftSolarDate = (date, dayOffset) => {
  if (dayOffset === 0) {
    return date;
  }

  const { year, month, day } = parseDateParts(date);
  const shifted = new Date(Date.UTC(year, month - 1, day + dayOffset));
  return `${shifted.getUTCFullYear()}-${shifted.getUTCMonth() + 1}-${shifted.getUTCDate()}`;
};

const dateSerial = (date) => {
  const { year, month, day } = parseDateParts(date);
  return Date.UTC(year, month - 1, day);
};

const serialFromParts = (year, month, day) => Date.UTC(year, month - 1, day);

const datePartsFromSerial = (serial) => {
  const date = new Date(serial);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
};

const solarToYmd = (solar) => `${solar.getYear()}-${solar.getMonth()}-${solar.getDay()}`;

const dayOfYear = (date) => {
  const { year } = parseDateParts(date);
  return Math.floor((dateSerial(date) - Date.UTC(year, 0, 0)) / 86400000);
};

const equationOfTimeMinutes = (date) => {
  const angle = (2 * Math.PI * (dayOfYear(date) - 81)) / 364;
  return (9.87 * Math.sin(2 * angle)) - (7.53 * Math.cos(angle)) - (1.5 * Math.sin(angle));
};

const isChinaDaylightSavingDate = (date) => {
  const serial = dateSerial(date);

  return CHINA_DAYLIGHT_SAVING_RANGES.some(([start, end]) => (
    serial >= dateSerial(start) && serial <= dateSerial(end)
  ));
};

const resolveDaylightSaving = (value, date, calendar) => {
  if (value === 'true' || value === '1' || value === 'yes' || value === 'on') {
    return { mode: 'manual', enabled: true };
  }

  if (value === 'false' || value === '0' || value === 'no' || value === 'off') {
    return { mode: 'manual', enabled: false };
  }

  if (calendar === 'solar') {
    return { mode: 'auto', enabled: isChinaDaylightSavingDate(date) };
  }

  return { mode: 'auto', enabled: false };
};

const parseBirthMinutes = (birthTime, timeIndex) => {
  if (!birthTime) {
    const midpointByTimeIndex = {
      0: 30,
      12: 23 * 60 + 30,
    };
    return midpointByTimeIndex[timeIndex] ?? timeIndex * 120;
  }

  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(birthTime);

  if (!match) {
    const err = new Error('birthTime must use HH:mm format.');
    err.statusCode = 400;
    throw err;
  }

  return Number(match[1]) * 60 + Number(match[2]);
};

const timeIndexFromMinutes = (minutes) => {
  if (minutes < 60) {
    return 0;
  }

  if (minutes >= 23 * 60) {
    return 12;
  }

  return Math.floor((minutes - 60) / 120) + 1;
};

const formatClockTime = (minutes) => {
  const rounded = Math.round(minutes);
  const normalized = ((rounded % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
};

const parseLongitude = (value) => {
  if (value === null || value === '') {
    return CHINA_STANDARD_LONGITUDE;
  }

  const longitude = Number(value);

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    const err = new Error('birthLongitude must be a number from -180 to 180.');
    err.statusCode = 400;
    throw err;
  }

  return longitude;
};

const normalizePlaceName = (value) => (value || '').trim().replace(/[市省区县]/g, '');

const resolveBirthLongitude = (birthPlace, explicitLongitude, trueSolarTime) => {
  if (explicitLongitude !== null && explicitLongitude !== '') {
    return parseLongitude(explicitLongitude);
  }

  const normalizedPlace = normalizePlaceName(birthPlace || '北京');
  const matchedCity = Object.keys(CITY_LONGITUDES).find((city) => (
    normalizePlaceName(city) === normalizedPlace || normalizedPlace.includes(normalizePlaceName(city))
  ));

  if (matchedCity) {
    return CITY_LONGITUDES[matchedCity];
  }

  if (trueSolarTime) {
    const err = new Error('未识别出生地城市；使用真太阳时时请填写支持的城市名，例如 北京、上海、广州、成都、乌鲁木齐。');
    err.statusCode = 400;
    throw err;
  }

  return CHINA_STANDARD_LONGITUDE;
};

const normalizeBirthTime = ({ calendar, date, timeIndex, birthTime, daylightSaving, birthLongitude, trueSolarTime }) => {
  const inputMinutes = parseBirthMinutes(birthTime, timeIndex);
  const standardMinutesRaw = inputMinutes - (daylightSaving.enabled ? 60 : 0);
  const standardDayOffset = Math.floor(standardMinutesRaw / MINUTES_PER_DAY);
  const standardMinutes = ((standardMinutesRaw % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const standardDate = calendar === 'solar' ? shiftSolarDate(date, standardDayOffset) : date;
  const longitudeOffset = trueSolarTime ? (birthLongitude - CHINA_STANDARD_LONGITUDE) * 4 : 0;
  const equationOffset = trueSolarTime && calendar === 'solar' ? equationOfTimeMinutes(standardDate) : 0;
  const solarMinutesRaw = standardMinutes + longitudeOffset + equationOffset;
  const solarDayOffset = Math.floor(solarMinutesRaw / MINUTES_PER_DAY);
  const solarMinutes = ((solarMinutesRaw % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const totalDayOffset = standardDayOffset + solarDayOffset;

  if (calendar === 'lunar' && totalDayOffset !== 0) {
    const err = new Error('lunar time adjustment crosses date boundary; use solar date input for this case.');
    err.statusCode = 400;
    throw err;
  }

  return {
    date: calendar === 'solar' ? shiftSolarDate(date, totalDayOffset) : date,
    timeIndex: timeIndexFromMinutes(solarMinutes),
    birthTime: birthTime || null,
    daylightSaving: daylightSaving.enabled,
    daylightSavingMode: daylightSaving.mode,
    birthLongitude,
    trueSolarTime,
    standardDayOffset,
    solarDayOffset,
    dayOffset: totalDayOffset,
    standardTime: formatClockTime(standardMinutes),
    trueSolarClockTime: formatClockTime(solarMinutes),
    longitudeOffsetMinutes: Number(longitudeOffset.toFixed(2)),
    equationOfTimeMinutes: Number(equationOffset.toFixed(2)),
    estimatedFromTimeIndex: !birthTime,
  };
};

const baziPillar = (eightChar, key, label) => {
  const wuXing = eightChar[`get${key}WuXing`]();

  return {
    key,
    label,
    ganzhi: eightChar[`get${key}`](),
    gan: eightChar[`get${key}Gan`](),
    zhi: eightChar[`get${key}Zhi`](),
    wuXing,
    ganWuXing: wuXing[0],
    zhiWuXing: wuXing[1],
    ganShiShen: eightChar[`get${key}ShiShenGan`](),
    hiddenGan: toList(eightChar[`get${key}HideGan`]()),
    hiddenShiShen: toList(eightChar[`get${key}ShiShenZhi`]()),
    diShi: eightChar[`get${key}DiShi`](),
    naYin: eightChar[`get${key}NaYin`](),
    xun: eightChar[`get${key}Xun`](),
    xunKong: eightChar[`get${key}XunKong`](),
  };
};

const compactLiuNian = (liuNian, dayStem) => ({
  index: liuNian.getIndex(),
  year: liuNian.getYear(),
  age: liuNian.getAge(),
  xun: liuNian.getXun(),
  xunKong: liuNian.getXunKong(),
  ...ganZhiDetails(liuNian.getGanZhi(), dayStem),
  liuYue: liuNian.getLiuYue().map((liuYue) => ({
    index: liuYue.getIndex(),
    month: liuYue.getIndex() + 1,
    monthName: `${liuYue.getMonthInChinese()}月`,
    xun: liuYue.getXun(),
    xunKong: liuYue.getXunKong(),
    ...ganZhiDetails(liuYue.getGanZhi(), dayStem),
  })),
});

const compactDaYun = (daYun, dayStem) => ({
  index: daYun.getIndex(),
  startAge: daYun.getStartAge(),
  endAge: daYun.getEndAge(),
  startYear: daYun.getStartYear(),
  endYear: daYun.getEndYear(),
  xun: daYun.getXun(),
  xunKong: daYun.getXunKong(),
  ...ganZhiDetails(daYun.getGanZhi(), dayStem),
  liuNian: daYun.getLiuNian().map((item) => compactLiuNian(item, dayStem)),
});

const FLOW_MONTH_START_TERMS = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
const FLOW_MONTH_NAMES = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
const FLOW_TIME_SLOTS = [
  ['子时', 0, '00:00-00:59'],
  ['丑时', 2, '01:00-02:59'],
  ['寅时', 4, '03:00-04:59'],
  ['卯时', 6, '05:00-06:59'],
  ['辰时', 8, '07:00-08:59'],
  ['巳时', 10, '09:00-10:59'],
  ['午时', 12, '11:00-12:59'],
  ['未时', 14, '13:00-14:59'],
  ['申时', 16, '15:00-16:59'],
  ['酉时', 18, '17:00-18:59'],
  ['戌时', 20, '19:00-20:59'],
  ['亥时', 22, '21:00-22:59'],
];

const getJieQiSolar = (year, term) => Solar.fromYmd(year, 7, 1).getLunar().getJieQiTable()[term];

const getFlowMonthRange = (year, monthIndex) => {
  const startTerm = FLOW_MONTH_START_TERMS[monthIndex];
  const endTerm = monthIndex === 11 ? '立春' : FLOW_MONTH_START_TERMS[monthIndex + 1];
  const startYear = monthIndex === 11 ? year + 1 : year;
  const endYear = monthIndex >= 10 ? year + 1 : year;
  const start = getJieQiSolar(startYear, startTerm);
  const end = getJieQiSolar(endYear, endTerm);

  return {
    startTerm,
    endTerm,
    startDate: solarToYmd(start),
    endDate: solarToYmd(end),
    startSerial: serialFromParts(start.getYear(), start.getMonth(), start.getDay()),
    endSerial: serialFromParts(end.getYear(), end.getMonth(), end.getDay()),
  };
};

const buildFlowDay = ({ year, month, day, dayStem }) => {
  const lunar = Solar.fromYmdHms(year, month, day, 0, 0, 0).getLunar();
  const ganZhi = lunar.getDayInGanZhi();

  return {
    date: `${year}-${month}-${day}`,
    lunarMonth: `${lunar.getMonthInChinese()}月`,
    lunarDay: lunar.getDayInChinese(),
    lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    xun: lunar.getDayXun(),
    xunKong: lunar.getDayXunKong(),
    tianShen: lunar.getDayTianShen(),
    tianShenType: lunar.getDayTianShenType(),
    yi: toList(lunar.getDayYi()),
    ji: toList(lunar.getDayJi()),
    ...ganZhiDetails(ganZhi, dayStem),
    hours: FLOW_TIME_SLOTS.map(([label, hour, range]) => {
      const timeLunar = Solar.fromYmdHms(year, month, day, hour, 0, 0).getLunar();

      return {
        label,
        range,
        xun: timeLunar.getTimeXun(),
        xunKong: timeLunar.getTimeXunKong(),
        tianShen: timeLunar.getTimeTianShen(),
        tianShenType: timeLunar.getTimeTianShenType(),
        ...ganZhiDetails(timeLunar.getTimeInGanZhi(), dayStem),
      };
    }),
  };
};

const buildFlowDays = (query) => {
  const astrolabe = buildAstrolabe(query);
  const year = Number(query.get('flowYear'));
  const monthIndex = Number(query.get('flowMonthIndex'));

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    const err = new Error('flowYear and flowMonthIndex are required.');
    err.statusCode = 400;
    throw err;
  }

  const range = getFlowMonthRange(year, monthIndex);
  const days = [];

  for (let serial = range.startSerial; serial < range.endSerial; serial += 86400000) {
    days.push(buildFlowDay({ ...datePartsFromSerial(serial), dayStem: astrolabe.bazi.dayMaster.stem }));
  }

  return {
    year,
    monthIndex,
    monthName: FLOW_MONTH_NAMES[monthIndex],
    range: {
      startTerm: range.startTerm,
      endTerm: range.endTerm,
      startDate: range.startDate,
      endDate: range.endDate,
    },
    days,
  };
};

const buildBaziDetails = ({ astrolabe, normalizedBirth, gender }) => {
  const { year, month, day } = parseDateParts(astrolabe.solarDate);
  const [hour, minute] = normalizedBirth.trueSolarClockTime.split(':').map(Number);
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  const dayStem = eightChar.getDayGan();
  const genderValue = gender === '男' || gender === 'male' ? 1 : 0;
  const yun = eightChar.getYun(genderValue);

  return {
    source: 'lunar-typescript',
    solarDateTime: `${astrolabe.solarDate} ${normalizedBirth.trueSolarClockTime}`,
    lunarText: lunar.toString(),
    eightChar: eightChar.toString(),
    dayMaster: {
      stem: eightChar.getDayGan(),
      element: eightChar.getDayWuXing()[0],
    },
    pillars: [
      baziPillar(eightChar, 'Year', '年柱'),
      baziPillar(eightChar, 'Month', '月柱'),
      baziPillar(eightChar, 'Day', '日柱'),
      baziPillar(eightChar, 'Time', '时柱'),
    ],
    palaces: {
      taiYuan: eightChar.getTaiYuan(),
      taiYuanNaYin: eightChar.getTaiYuanNaYin(),
      taiXi: eightChar.getTaiXi(),
      taiXiNaYin: eightChar.getTaiXiNaYin(),
      mingGong: eightChar.getMingGong(),
      mingGongNaYin: eightChar.getMingGongNaYin(),
      shenGong: eightChar.getShenGong(),
      shenGongNaYin: eightChar.getShenGongNaYin(),
    },
    luck: {
      forward: yun.isForward(),
      start: {
        year: yun.getStartYear(),
        month: yun.getStartMonth(),
        day: yun.getStartDay(),
        hour: yun.getStartHour(),
        solarDate: yun.getStartSolar().toYmd(),
      },
      daYun: yun.getDaYun().slice(1).map((item) => compactDaYun(item, dayStem)),
    },
  };
};

const READING_THEMES = {
  命宫: ['自我驱动', '核心气质', '人生主线'],
  兄弟: ['同辈关系', '协作边界', '资源分流'],
  子女: ['作品延续', '投入产出', '养成课题'],
  父母: ['长辈关系', '庇护来源', '根基承接'],
  身宫: ['行动方式', '后天选择', '落地姿态'],
  财帛: ['资源经营', '现金流', '价值交换'],
  田宅: ['资产留存', '居住根基', '稳定结构'],
  官禄: ['事业路径', '角色定位', '长期成就'],
  夫妻: ['亲密关系', '合作模式', '情感课题'],
  迁移: ['外部机会', '跨城发展', '环境变量'],
  仆役: ['团队协作', '伙伴质量', '人脉消耗'],
  疾厄: ['恢复节律', '消耗来源', '健康管理'],
  福德: ['精神能量', '兴趣修复', '内在稳定'],
};

const STAR_TRAITS = {
  紫微: '重视秩序与掌控，适合承担统筹和定方向的角色',
  天机: '反应快、善变通，优势在策略、技术和信息整合',
  太阳: '外放明朗，容易在公开场景、服务他人或承担责任时发光',
  武曲: '务实重结果，对资源、效率和执行纪律更敏感',
  天同: '重体验与人情，适合在舒适关系中持续发挥',
  廉贞: '边界感强，带有审美、规则和改革意识',
  天府: '稳健蓄势，擅长管理资源、维护系统和长期积累',
  太阴: '细腻内敛，重感受、审美、安全感与长期陪伴',
  贪狼: '欲望感和探索性强，适合跨界、表达、社交和创意场景',
  巨门: '擅长辨析、表达与质疑，课题是减少内耗和口舌消耗',
  天相: '重规则与协作，适合做协调者、审查者和制度维护者',
  天梁: '保护欲与原则感强，适合顾问、教育、医疗、公益类角色',
  七杀: '行动锋利，适合开拓、攻坚、转型和高压决策',
  破军: '破旧立新，人生阶段常伴随重组、试错与升级',
};

const palaceByName = (palaces, name) => palaces.find((palace) => palace.name === name);

const starNames = (stars) => stars.map((star) => star.name);

const describeStars = (palace) => {
  const majors = starNames(palace.majorStars);

  if (!majors.length) {
    const supportStars = starNames(palace.minorStars).slice(0, 3);
    return supportStars.length
      ? `本宫无主星，更多借由${supportStars.join('、')}等辅曜显现，遇事容易受环境与对宫牵动。`
      : '本宫无主星，主题表现较依赖对宫、运限和实际环境触发。';
  }

  const traitText = majors.map((name) => STAR_TRAITS[name]).filter(Boolean).join('；');
  return `${majors.join('、')}坐守，${traitText || '主星组合需要结合四化与运限继续细分'}。`;
};

const collectMutagens = (palace) => palace.majorStars
  .concat(palace.minorStars, palace.adjectiveStars)
  .filter((star) => star.mutagen)
  .map((star) => `${star.name}${star.mutagen}`);

const buildPalaceReading = (palace, label = palace.name) => {
  const mutagens = collectMutagens(palace);
  const themes = READING_THEMES[label] || READING_THEMES[palace.name] || ['人生领域', '阶段事件', '选择模式'];

  return {
    palace: label,
    sourcePalace: palace.name,
    branch: `${palace.stem}${palace.branch}`,
    decadalRange: palace.decadal?.range || [],
    themes,
    majorStars: starNames(palace.majorStars),
    supportStars: starNames(palace.minorStars).slice(0, 5),
    mutagens,
    summary: describeStars(palace),
    promptContext: [
      `${label}落${palace.name}${palace.stem}${palace.branch}`,
      `主题：${themes.join('、')}`,
      `主星：${starNames(palace.majorStars).join('、') || '空宫'}`,
      `辅星：${starNames(palace.minorStars).slice(0, 5).join('、') || '无'}`,
      `四化：${mutagens.join('、') || '无'}`,
      `大限：${palace.decadal?.range?.join('-') || '-'}岁`,
    ],
  };
};

const buildReading = ({ summary, palaces, bazi, horoscope }) => {
  const bodyPalace = palaces.find((palace) => palace.isBodyPalace);
  const focusPalaces = [
    ['命宫', palaceByName(palaces, '命宫')],
    ['兄弟', palaceByName(palaces, '兄弟')],
    ['夫妻', palaceByName(palaces, '夫妻')],
    ['子女', palaceByName(palaces, '子女')],
    ['财帛', palaceByName(palaces, '财帛')],
    ['疾厄', palaceByName(palaces, '疾厄')],
    ['迁移', palaceByName(palaces, '迁移')],
    ['仆役', palaceByName(palaces, '仆役')],
    ['官禄', palaceByName(palaces, '官禄')],
    ['田宅', palaceByName(palaces, '田宅')],
    ['福德', palaceByName(palaces, '福德')],
    ['父母', palaceByName(palaces, '父母')],
    ['身宫', bodyPalace],
  ].filter(([, palace]) => palace);
  const chapters = focusPalaces.map(([label, palace]) => buildPalaceReading(palace, label));
  const knowledge = buildKnowledgeProfile({ chapters, bazi, summary, horoscope });
  const currentMutagens = [
    ['大限', horoscope.decadal],
    ['流年', horoscope.yearly],
    ['流月', horoscope.monthly],
  ].map(([label, item]) => `${label}${item.heavenlyStem}${item.earthlyBranch}：${item.mutagen.join('、') || '无四化'}`);

  return {
    mode: 'knowledge-augmented-draft',
    disclaimer: '这是基于排盘数据生成的结构化解读草稿，不等同于最终 AI 文案或现实决策建议。',
    headline: `${summary.soul || '-'}命主、${summary.body || '-'}身主，${bazi.dayMaster.stem}${bazi.dayMaster.element}日主，命盘主线落在${summary.soulPalaceBranch}宫。`,
    storyline: [
      `命宫提示自我底色：${knowledge.chapters[1]?.summary || chapters[0]?.summary || '命宫信息不足。'}`,
      `身宫提示后天落点：${knowledge.chapters[2]?.summary || chapters[1]?.summary || '身宫信息不足。'}`,
      `当前运限可作为剧情时间轴：${currentMutagens.join('；')}。`,
      `知识层已接入 ${knowledge.meta.activeDomains.join(' / ')}，当前纳管 ${knowledge.meta.catalog.totalBooks} 本书，规则源 ${knowledge.meta.catalog.byUseFor.rules || 0} 本，引用源 ${knowledge.meta.catalog.byUseFor.reference || 0} 本。`,
      `专题层已整理 ${knowledge.topics.length} 条主线，可按事业、财运、婚恋、健康与心性继续展开。`,
    ],
    manual: knowledge.chapters.map((chapter, index) => ({
      title: `第${index + 1}章：${chapter.palace}`,
      subtitle: chapter.themes.join(' / '),
      body: chapter.summary,
      hooks: chapter.promptContext,
      knowledgeHits: chapter.knowledgeHits || [],
      references: chapter.references || [],
    })),
    gameLevels: knowledge.chapters.slice(1, 6).map((chapter, index) => ({
      level: index + 1,
      name: `${chapter.palace}关卡`,
      objective: `处理${chapter.themes[0]}与${chapter.themes[1]}的选择题`,
      clue: chapter.mutagens.length
        ? `关键线索在${chapter.mutagens.join('、')}`
        : `关键线索在${chapter.majorStars.join('、') || '对宫与运限'}`,
      reward: chapter.themes[2],
    })),
    references: knowledge.references,
    knowledgeHits: knowledge.knowledgeHits,
    topics: knowledge.topics,
    retrieval: knowledge.retrieval,
    aiPromptSeed: [
      `请基于紫微斗数和八字资料生成克制、具体、非宿命论的人生手册。`,
      `基础：${summary.solarDate} ${summary.time}，${summary.gender}，${summary.fiveElementsClass}，八字${bazi.eightChar}。`,
      `知识库目录：紫微 ${knowledge.meta.catalog.byDomain.ziwei || 0} 本，八字 ${knowledge.meta.catalog.byDomain.bazi || 0} 本；阶段一启用 ${knowledge.meta.stageOneSources.length} 本。`,
      `专题覆盖：${knowledge.meta.catalog.topics.map((topic) => `${topic.title}${topic.bookCount}本`).join('，')}。`,
      ...knowledge.topics.map((topic) => `${topic.title}：${topic.cues.join('；')}`),
      ...knowledge.retrieval.map((item) => `检索片段 ${item.source}：${item.summary}`),
      ...knowledge.chapters.flatMap((chapter) => chapter.promptContext),
      ...knowledge.promptLines,
    ],
  };
};

const buildAstrolabe = (query) => {
  const calendar = query.get('calendar') || 'solar';
  const date = query.get('date') || '2000-8-16';
  const birthTime = query.get('birthTime') || '03:30';
  const timeIndex = query.has('timeIndex')
    ? Number(query.get('timeIndex'))
    : timeIndexFromMinutes(parseBirthMinutes(birthTime, 2));
  const birthPlace = query.get('birthPlace') || '北京';
  const trueSolarTime = parseBool(query.get('trueSolarTime'));
  const birthLongitude = resolveBirthLongitude(birthPlace, query.get('birthLongitude'), trueSolarTime);
  const gender = query.get('gender') || '女';
  const language = query.get('language') || 'zh-CN';
  const target = query.get('target') || formatTargetDateTime();

  if (!Number.isInteger(timeIndex) || timeIndex < 0 || timeIndex > 12) {
    const err = new Error('timeIndex must be an integer from 0 to 12.');
    err.statusCode = 400;
    throw err;
  }

  const daylightSaving = resolveDaylightSaving(query.get('daylightSaving') || 'false', date, calendar);

  if (calendar === 'lunar' && trueSolarTime) {
    const err = new Error('trueSolarTime requires solar calendar input.');
    err.statusCode = 400;
    throw err;
  }

  const normalizedBirth = normalizeBirthTime({
    calendar,
    date,
    timeIndex,
    birthTime,
    daylightSaving,
    birthLongitude,
    trueSolarTime,
  });

  astro.config({
    algorithm: query.get('algorithm') || 'default',
    yearDivide: query.get('yearDivide') || 'normal',
    horoscopeDivide: query.get('horoscopeDivide') || 'normal',
    ageDivide: query.get('ageDivide') || 'normal',
    dayDivide: query.get('dayDivide') || 'forward',
  });

  const astrolabe = calendar === 'lunar'
    ? astro.byLunar(normalizedBirth.date, normalizedBirth.timeIndex, gender, parseBool(query.get('isLeapMonth')), true, language)
    : astro.bySolar(normalizedBirth.date, normalizedBirth.timeIndex, gender, true, language);

  const horoscope = astrolabe.horoscope(target);
  const summary = {
    gender: astrolabe.gender,
    solarDate: astrolabe.solarDate,
    lunarDate: astrolabe.lunarDate,
    chineseDate: astrolabe.chineseDate,
    time: astrolabe.time,
    timeRange: astrolabe.timeRange,
    zodiac: astrolabe.zodiac,
    sign: astrolabe.sign,
    soulPalaceBranch: astrolabe.earthlyBranchOfSoulPalace,
    bodyPalaceBranch: astrolabe.earthlyBranchOfBodyPalace,
    soul: astrolabe.soul,
    body: astrolabe.body,
    fiveElementsClass: astrolabe.fiveElementsClass,
    copyright: astrolabe.copyright,
  };
  const bazi = buildBaziDetails({ astrolabe, normalizedBirth, gender });
  const palaces = astrolabe.palaces.map(compactPalace);
  const horoscopeData = {
    decadal: compactHoroscope(horoscope.decadal),
    yearly: compactHoroscope(horoscope.yearly),
    monthly: compactHoroscope(horoscope.monthly),
    daily: compactHoroscope(horoscope.daily),
    hourly: compactHoroscope(horoscope.hourly),
    agePalace: compactPalace(horoscope.agePalace()),
  };

  return {
    input: {
      calendar,
      date,
      timeIndex,
      birthTime: birthTime || null,
      birthPlace: birthPlace || null,
      birthLongitude,
      trueSolarTime,
      daylightSaving: normalizedBirth.daylightSaving,
      daylightSavingMode: normalizedBirth.daylightSavingMode,
      normalizedBirth,
      gender,
      language,
      target,
      config: astro.getConfig(),
    },
    summary,
    bazi,
    palaces,
    horoscope: horoscopeData,
    reading: buildReading({ summary, palaces, bazi, horoscope: horoscopeData }),
  };
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/health') {
    json(res, 200, { ok: true });
    return;
  }

  if (url.pathname === '/api/cities') {
    json(res, 200, {
      cities: CITY_NAMES.map((name) => ({
        name,
        longitude: CITY_LONGITUDES[name],
      })),
    });
    return;
  }

  if (url.pathname === '/api/astrolabe') {
    try {
      json(res, 200, buildAstrolabe(url.searchParams));
    } catch (error) {
      json(res, error.statusCode || 500, {
        error: error.message,
      });
    }
    return;
  }

  if (url.pathname === '/api/flow-days') {
    try {
      json(res, 200, buildFlowDays(url.searchParams));
    } catch (error) {
      json(res, error.statusCode || 500, {
        error: error.message,
      });
    }
    return;
  }

  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  sendFile(res, path.join(PUBLIC_DIR, safePath));
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`Mingli demo running at http://${HOST}:${PORT}`);
  });
}

module.exports = {
  buildAstrolabe,
  buildFlowDays,
  normalizeBirthTime,
  server,
};
