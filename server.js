const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { astro } = require('iztro');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');
const MINUTES_PER_DAY = 24 * 60;
const CHINA_STANDARD_LONGITUDE = 120;
const CITY_LONGITUDES = {
  北京: 116.4,
  上海: 121.47,
  天津: 117.2,
  重庆: 106.55,
  哈尔滨: 126.63,
  长春: 125.32,
  沈阳: 123.43,
  呼和浩特: 111.75,
  石家庄: 114.52,
  太原: 112.55,
  济南: 117.12,
  郑州: 113.62,
  西安: 108.93,
  兰州: 103.82,
  西宁: 101.78,
  银川: 106.23,
  乌鲁木齐: 87.62,
  南京: 118.78,
  合肥: 117.25,
  杭州: 120.15,
  南昌: 115.85,
  福州: 119.3,
  广州: 113.27,
  南宁: 108.37,
  海口: 110.32,
  武汉: 114.3,
  长沙: 112.93,
  成都: 104.07,
  贵阳: 106.63,
  昆明: 102.72,
  拉萨: 91.13,
  香港: 114.17,
  澳门: 113.55,
  台北: 121.57,
  深圳: 114.06,
  厦门: 118.08,
  青岛: 120.38,
  大连: 121.62,
  宁波: 121.55,
  苏州: 120.58,
};
const CHINA_DAYLIGHT_SAVING_RANGES = [
  ['1986-5-4', '1986-9-14'],
  ['1987-4-12', '1987-9-13'],
  ['1988-4-10', '1988-9-11'],
  ['1989-4-16', '1989-9-17'],
  ['1990-4-15', '1990-9-16'],
  ['1991-4-14', '1991-9-15'],
];

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

const parseBool = (value) => value === 'true' || value === '1' || value === 'yes' || value === 'on';

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

  const normalizedPlace = normalizePlaceName(birthPlace);
  const matchedCity = Object.keys(CITY_LONGITUDES).find((city) => (
    normalizePlaceName(city) === normalizedPlace || normalizedPlace.includes(normalizePlaceName(city))
  ));

  if (matchedCity) {
    return CITY_LONGITUDES[matchedCity];
  }

  if (trueSolarTime) {
    const err = new Error('birthPlace is not recognized; choose a supported city before using trueSolarTime.');
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

const buildAstrolabe = (query) => {
  const calendar = query.get('calendar') || 'solar';
  const date = query.get('date') || '2000-8-16';
  const birthTime = query.get('birthTime') || '03:30';
  const timeIndex = query.has('timeIndex')
    ? Number(query.get('timeIndex'))
    : timeIndexFromMinutes(parseBirthMinutes(birthTime, 2));
  const birthPlace = query.get('birthPlace') || '';
  const trueSolarTime = parseBool(query.get('trueSolarTime'));
  const birthLongitude = resolveBirthLongitude(birthPlace, query.get('birthLongitude'), trueSolarTime);
  const gender = query.get('gender') || '女';
  const language = query.get('language') || 'zh-CN';
  const target = query.get('target') || '2023-8-19 3:12';

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
    summary: {
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
    },
    palaces: astrolabe.palaces.map(compactPalace),
    horoscope: {
      decadal: compactHoroscope(horoscope.decadal),
      yearly: compactHoroscope(horoscope.yearly),
      monthly: compactHoroscope(horoscope.monthly),
      daily: compactHoroscope(horoscope.daily),
      hourly: compactHoroscope(horoscope.hourly),
      agePalace: compactPalace(horoscope.agePalace()),
    },
  };
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/health') {
    json(res, 200, { ok: true });
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
  normalizeBirthTime,
  server,
};
