const KEY = 'mingli.birthInput.v1';

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
