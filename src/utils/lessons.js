import WebApp from '@twa-dev/sdk'

export const getLessonUrl = (lesson) =>
  lesson?.url || lesson?.link || lesson?.href || lesson?.telegramLink

export const openLessonLink = (lesson) => {
  const targetUrl = getLessonUrl(lesson)

  if (!targetUrl) {
    return false
  }

  try {
    if (
      (targetUrl.startsWith('https://t.me') ||
        targetUrl.startsWith('tg://')) &&
      typeof WebApp.openTelegramLink === 'function'
    ) {
      WebApp.openTelegramLink(targetUrl)
    } else if (typeof WebApp.openLink === 'function') {
      WebApp.openLink(targetUrl, { try_instant_view: false })
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer')
    }
  } catch (_) {
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

  return true
}
