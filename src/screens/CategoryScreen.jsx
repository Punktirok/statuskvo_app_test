// Хуки React отвечают за хранение данных и работу с побочными эффектами
import { useMemo, useState } from 'react'
// Позволяют узнать какую категорию выбрал пользователь и вернуться назад
import { useNavigate, useParams } from 'react-router-dom'
// Готовые компоненты интерфейса
import SearchBar from '../components/SearchBar.jsx'
import LessonList from '../components/LessonList.jsx'
// Общий хук данных по урокам
import { useLessonsByCategory } from '../hooks/useLessons.js'
// Иконки Telegram адаптированы через SDK
import { getInterfaceIcon } from '../utils/iconLoader.js'
import { openLessonLink } from '../utils/lessons.js'

const backIcon = getInterfaceIcon('iconBack')

function CategoryScreen() {
  const navigate = useNavigate()
  const { categoryName = '' } = useParams()
  const decodedCategoryName = decodeURIComponent(categoryName)
  const { lessons, loading } = useLessonsByCategory(decodedCategoryName)
  const [searchTerm, setSearchTerm] = useState('')

  const trimmedSearch = searchTerm.trim()

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

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-surface-primary px-4 pb-12 md:max-w-[540px]">
      {/* Центральная колонка: фон, отступы и скругления совпадают с дизайном мини-аппа */}
      <div className="flex flex-col gap-3">
        {/* Фиксированная шапка с кнопкой назад, заголовком и поиском */}
        <div className="sticky top-0 z-10 flex flex-col gap-3 bg-surface-primary pt-3.5 pb-3">
          <header className="relative flex items-center justify-center">
            <button
              type="button"
              aria-label="Назад"
              onClick={() => navigate(-1)}
              className="absolute left-0 flex h-[32px] w-[46px] items-center justify-center rounded-full bg-surface-card shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
            <h1 className="text-base font-semibold tracking-tight text-text-primary md:text-lg">
              {decodedCategoryName}
            </h1>
            <span className="size-10 shrink-0" />
          </header>

          {/* Поисковая строка для фильтрации уроков */}
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            className="h-12 rounded-[41px] border border-black/5 px-5 py-2.5 shadow-none"
          />
        </div>

        <LessonList
          lessons={filteredLessons}
          onLessonClick={openLessonLink}
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  )
}

export default CategoryScreen
