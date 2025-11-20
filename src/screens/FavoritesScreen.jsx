import { useMemo, useState } from 'react'
import SearchBar from '../components/SearchBar.jsx'
import LessonList from '../components/LessonList.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useFavorites } from '../context/FavoritesContext.jsx'
import { getInterfaceIcon } from '../utils/iconLoader.js'

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

  const showEmptyState = !loading && favoriteLessonIds.size === 0
  const showNoResults =
    !loading && favoriteLessonIds.size > 0 && filteredFavorites.length === 0

  const emptyMessage = loading
    ? 'Загружаем избранное...'
    : 'Совпадений нет. Попробуйте другой запрос.'

  const emptyStateImage = getInterfaceIcon('imgEmpty')

  const showSearch = !showEmptyState

  return (
    <div className="flex flex-1 flex-col gap-3">
      {!showEmptyState && (
        <h2 className="text-base font-semibold tracking-tight text-text-primary text-center">
          Избранное
        </h2>
      )}
      {showSearch && (
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
      )}

      {showEmptyState ? (
        <div className="grid flex-1 grid-rows-[1fr_auto_2fr] text-center">
          <div aria-hidden="true" />
          <EmptyState
            imageSrc={emptyStateImage}
            title="Пока пусто"
            description="Здесь будут уроки, которые вы добавите в избранное"
            className="bg-transparent shadow-none"
          />
          <div aria-hidden="true" />
        </div>
      ) : (
        <LessonList
          lessons={filteredFavorites}
          onLessonClick={onLessonClick}
          emptyMessage={showNoResults ? emptyMessage : undefined}
          showCategoryLabel
          showFavoriteToggle
          favoriteLessonIds={favoriteLessonIds}
          onToggleFavorite={(lesson) => toggleFavorite(lesson.lesson_id)}
          loading={loading}
        />
      )}
    </div>
  )
}

export default FavoritesScreen
