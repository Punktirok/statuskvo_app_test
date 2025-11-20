const storage =
  typeof window !== 'undefined' && window.localStorage ? window.localStorage : null

export const readCache = (key) => {
  if (!storage) return null
  try {
    const raw = storage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const writeCache = (key, value) => {
  if (!storage) return
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota errors
  }
}

export const clearCacheKey = (key) => {
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    // ignore
  }
}
