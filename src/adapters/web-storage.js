const KEY = 'mingli.birthInput.v1';
const THEME_KEY = 'mingli.theme.v1';

export const loadBirthInput = () => {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveBirthInput = (value) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Storage is optional for the first web version.
  }
};

export const loadTheme = () => {
  try {
    return window.localStorage.getItem(THEME_KEY) || null;
  } catch {
    return null;
  }
};

export const saveTheme = (value) => {
  try {
    window.localStorage.setItem(THEME_KEY, value);
  } catch {
    // Storage is optional for the first web version.
  }
};
