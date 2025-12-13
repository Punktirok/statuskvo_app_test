import { STATIC_CATEGORIES } from '../data/categories.js'
import { LESSONS_ENDPOINT, NEW_CATEGORY_TITLE } from './config.js'
import { readCache, writeCache } from '../utils/cache.js'
import { getNextMoscowTime, isWithinMoscowWindow } from '../utils/time.js'

let lessonUid = 0
const LESSONS_CACHE_KEY = 'lessons-cache-v2'
const LESSONS_UPDATE_START = 10
const LESSONS_UPDATE_END = 11
const CACHE_MODE_STORAGE_KEY = 'lessons-cache-mode'
const CACHE_MODE_QUERY_PARAM = 'cache'

const CACHE_MODES = {
  CACHE: 'cache',
  NETWORK: 'network',
}

let resolvedCacheMode = null

const categoriesIconMap = Object.fromEntries(
  STATIC_CATEGORIES.map(({ title, iconKey }) => [title, iconKey]),
)

const normalizeString = (value) =>
  typeof value === 'string' ? value.trim() : ''

const parseTags = (tagsValue) => {
  if (Array.isArray(tagsValue)) {
    return tagsValue.map((tag) => normalizeString(tag).toLowerCase()).filter(Boolean)
  }
  if (typeof tagsValue === 'string') {
    return tagsValue
      .split(',')
      .map((tag) => normalizeString(tag).toLowerCase())
      .filter(Boolean)
  }
  return []
}

const isYes = (value) => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'number') {
    return value === 1
  }
  const normalized = normalizeString(value).toLowerCase()
  return normalized === 'yes' || normalized === 'true'
}

const ensureIconKey = (lesson, categoryTitle) => {
  if (lesson.iconKey) {
    return lesson.iconKey
  }
  return categoriesIconMap[categoryTitle] ?? null
}

const createLessonId = (rawLesson) => {
  if (rawLesson.lesson_id) {
    return rawLesson.lesson_id
  }
  if (rawLesson.id || rawLesson._id) {
    return rawLesson.id ?? rawLesson._id
  }
  if (rawLesson.url) {
    return `${rawLesson.url}`
  }
  lessonUid += 1
  return `lesson-${lessonUid}`
}

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
  const result = {}

  const addLessonToCategory = (categoryTitle, lesson) => {
    if (!categoryTitle) return
    if (!result[categoryTitle]) {
      result[categoryTitle] = []
    }
    result[categoryTitle].push({
      ...lesson,
      categoryTitle,
      iconKey: ensureIconKey(lesson, categoryTitle),
    })
  }

  for (const [rawCategoryTitle, lessons = []] of Object.entries(
    rawLessonsByCategory,
  )) {
    const primaryCategoryTitle = normalizeString(rawCategoryTitle)

    lessons.forEach((rawLesson) => {
      const baseId = createLessonId(rawLesson)
      const tags = parseTags(rawLesson.tags)
      const baseLesson = {
        ...rawLesson,
        baseId,
        lesson_id: baseId,
        tags,
        primaryCategoryTitle,
      }

      addLessonToCategory(primaryCategoryTitle, {
        ...baseLesson,
        lesson_id: baseId,
        categoryTitle: primaryCategoryTitle,
        isPrimaryCategory: true,
      })

      const secondaryCategory = normalizeString(rawLesson.secondCategory)
      if (secondaryCategory && secondaryCategory !== primaryCategoryTitle) {
        addLessonToCategory(secondaryCategory, {
          ...baseLesson,
          lesson_id: baseId,
          categoryTitle: secondaryCategory,
          isPrimaryCategory: false,
        })
      }

      if (isYes(rawLesson.new)) {
        addLessonToCategory(NEW_CATEGORY_TITLE, {
          ...baseLesson,
          lesson_id: baseId,
          categoryTitle: NEW_CATEGORY_TITLE,
          isPrimaryCategory: false,
        })
      }
    })
  }

  return Object.fromEntries(
    Object.entries(result).map(([categoryTitle, lessons]) => [
      categoryTitle,
      [...lessons].reverse(),
    ]),
  )
}

let inMemoryLessons = null
const getStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return window.localStorage ?? null
  } catch {
    return null
  }
}

const normalizeCacheMode = (value) => {
  if (!value) return null
  const normalized = String(value).trim().toLowerCase()
  if (normalized === 'off' || normalized === CACHE_MODES.NETWORK) {
    return CACHE_MODES.NETWORK
  }
  if (normalized === 'on' || normalized === CACHE_MODES.CACHE) {
    return CACHE_MODES.CACHE
  }
  return null
}

const readCacheModeFromQuery = () => {
  if (typeof window === 'undefined') return null
  try {
    const params = new URLSearchParams(window.location.search ?? '')
    return normalizeCacheMode(params.get(CACHE_MODE_QUERY_PARAM))
  } catch {
    return null
  }
}

const readPersistedCacheMode = () => {
  const storage = getStorage()
  if (!storage) return null
  try {
    return storage.getItem(CACHE_MODE_STORAGE_KEY)
  } catch {
    return null
  }
}

const persistCacheMode = (mode) => {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(CACHE_MODE_STORAGE_KEY, mode)
  } catch {
    // ignore
  }
}

const resolveCacheMode = () => {
  if (resolvedCacheMode) {
    return resolvedCacheMode
  }

  const fromQuery = readCacheModeFromQuery()
  if (fromQuery) {
    persistCacheMode(fromQuery)
    resolvedCacheMode = fromQuery
    return resolvedCacheMode
  }

  const stored = normalizeCacheMode(readPersistedCacheMode())
  if (stored) {
    resolvedCacheMode = stored
    return resolvedCacheMode
  }

  resolvedCacheMode = CACHE_MODES.CACHE
  return resolvedCacheMode
}

const shouldBypassCache = () => resolveCacheMode() === CACHE_MODES.NETWORK

const loadAllLessons = async () => {
  const now = Date.now()
  const bypassCache = shouldBypassCache()
  const forceRefresh =
    bypassCache || isWithinMoscowWindow(LESSONS_UPDATE_START, LESSONS_UPDATE_END)
  if (!bypassCache && !forceRefresh && inMemoryLessons && inMemoryLessons.expiresAt > now) {
    return inMemoryLessons
  }

  if (!bypassCache) {
    const cached = readCache(LESSONS_CACHE_KEY)
    if (
      !forceRefresh &&
      cached &&
      cached.expiresAt &&
      cached.expiresAt > now &&
      cached.lessonsByCategory
    ) {
      inMemoryLessons = cached
      return cached
    }
  }

  const res = await fetch(LESSONS_ENDPOINT, { method: 'GET' })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()

  const sourcePayload =
    data.lessonsByCategory ?? data.lessons ?? data.records ?? data

  const lessonsByCategory = buildNormalizedLessons(sourcePayload)
  const normalized = {
    lessonsByCategory,
    timestamp: Date.now(),
    expiresAt: getNextMoscowTime(LESSONS_UPDATE_START),
  }

  if (!bypassCache) {
    inMemoryLessons = normalized
    writeCache(LESSONS_CACHE_KEY, normalized)
  } else {
    inMemoryLessons = null
  }

  return normalized
}

export async function fetchCategories() {
  return STATIC_CATEGORIES
}

export async function fetchLessonsByCategory(categoryTitle) {
  const all = await loadAllLessons()
  return all.lessonsByCategory[categoryTitle] ?? []
}

export async function fetchAllLessons() {
  const all = await loadAllLessons()
  const lessonsByCategory = all.lessonsByCategory || {}

  return Object.entries(lessonsByCategory).flatMap(
    ([categoryTitle, lessons = []]) =>
      lessons.map((lesson) => ({
        ...lesson,
        categoryTitle,
      })),
  )
}
