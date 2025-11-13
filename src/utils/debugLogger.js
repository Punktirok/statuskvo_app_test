const DEBUG_FLAG_KEY = 'sk-debug-logs'

const shouldLog = () => {
  if (typeof window === 'undefined') {
    return import.meta.env.DEV
  }

  return (
    import.meta.env.DEV ||
    window.__SK_DEBUG_LOGS_ENABLED__ === true ||
    localStorage.getItem(DEBUG_FLAG_KEY) === '1' ||
    window.location.hostname.includes('study-kvo.ru')
  )
}

export const debugLog = (label, details = {}) => {
  if (!shouldLog()) {
    return
  }

  const entry = {
    label,
    details,
    timestamp: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    const store = window.__SK_DEBUG_LOGS__ || []
    store.push(entry)
    window.__SK_DEBUG_LOGS__ = store
  }

  // eslint-disable-next-line no-console
  console.group(`[SK DEBUG] ${entry.timestamp} — ${label}`)
  // eslint-disable-next-line no-console
  console.log(details)
  // eslint-disable-next-line no-console
  console.groupEnd()
}

export const enableDebugLogs = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DEBUG_FLAG_KEY, '1')
  }
}

export const disableDebugLogs = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEBUG_FLAG_KEY)
  }
}
