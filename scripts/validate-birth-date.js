#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { buildAstrolabe } = require('../server');

const importSource = async (file) => {
  const source = fs.readFileSync(file, 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
};

const expectError = (validate, input, expected) => {
  const message = validate(input);
  return message && expected.test(message);
};

const main = async () => {
  const errors = [];
  const birthDate = await importSource(path.join(__dirname, '../src/domain/birth-date.js'));
  const fixedMax = '2026-08-17';
  const validate = (input) => birthDate.validateBirthDate({ ...input, maxDate: fixedMax });
  if (!expectError(validate, { date: '198600-07-29', calendar: 'lunar' }, /年份须为 4 位/)) errors.push('six-digit year must be rejected before submit');
  if (!expectError(validate, { date: '986-07-29', calendar: 'lunar' }, /年份须为 4 位/)) errors.push('three-digit year must be rejected before submit');
  if (!expectError(validate, { date: '2001-02-29', calendar: 'solar' }, /有效的公历日期/)) errors.push('invalid solar date must be rejected');
  if (!expectError(validate, { date: '1986-13-01', calendar: 'lunar' }, /有效的农历日期/)) errors.push('invalid lunar date must be rejected');
  if (validate({ date: '2000-08-16', calendar: 'solar' }) !== null || validate({ date: '1986-07-29', calendar: 'lunar' }) !== null) errors.push('valid four-digit solar and lunar dates must pass client validation');
  if (!expectError(validate, { date: '2026-08-18', calendar: 'solar' }, /当前日期/)) errors.push('future dates must be rejected');
  if (birthDate.todayBirthDateMax(new Date(2026, 7, 17)) !== fixedMax) errors.push('birth date maximum must be today');

  const formSource = fs.readFileSync(path.join(__dirname, '../src/components/birth-form.js'), 'utf8');
  if (!/type="date"[^>]*min="\$\{MIN_BIRTH_DATE\}"[^>]*max="\$\{maxBirthDate\}"/.test(formSource) || !/data-birth-date/.test(formSource)) errors.push('birth form must include date min/max and input constraint hook');
  const eventsSource = fs.readFileSync(path.join(__dirname, '../src/app/events.js'), 'utf8');
  const submitStart = eventsSource.indexOf("root.addEventListener('submit'");
  const submitEnd = eventsSource.indexOf("root.addEventListener('click'", submitStart);
  const submitSource = eventsSource.slice(submitStart, submitEnd);
  if (submitSource.indexOf('if (dateError)') < 0 || submitSource.indexOf('if (dateError)') > submitSource.indexOf('setLoading(true)') || !/if \(dateError\)[\s\S]*?return;/.test(submitSource)) errors.push('invalid birth dates must return before any API request/loading state');

  ['198600-07-29', '986-07-29', '2001-02-29'].forEach((date) => {
    try {
      buildAstrolabe(new URLSearchParams({ date, calendar: 'solar', birthTime: '07:30', birthPlace: '徐州' }));
      errors.push(`server must reject invalid incoming date ${date}`);
    } catch (error) {
      if (error.statusCode !== 400) errors.push(`server must return 400 for invalid incoming date ${date}`);
    }
  });
  ['1899-12-31', '9999-01-01'].forEach((date) => {
    try {
      buildAstrolabe(new URLSearchParams({ date, calendar: 'solar', birthTime: '07:30', birthPlace: '徐州' }));
      errors.push(`server must enforce supported date range for ${date}`);
    } catch (error) {
      if (error.statusCode !== 400) errors.push(`server must return 400 for out-of-range date ${date}`);
    }
  });
  try {
    buildAstrolabe(new URLSearchParams({ birthTime: '07:30', birthPlace: '徐州' }));
  } catch (error) {
    errors.push(`server default date must remain valid: ${error.message}`);
  }

  if (errors.length) {
    errors.forEach((error) => console.error(`FAIL ${error}`));
    process.exit(1);
  }
  console.log('PASS birth date: strict four-digit years, calendar-aware validation, client submit guard');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
