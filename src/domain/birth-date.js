export const MIN_BIRTH_DATE = '1900-01-01';

const pad = (value) => String(value).padStart(2, '0');

export const todayBirthDateMax = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const isValidSolarDate = (year, month, day) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

export const validateBirthDate = ({ date, calendar = 'solar', maxDate = todayBirthDateMax() } = {}) => {
  const value = String(date || '');
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return '请输入 YYYY-MM-DD 格式的出生日期，年份须为 4 位。';
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const minYear = Number(MIN_BIRTH_DATE.slice(0, 4));
  const maxYear = Number(maxDate.slice(0, 4));
  if (year < minYear || year > maxYear) return `仅支持 ${minYear} 年至当前日期出生的用户。`;
  if (calendar === 'lunar') {
    if (month < 1 || month > 12 || day < 1 || day > 30) return '请输入有效的农历日期（月为 01–12，日为 01–30）。';
    return null;
  }
  if (calendar !== 'solar' || !isValidSolarDate(year, month, day)) return '请输入有效的公历日期。';
  if (value < MIN_BIRTH_DATE || value > maxDate) return `仅支持 ${minYear} 年至当前日期出生的用户。`;
  return null;
};

export const validateBirthInput = (input, options) => validateBirthDate({
  date: input?.date,
  calendar: input?.calendar,
  ...options,
});
