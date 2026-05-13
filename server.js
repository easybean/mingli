const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { astro } = require('iztro');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');

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

const buildAstrolabe = (query) => {
  const calendar = query.get('calendar') || 'solar';
  const date = query.get('date') || '2000-8-16';
  const timeIndex = Number(query.get('timeIndex') || 2);
  const gender = query.get('gender') || '女';
  const language = query.get('language') || 'zh-CN';
  const target = query.get('target') || '2023-8-19 3:12';

  if (!Number.isInteger(timeIndex) || timeIndex < 0 || timeIndex > 12) {
    const err = new Error('timeIndex must be an integer from 0 to 12.');
    err.statusCode = 400;
    throw err;
  }

  astro.config({
    algorithm: query.get('algorithm') || 'default',
    yearDivide: query.get('yearDivide') || 'normal',
    horoscopeDivide: query.get('horoscopeDivide') || 'normal',
    ageDivide: query.get('ageDivide') || 'normal',
    dayDivide: query.get('dayDivide') || 'forward',
  });

  const astrolabe = calendar === 'lunar'
    ? astro.byLunar(date, timeIndex, gender, query.get('isLeapMonth') === 'true', true, language)
    : astro.bySolar(date, timeIndex, gender, true, language);

  const horoscope = astrolabe.horoscope(target);

  return {
    input: {
      calendar,
      date,
      timeIndex,
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

server.listen(PORT, HOST, () => {
  console.log(`Mingli demo running at http://${HOST}:${PORT}`);
});
