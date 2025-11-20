import { useEffect, useState } from 'react'
import { fetchFaqCards } from '../api/content.js'
import { readCache, writeCache } from '../utils/cache.js'
import { getNextMoscowTime } from '../utils/time.js'

const CACHE_KEY = 'faq-cards'

export function useFaqCards() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    const now = Date.now()
    const cached = readCache(CACHE_KEY)
    const hasCacheData = cached && Array.isArray(cached.data)
    const cacheValid = cached && cached.expiresAt && cached.expiresAt > now

    if (hasCacheData) {
      setCards(cached.data)
      setLoading(!cacheValid)
    }

    if (cacheValid) {
      setLoading(false)
      return () => {
        active = false
      }
    }

    fetchFaqCards()
      .then((data) => {
        if (!active) return
        setCards(data ?? [])
        setError(null)
        writeCache(CACHE_KEY, {
          data: data ?? [],
          expiresAt: getNextMoscowTime(11),
        })
      })
      .catch((err) => {
        if (!active) return
        setError(err)
        if (!hasCacheData) {
          setCards([])
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return { cards, loading, error }
}
