// Хуки React отвечают за хранение данных и работу с побочными эффектами
import { useEffect, useMemo, useRef, useState } from 'react'
// Позволяют узнать какую категорию выбрал пользователь и вернуться назад
import { useNavigate, useParams } from 'react-router-dom'
// Готовые компоненты интерфейса
import SearchBar from '../components/SearchBar.jsx'
import LessonList from '../components/LessonList.jsx'
// Общий хук данных по урокам
import { useLessonsByCategory } from '../hooks/useLessons.js'
// Иконки Telegram адаптированы через SDK
import { getInterfaceIcon, getLessonTypeIcon } from '../utils/iconLoader.js'
import { openLessonLink } from '../utils/lessons.js'
import { useFavorites } from '../context/FavoritesContext.jsx'

const backIcon = getInterfaceIcon('iconBack')
const arrowIcon = getInterfaceIcon('iconArrow')
const folderIcon = getLessonTypeIcon('iconFolder')
const searchIcon = getInterfaceIcon('iconSearch')
const searchIconBig = getInterfaceIcon('iconSearchBig')
const sortIcon = getInterfaceIcon('iconSort')
const checkIcon = getInterfaceIcon('iconCheck')

const normalizeFolderTitle = (value) =>
  typeof value === 'string' ? value.trim() : ''

const formatLessonCount = (count) => {
  const absCount = Math.abs(count)
  const lastDigit = absCount % 10
  const lastTwoDigits = absCount % 100
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `${count} урок`
  }
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return `${count} урока`
  }
  return `${count} уроков`
}

function CategoryScreen() {
  const navigate = useNavigate()
  const { categoryName = '' } = useParams()
  const decodedCategoryName = decodeURIComponent(categoryName)
  const { lessons, loading } = useLessonsByCategory(decodedCategoryName)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { favoriteLessonIds, toggleFavorite } = useFavorites()
  const [activeFolder, setActiveFolder] = useState(null)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const searchInputRef = useRef(null)
  const searchContainerRef = useRef(null)
  const sortMenuRef = useRef(null)
  const sortButtonRef = useRef(null)
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState('desc')

  const trimmedSearch = searchTerm.trim()
  const isSearchExpanded = isSearchOpen

  const filteredLessons = useMemo(() => {
    if (!trimmedSearch) {
      return lessons
    }

    const normalizedTerm = trimmedSearch.toLowerCase()
    const sanitizedTerm = normalizedTerm.replace(/[^\p{L}\p{N}]+/gu, '')
    const hasSanitizedTerm = sanitizedTerm.length >= 2
    const isShortQuery = normalizedTerm.length <= 2

    const tokenize = (text) =>
      text
        .toLowerCase()
        .split(/[\s.,!?:;"'()\[\]{}<>/\\\-]+/u)
        .filter(Boolean)

    const sanitizeValue = (value = '') =>
      value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')

    const textMatches = (text) => {
      if (!text) return false
      const tokens = tokenize(text)
      const tokenMatch = tokens.some((token) =>
        isShortQuery ? token === normalizedTerm : token.includes(normalizedTerm),
      )
      if (tokenMatch) {
        return true
      }
      return hasSanitizedTerm && sanitizeValue(text).includes(sanitizedTerm)
    }

    const tagsMatch = (tags = []) =>
      tags.some((tag) => {
        const tokenMatch = isShortQuery
          ? tag === normalizedTerm
          : tag.includes(normalizedTerm)
        if (tokenMatch) {
          return true
        }
        return hasSanitizedTerm && sanitizeValue(tag).includes(sanitizedTerm)
      })

    return lessons.filter(({ title = '', tags = [] }) =>
      textMatches(title) || tagsMatch(tags),
    )
  }, [lessons, trimmedSearch])

  const emptyMessage = loading
    ? 'Загружаем уроки...'
    : trimmedSearch
      ? 'Ничего не найдено. Попробуйте другой запрос.'
      : 'Скоро тут появятся уроки'

  const handleTouchStart = (event) => {
    const touch = event.touches?.[0]
    if (!touch) return

    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
  }

  const handleTouchEnd = (event) => {
    const touch = event.changedTouches?.[0]
    if (!touch || touchStartX.current == null) {
      return
    }

    const deltaX = touch.clientX - touchStartX.current
    const deltaY = Math.abs(touch.clientY - (touchStartY.current ?? touch.clientY))

    if (touchStartX.current <= 40 && deltaX > 60 && deltaY < 40) {
      navigate(-1)
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  const folderTitlesSet = useMemo(() => {
    const titles = new Set()
    lessons.forEach((lesson) => {
      const folderTitle = normalizeFolderTitle(lesson.folderTitle)
      if (folderTitle) {
        titles.add(folderTitle)
      }
    })
    return titles
  }, [lessons])

  const sortedLessons = useMemo(
    () => (sortOrder === 'desc' ? filteredLessons : [...filteredLessons].reverse()),
    [filteredLessons, sortOrder],
  )

  const { folderEntries, folderMap, lessonsWithoutFolders } = useMemo(() => {
    const map = new Map()
    const withoutFolders = []

    sortedLessons.forEach((lesson) => {
      const folderTitle = normalizeFolderTitle(lesson.folderTitle)
      if (!folderTitle) {
        withoutFolders.push(lesson)
        return
      }
      if (!map.has(folderTitle)) {
        map.set(folderTitle, [])
      }
      map.get(folderTitle).push(lesson)
    })

    return {
      folderMap: map,
      lessonsWithoutFolders: withoutFolders,
      folderEntries: Array.from(map.entries()).map(([title, folderLessons]) => ({
        title,
        lessons: folderLessons,
        count: folderLessons.length,
      })),
    }
  }, [sortedLessons])

  const activeFolderLessons = activeFolder ? folderMap.get(activeFolder) ?? [] : []
  const visibleLessons = activeFolder ? activeFolderLessons : lessonsWithoutFolders
  const shouldRenderLessonList =
    activeFolder || lessonsWithoutFolders.length > 0 || folderEntries.length === 0
  const showFolders = !activeFolder && folderEntries.length > 0
  const screenTitle = activeFolder || decodedCategoryName

  useEffect(() => {
    if (!activeFolder) {
      return
    }
    if (!folderTitlesSet.has(activeFolder)) {
      setActiveFolder(null)
    }
  }, [activeFolder, folderTitlesSet])

  useEffect(() => {
    if (!isSearchOpen) {
      return
    }
    if (typeof document === 'undefined') {
      return
    }
    const handlePointerDown = (event) => {
      if (!searchContainerRef.current) {
        return
      }
      if (!searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isSearchOpen])

  useEffect(() => {
    if (!isSortMenuOpen) {
      return
    }
    if (typeof document === 'undefined') {
      return
    }

    const handlePointerDown = (event) => {
      if (
        sortMenuRef.current?.contains(event.target) ||
        sortButtonRef.current?.contains(event.target)
      ) {
        return
      }
      setIsSortMenuOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isSortMenuOpen])

  useEffect(() => {
    if (!isSearchOpen) {
      return
    }
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
      searchInputRef.current?.focus()
      return
    }
    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [isSearchOpen])

  const handleBackClick = () => {
    if (activeFolder) {
      setActiveFolder(null)
      return
    }
    navigate(-1)
  }

  const handleOpenSearch = () => {
    setIsSearchOpen(true)
  }

  const handleToggleSortMenu = () => {
    setIsSortMenuOpen((prev) => !prev)
  }

  const handleSortChange = (order) => {
    setSortOrder(order)
    setIsSortMenuOpen(false)
  }

  return (
    <div
      className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-surface-primary px-4 pb-12 md:max-w-[540px]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Центральная колонка: фон, отступы и скругления совпадают с дизайном мини-аппа */}
      <div className="flex flex-1 flex-col gap-3">
        {/* Фиксированная шапка с кнопкой назад, заголовком и поиском */}
        <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 bg-surface-primary px-4 pt-3.5 pb-1 md:-mx-4">
          <header className="relative flex min-h-[48px] items-center">
            <button
              type="button"
              aria-label="Назад"
              onClick={handleBackClick}
              className="flex h-[32px] w-[46px] items-center justify-center rounded-full bg-surface-card shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {backIcon && (
                <img
                  src={backIcon}
                  alt=""
                  className="size-5"
                  aria-hidden="true"
                />
              )}
            </button>
            {isSearchExpanded ? (
              <div ref={searchContainerRef} className="ml-3 flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="h-12 w-full rounded-[41px] border border-black/5 px-5 py-2.5 shadow-none"
                  inputRef={searchInputRef}
                />
              </div>
            ) : (
              <>
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
                  <h1 className="max-w-[60vw] truncate text-center text-base font-semibold tracking-tight text-text-primary">
                    {screenTitle}
                  </h1>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  {sortIcon && (
                    <button
                      type="button"
                      aria-label="Сортировать"
                      onClick={handleToggleSortMenu}
                      ref={sortButtonRef}
                      className="relative flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <img src={sortIcon} alt="" className="h-6 w-6" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Показать поиск"
                    onClick={handleOpenSearch}
                    className="flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {(searchIconBig || searchIcon) && (
                      <img
                        src={searchIconBig ?? searchIcon}
                        alt=""
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              </>
            )}
            {isSortMenuOpen && (
              <div
                ref={sortMenuRef}
                className="absolute right-0 top-full mt-2 w-56 rounded-3xl bg-white/95 p-2 text-sm font-medium text-text-primary shadow-[0px_12px_30px_rgba(20,20,43,0.12)] backdrop-blur-md"
              >
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleSortChange('desc')}
                    className={`flex items-center justify-between rounded-2xl px-3 py-3 text-left ${
                      sortOrder === 'desc'
                        ? 'bg-surface-primary text-text-primary'
                        : 'text-text-secondary hover:bg-surface-primary/70'
                    }`}
                  >
                    <span>От новых к старым</span>
                    {sortOrder === 'desc' && checkIcon && (
                      <img src={checkIcon} alt="" className="ml-3 h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSortChange('asc')}
                    className={`flex items-center justify-between rounded-2xl px-3 py-3 text-left ${
                      sortOrder === 'asc'
                        ? 'bg-surface-primary text-text-primary'
                        : 'text-text-secondary hover:bg-surface-primary/70'
                    }`}
                  >
                    <span>От старых к новым</span>
                    {sortOrder === 'asc' && checkIcon && (
                      <img src={checkIcon} alt="" className="ml-3 h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </header>
        </div>

        {showFolders && (
          <div className="rounded-[20px] bg-surface-card px-4 py-1 shadow-card">
            <div className="custom-divide [--divide-offset:60px] [&>*:first-child]:pt-3 [&>*:last-child]:pb-3">
              {folderEntries.map(({ title, count }) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => setActiveFolder(title)}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="flex items-center gap-3">
                    {folderIcon && (
                      <img
                        src={folderIcon}
                        alt=""
                        className="size-12 rounded-1xl"
                        aria-hidden="true"
                      />
                    )}
                    <span className="flex flex-col text-left">
                      <span className="text-base font-medium leading-snug text-text-primary">
                        {title}
                      </span>
                      <span className="text-sm font-medium text-[#9F9F9F]">
                        {formatLessonCount(count)}
                      </span>
                    </span>
                  </span>
                  {arrowIcon && (
                    <img
                      src={arrowIcon}
                      alt=""
                      className="size-3 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {shouldRenderLessonList && (
          <LessonList
            lessons={visibleLessons}
            onLessonClick={openLessonLink}
            emptyMessage={emptyMessage}
            showFavoriteToggle
            favoriteLessonIds={favoriteLessonIds}
            onToggleFavorite={(lesson) => toggleFavorite(lesson.lesson_id)}
            loading={loading}
          />
        )}

        {!shouldRenderLessonList && !loading && (
          <div className="rounded-[20px] bg-surface-card px-4 py-6 text-center text-sm text-text-secondary shadow-card">
            {trimmedSearch
              ? 'Выберите папку с подходящими уроками выше.'
              : 'Посмотрите уроки в папках выше.'}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryScreen
