import { useMemo, useState } from 'react'
import SearchBar from '../components/SearchBar.jsx'
import LessonList from '../components/LessonList.jsx'
import { useFavorites } from '../context/FavoritesContext.jsx'

function FavoritesScreen({
  lessons = [],
  loading,
  onLessonClick,
  onSearchFocus,
  onSearchBlur,
}) {
  const { favoriteLessonIds, toggleFavorite } = useFavorites()
  const [searchTerm, setSearchTerm] = useState('')

  const favorites = useMemo(() => {
    if (!favoriteLessonIds || favoriteLessonIds.size === 0) {
      return []
    }

    const byId = new Map()
    lessons.forEach((lesson) => {
      const { lesson_id, isPrimaryCategory } = lesson
      if (!lesson_id || !favoriteLessonIds.has(lesson_id)) {
        return
      }

      if (!byId.has(lesson_id) || isPrimaryCategory !== false) {
        byId.set(lesson_id, lesson)
      }
    })

    return Array.from(byId.values())
  }, [lessons, favoriteLessonIds])

  const normalizedQuery = searchTerm.trim().toLowerCase()

  const filteredFavorites = useMemo(() => {
    if (!normalizedQuery) {
      return favorites
    }
    return favorites.filter(({ title = '', categoryTitle = '' }) => {
      const combined = `${title} ${categoryTitle}`.toLowerCase()
      return combined.includes(normalizedQuery)
    })
  }, [favorites, normalizedQuery])

  const emptyMessage = loading
    ? 'Загружаем избранное...'
    : favoriteLessonIds.size === 0
      ? 'Добавьте уроки в избранное, чтобы увидеть их здесь'
      : 'Совпадений нет. Попробуйте другой запрос.'

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-text-primary">Избранное</h2>
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        className="h-12 rounded-[41px] border border-black/5 px-5 py-2.5 shadow-none"
        placeholder="Поиск по избранным"
        inputProps={{
          onFocus: onSearchFocus,
          onBlur: onSearchBlur,
        }}
      />

      <LessonList
        lessons={filteredFavorites}
        onLessonClick={onLessonClick}
        emptyMessage={emptyMessage}
        showCategoryLabel
        showFavoriteToggle
        favoriteLessonIds={favoriteLessonIds}
        onToggleFavorite={(lesson) => toggleFavorite(lesson.lesson_id)}
      />
    </div>
  )
}

export default FavoritesScreen
