// src/api/api.js

// 1) Статичные категории (не зависят от API)
const STATIC_CATEGORIES = [
  { title: 'Новые уроки',          iconKey: 'iconNew' },
  { title: 'Нейросети',             iconKey: 'iconAI' },
  { title: 'Инструменты Figma',     iconKey: 'iconFigma' },
  { title: 'Дизайн-системы',        iconKey: 'iconDesignSystem' },
  { title: 'Фриланс, поиск работы', iconKey: 'iconJob' },
  { title: 'Софт скиллы',           iconKey: 'iconSoftSkills' },
  { title: 'Tilda',                 iconKey: 'iconTilda' },
  { title: 'UX, исследования',      iconKey: 'iconUX' },
  { title: 'Курс по Spline',        iconKey: 'iconSpline' },
  { title: 'Челленджи',             iconKey: 'iconChallenge' },
  { title: 'Дизайн-сцены',          iconKey: 'iconDesignScene' },
  { title: 'Рекомендации',          iconKey: 'iconRecs' },
];

// 2) Настройки API и кэша уроков
const ENDPOINT = 'https://sanya-kvo.up.railway.app/webhook/lessons'; // пример: https://sanya-kvo.up.railway.app/webhook/lessons
const LS_KEY   = 'lessons_cache_v1';
const TTL_MS   = 24 * 60 * 60 * 1000; // максимум сутки
const REFRESH_HOUR = 10; // по Москве, новые уроки появляются после 10:00
const REFRESH_MINUTE = 0;

let runtimeCache = null;

const shouldUseCache = (timestamp) => {
  if (!timestamp) return false;

  const now = new Date();
  const cached = new Date(timestamp);
  if (Number.isNaN(cached.getTime())) {
    return false;
  }

  if (now.getTime() - cached.getTime() > TTL_MS) {
    return false;
  }

  const refreshBoundary = new Date(now);
  refreshBoundary.setHours(REFRESH_HOUR, REFRESH_MINUTE, 0, 0);

  if (now >= refreshBoundary) {
    if (cached < refreshBoundary) {
      return false;
    }
  } else {
    const prevBoundary = new Date(refreshBoundary);
    prevBoundary.setDate(prevBoundary.getDate() - 1);
    if (cached < prevBoundary) {
      return false;
    }
  }

  return true;
};

// — внутренняя функция: загрузить все уроки из кэша/сети
async function loadAllLessons() {
  // а) память
  if (runtimeCache && shouldUseCache(runtimeCache.timestamp)) {
    return runtimeCache;
  }

  // б) localStorage
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (shouldUseCache(parsed.timestamp)) {
        runtimeCache = parsed;
        return runtimeCache;
      }
    }
  } catch (_) {}

  // в) сеть
  const res = await fetch(ENDPOINT, { method: 'GET' });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  // ожидаем структуру из n8n:
  // { categories: [...], lessonsByCategory: { [title]: Lesson[] }, timestamp?: number }

  const lessonsByCategory = data.lessonsByCategory || {};
  const normalized = {
    lessonsByCategory,
    timestamp: Date.now(),
  };

  runtimeCache = normalized;
  try { localStorage.setItem(LS_KEY, JSON.stringify(normalized)); } catch (_) {}

  return runtimeCache;
}

// 3) Публичные функции, которые уже используют экраны

// Статичный список категорий для главного экрана
export async function fetchCategories() {
  return STATIC_CATEGORIES;
}

// Уроки выбранной категории из n8n (через кэш)
export async function fetchLessonsByCategory(categoryTitle) {
  const all = await loadAllLessons();
  return all.lessonsByCategory[categoryTitle] ?? [];
}

// Плоский список всех уроков (для глобального поиска и т.д.)
export async function fetchAllLessons() {
  const all = await loadAllLessons();
  const lessonsByCategory = all.lessonsByCategory || {};

  return Object.entries(lessonsByCategory).flatMap(
    ([categoryTitle, lessons = []]) =>
      lessons.map((lesson) => ({
        ...lesson,
        categoryTitle,
      })),
  );
}
