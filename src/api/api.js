// src/api/api.js

import { STATIC_CATEGORIES } from '../data/categories.js'

// 2) Настройки API и кэша уроков
const ENDPOINT = 'https://sanya-kvo.up.railway.app/webhook/lessons'; // пример: https://sanya-kvo.up.railway.app/webhook/lessons
const NEW_CATEGORY_TITLE = 'Новые уроки';
let lessonUid = 0;
const FIRST_CLUB_ENDPOINT = 'https://sanya-kvo.up.railway.app/webhook/first_club'

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
  if (rawLesson.lesson_id) {
    return rawLesson.lesson_id;
  }
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
        lesson_id: baseId,
        tags,
        primaryCategoryTitle,
      };

      addLessonToCategory(primaryCategoryTitle, {
        ...baseLesson,
        lesson_id: baseId,
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
          lesson_id: baseId,
          categoryTitle: secondaryCategory,
          isPrimaryCategory: false,
        });
      }

      if (isYes(rawLesson.new)) {
        addLessonToCategory(NEW_CATEGORY_TITLE, {
          ...baseLesson,
          lesson_id: baseId,
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

// — внутренняя функция: загрузить все уроки из кэша/сети
async function loadAllLessons() {
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
  return normalized;
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

export async function fetchFirstClubCards() {
  const res = await fetch(FIRST_CLUB_ENDPOINT, { method: 'GET' })
  if (!res.ok) {
    throw new Error(`First club API ${res.status}`)
  }
  const data = await res.json()
  if (!Array.isArray(data)) {
    return []
  }

  return [...data].sort((a, b) => {
    const left = a.card_id ?? ''
    const right = b.card_id ?? ''
    return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' })
  })
}
