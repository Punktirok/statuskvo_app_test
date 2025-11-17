import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { addFavorite, getFavorites, removeFavorite } from '../api/favorites.js'

const FavoritesContext = createContext({
  favoriteLessonIds: new Set(),
  loading: true,
  toggleFavorite: () => {},
  isFavorite: () => false,
})

export function FavoritesProvider({ children }) {
  const [favoriteLessonIds, setFavoriteLessonIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  const userId =
    WebApp.initDataUnsafe?.user?.id?.toString() ?? 'anonymous'

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    getFavorites(userId)
      .then((favorites) => {
        if (cancelled) return
        setFavoriteLessonIds(new Set(favorites))
      })
      .catch(() => {
        if (cancelled) return
        setFavoriteLessonIds(new Set())
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const toggleFavorite = (lessonId) => {
    if (!lessonId || !userId) {
      return
    }

    const isFavorite = favoriteLessonIds.has(lessonId)

    if (isFavorite) {
      setFavoriteLessonIds((prev) => {
        const next = new Set(prev)
        next.delete(lessonId)
        return next
      })

      removeFavorite(userId, lessonId).then((ok) => {
        if (ok) {
          return
        }
        setFavoriteLessonIds((prev) => {
          const next = new Set(prev)
          next.add(lessonId)
          return next
        })
      })
      return
    }

    setFavoriteLessonIds((prev) => {
      const next = new Set(prev)
      next.add(lessonId)
      return next
    })

    addFavorite(userId, lessonId).then((ok) => {
      if (ok) {
        return
      }
      setFavoriteLessonIds((prev) => {
        const next = new Set(prev)
        next.delete(lessonId)
        return next
      })
    })
  }

  const value = useMemo(
    () => ({
      favoriteLessonIds,
      loading,
      toggleFavorite,
      isFavorite: (lessonId) => favoriteLessonIds.has(lessonId),
    }),
    [favoriteLessonIds, loading],
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)
