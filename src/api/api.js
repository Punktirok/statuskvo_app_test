// src/api/api.js

import { STATIC_CATEGORIES } from '../data/categories.js'

// 2) Настройки API и кэша уроков
const ENDPOINT = 'https://sanya-kvo.up.railway.app/webhook/lessons'; // пример: https://sanya-kvo.up.railway.app/webhook/lessons
const LS_KEY = 'lessons_cache_v1';
const TTL_MS = 24 * 60 * 60 * 1000; // максимум сутки
const REFRESH_HOUR = 10; // по Москве, новые уроки появляются после 10:00
const REFRESH_MINUTE = 0;
const NEW_CATEGORY_TITLE = 'Новые уроки';

let runtimeCache = null;
let lessonUid = 0;

const categoriesIconMap = Object.fromEntries(
  STATIC_CATEGORIES.map(({ title, iconKey }) => [title, iconKey]),
);

const normalizeString = (value) =>
  typeof value === 'string' ? value.trim() : '';

const parseTags = (tagsValue) => {
  if (Array.isArray(tagsValue)) {
    return tagsValue.map((tag) => normalizeString(tag).toLowerCase()).filter(Boolean);
  }
  if (typeof tagsValue === 'string') {
    return tagsValue
      .split(',')
      .map((tag) => normalizeString(tag).toLowerCase())
      .filter(Boolean);
  }
  return [];
};

const isYes = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  const normalized = normalizeString(value).toLowerCase();
  return normalized === 'yes' || normalized === 'true';
};

const ensureIconKey = (lesson, categoryTitle) => {
  if (lesson.iconKey) {
    return lesson.iconKey;
  }
  return categoriesIconMap[categoryTitle] ?? null;
};

const createLessonId = (rawLesson) => {
  if (rawLesson.id || rawLesson._id) {
    return rawLesson.id ?? rawLesson._id;
  }
  if (rawLesson.url) {
    return `${rawLesson.url}`;
  }
  lessonUid += 1;
  return `lesson-${lessonUid}`;
};

const toLessonsByCategoryMap = (rawData) => {
  if (!rawData) {
    return {}
  }

  if (Array.isArray(rawData)) {
    return rawData.reduce((acc, lesson) => {
      const categoryTitle = normalizeString(lesson.category)
      if (!categoryTitle) {
        return acc
      }
      if (!acc[categoryTitle]) {
        acc[categoryTitle] = []
      }
      acc[categoryTitle].push(lesson)
      return acc
    }, {})
  }

  if (typeof rawData === 'object') {
    return rawData
  }

  return {}
}

const buildNormalizedLessons = (rawInput) => {
  const rawLessonsByCategory = toLessonsByCategoryMap(rawInput)
  const result = {};

  const addLessonToCategory = (categoryTitle, lesson) => {
    if (!categoryTitle) return;
    if (!result[categoryTitle]) {
      result[categoryTitle] = [];
    }
    result[categoryTitle].push({
      ...lesson,
      categoryTitle,
      iconKey: ensureIconKey(lesson, categoryTitle),
    });
  };

  for (const [rawCategoryTitle, lessons = []] of Object.entries(
    rawLessonsByCategory,
  )) {
    const primaryCategoryTitle = normalizeString(rawCategoryTitle);

    lessons.forEach((rawLesson, index) => {
      const baseId = createLessonId(rawLesson);
      const tags = parseTags(rawLesson.tags);
      const baseLesson = {
        ...rawLesson,
        baseId,
        tags,
        primaryCategoryTitle,
      };

      addLessonToCategory(primaryCategoryTitle, {
        ...baseLesson,
        id: `${baseId}__${primaryCategoryTitle || index}`,
        categoryTitle: primaryCategoryTitle,
        isPrimaryCategory: true,
      });

      const secondaryCategory = normalizeString(rawLesson.secondCategory);
      if (
        secondaryCategory &&
        secondaryCategory !== primaryCategoryTitle
      ) {
        addLessonToCategory(secondaryCategory, {
          ...baseLesson,
          id: `${baseId}__${secondaryCategory || index}`,
          categoryTitle: secondaryCategory,
          isPrimaryCategory: false,
        });
      }

      if (isYes(rawLesson.new)) {
        addLessonToCategory(NEW_CATEGORY_TITLE, {
          ...baseLesson,
          id: `${baseId}__${NEW_CATEGORY_TITLE || index}`,
          categoryTitle: NEW_CATEGORY_TITLE,
          isPrimaryCategory: false,
        });
      }
    });
  }

  return Object.fromEntries(
    Object.entries(result).map(([categoryTitle, lessons]) => [
      categoryTitle,
      [...lessons].reverse(),
    ]),
  );
};

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
  if (runtimeCache && shouldUseCache(runtimeCache.timestamp)) {
    return runtimeCache;
  }

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

  const res = await fetch(ENDPOINT, { method: 'GET' });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  // ожидаем структуру из n8n:
  // { categories: [...], lessonsByCategory: { [title]: Lesson[] }, timestamp?: number }

  const sourcePayload =
    data.lessonsByCategory ??
    data.lessons ??
    data.records ??
    data;

  const lessonsByCategory = buildNormalizedLessons(sourcePayload);
  const normalized = {
    lessonsByCategory,
    timestamp: Date.now(),
  };

  runtimeCache = normalized;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(normalized));
  } catch (_) {}

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
