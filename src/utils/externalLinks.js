import { openLessonLink } from './lessons.js'

const isClubChannelLink = (url) =>
  typeof url === 'string' && url.toLowerCase().startsWith('https://t.me/c')

export const openExternalUrl = (url) => {
  if (!url) return false

  if (isClubChannelLink(url)) {
    return openLessonLink({ url })
  }

  if (typeof window === 'undefined') {
    return false
  }

  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}
