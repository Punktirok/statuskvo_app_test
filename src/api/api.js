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
const TTL_MS   = 24 * 60 * 60 * 1000; // 24 часа

let runtimeCache = null;

// — внутренняя функция: загрузить все уроки из кэша/сети
async function loadAllLessons() {
  // а) память
  if (runtimeCache) return runtimeCache;

  // б) localStorage
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - (parsed.timestamp || 0) < TTL_MS) {
        runtimeCache = parsed; // { lessonsByCategory, timestamp }
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
