import WebApp from '@twa-dev/sdk'
import { debugLog } from './debugLogger.js'

export const getLessonUrl = (lesson) =>
  lesson?.url || lesson?.link || lesson?.href || lesson?.telegramLink

export const openLessonLink = (lesson) => {
  const targetUrl = getLessonUrl(lesson)

  if (!targetUrl) {
    debugLog('openLessonLink:missing-url', { lesson })
    return false
  }

  const meta = {
    lessonId: lesson?.id ?? lesson?.baseId ?? lesson?.title,
    platform: WebApp.platform,
    targetUrl,
  }

  try {
    if (
      (targetUrl.startsWith('https://t.me') ||
        targetUrl.startsWith('tg://')) &&
      typeof WebApp.openTelegramLink === 'function'
    ) {
      debugLog('openLessonLink:openTelegramLink', meta)
      WebApp.openTelegramLink(targetUrl)
      WebApp.close()
    } else if (typeof WebApp.openLink === 'function') {
      debugLog('openLessonLink:openLink', meta)
      WebApp.openLink(targetUrl, { try_instant_view: false })
      WebApp.close()
    } else {
      debugLog('openLessonLink:windowOpen', meta)
      window.open(targetUrl, '_blank', 'noopener,noreferrer')
    }
  } catch (error) {
    debugLog('openLessonLink:error', { ...meta, error: error?.message })
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

  return true
}
