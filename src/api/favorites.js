const FAVORITES_URL = 'https://sanya-kvo.up.railway.app/webhook/favorites'

export async function getFavorites(userId) {
  if (!userId) {
    return []
  }

  const url = `${FAVORITES_URL}?userId=${encodeURIComponent(userId)}`

  try {
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      console.error('getFavorites error', res.status)
      return []
    }

    const data = await res.json().catch(() => ({}))
    if (data && Array.isArray(data.favorites)) {
      return data.favorites.map(String)
    }
    return []
  } catch (error) {
    console.error('getFavorites error', error)
    return []
  }
}

const postFavorite = async (payload) => {
  try {
    const res = await fetch(FAVORITES_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.error(`${payload.action}Favorite error`, res.status)
      return false
    }

    const data = await res.json().catch(() => ({}))
    return Boolean(data && data.ok)
  } catch (error) {
    console.error(`${payload.action}Favorite error`, error)
    return false
  }
}

export async function addFavorite(userId, lessonId) {
  if (!userId || !lessonId) {
    return false
  }
  return postFavorite({ userId, lessonId, action: 'add' })
}

export async function removeFavorite(userId, lessonId) {
  if (!userId || !lessonId) {
    return false
  }
  return postFavorite({ userId, lessonId, action: 'remove' })
}
