const MSK_OFFSET_MS = 3 * 60 * 60 * 1000

export const getMoscowDate = (date = new Date()) =>
  new Date(date.getTime() + MSK_OFFSET_MS)

export const getMoscowHours = (date = new Date()) => getMoscowDate(date).getUTCHours()

export const isWithinMoscowWindow = (startHour, endHour, date = new Date()) => {
  const hours = getMoscowHours(date)
  return hours >= startHour && hours < endHour
}

export const getNextMoscowTime = (hour, minute = 0, date = new Date()) => {
  const current = getMoscowDate(date)
  const target = new Date(current)
  target.setUTCHours(hour, minute, 0, 0)
  if (target <= current) {
    target.setUTCDate(target.getUTCDate() + 1)
  }
  return target.getTime() - MSK_OFFSET_MS
}
