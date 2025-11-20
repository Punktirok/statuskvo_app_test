import { FIRST_CLUB_ENDPOINT } from './config.js'

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

export async function fetchFaqCards() {
  const res = await fetch('https://sanya-kvo.up.railway.app/webhook/faq', {
    method: 'GET',
  })
  if (!res.ok) {
    throw new Error(`FAQ API ${res.status}`)
  }
  const data = await res.json()
  if (!Array.isArray(data)) {
    return []
  }
  return [...data].sort((a, b) => {
    const left = a.faq_cardId ?? ''
    const right = b.faq_cardId ?? ''
    return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' })
  })
}
