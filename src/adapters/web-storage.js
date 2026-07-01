const KEY = 'mingli.birthInput.v1';
const THEME_KEY = 'mingli.theme.v1';
const CHART_KEY = 'mingli.chart.v1';
const PROGRESS_KEY = 'mingli.progress.v1';
const ANON_KEY = 'mingli.anonId.v1';

// 设备级匿名 ID：首次访问生成并固化，云存档按它归属（登录后再迁到账号）。
export const getAnonId = () => {
  try {
    let id = window.localStorage.getItem(ANON_KEY);
    if (!id) {
      id = (window.crypto && window.crypto.randomUUID)
        ? window.crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      window.localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
};

// 命盘较大，只在生成时写一次：{ astrolabeData, generatedAt }
export const loadChart = () => {
  try {
    const raw = window.localStorage.getItem(CHART_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveChart = (value) => {
  try {
    window.localStorage.setItem(CHART_KEY, JSON.stringify(value));
  } catch {
    // Storage is optional.
  }
};

// 进度较轻，可随每次状态变更写：{ choices, lifeState, routeScores, portraitOpen }
export const loadProgress = () => {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveProgress = (value) => {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(value));
  } catch {
    // Storage is optional.
  }
};

export const clearSavedChart = () => {
  try {
    window.localStorage.removeItem(CHART_KEY);
    window.localStorage.removeItem(PROGRESS_KEY);
  } catch {
    // Storage is optional.
  }
};

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
