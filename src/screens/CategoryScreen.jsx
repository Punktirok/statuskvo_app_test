// Хуки React отвечают за хранение данных и работу с побочными эффектами
import { useEffect, useMemo, useState } from 'react'
// Позволяют узнать какую категорию выбрал пользователь и вернуться назад
import { useNavigate, useParams } from 'react-router-dom'
// Готовый компонент строки поиска, который используется в обоих экранах
import SearchBar from '../components/SearchBar.jsx'
// Временная функция, имитирующая запрос уроков (позже можно подключить реальное API)
import WebApp from '@twa-dev/sdk'
const openLesson = (url) => {
  if (!url) return
  // принимает https://t.me/... или https://t.me/c/.../123, и tg://...
  WebApp.openTelegramLink(url)
}

import { fetchLessonsByCategory } from '../api/api.js'
import {
  getInterfaceIcon,
  getLessonTypeIcon,
} from '../utils/iconLoader.js'

const backIcon = getInterfaceIcon('iconBack')
const arrowIcon = getInterfaceIcon('iconArrow')

function CategoryScreen() {
  const navigate = useNavigate()
  const { categoryName = '' } = useParams()
  const decodedCategoryName = decodeURIComponent(categoryName)
  // Список уроков для выбранной категории
  const [lessons, setLessons] = useState([])
  // Текст, который вводит пользователь в поле поиска уроков
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let isMounted = true

    // Обновляем список уроков, как только пользователь открывает новую категорию
    fetchLessonsByCategory(decodedCategoryName).then((data) => {
      if (isMounted) {
        setLessons(data)
      }
    })

    return () => {
      isMounted = false
    }
  }, [decodedCategoryName])

  // Ограничиваем уроки по запросу из поиска, чтобы показывать только подходящие
  const filteredLessons = useMemo(() => {
    if (!searchTerm.trim()) {
      return lessons
    }

    const normalizedTerm = searchTerm.toLowerCase()
    return lessons.filter(({ title }) =>
      title.toLowerCase().includes(normalizedTerm),
    )
  }, [lessons, searchTerm])

  const hasLessons = filteredLessons.length > 0

  // Визуальная часть экрана целиком повторяет макет: шапка, поиск и список карточек
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col bg-surface-primary px-4 pb-12 pt-7">
      {/* Центральная колонка: фон, отступы и скругления совпадают с дизайном мини-аппа */}
      <div className="flex flex-col gap-7">
        {/* Шапка с кнопкой назад и названием выбранной категории */}
        <header className="relative flex items-center justify-center">
          <button
            type="button"
            aria-label="Назад"
            onClick={() => navigate(-1)}
            className="absolute left-0  items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
        {/* Карточка со списком уроков выбранной категории */}
        {hasLessons ? (
          <div className="rounded-[20px] bg-surface-card px-4 py-1 shadow-card">
             <div className="custom-divide [--divide-offset:60px]">

              {/* Пробегаемся по каждому уроку и выводим его отдельной строкой */}
              {filteredLessons.map(({ id, title, type }) => {
                const iconSrc = getLessonTypeIcon(type)

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => openLesson(url)}  // ← вот это
                    className="flex w-full items-start gap-3 py-3 text-left transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {/* Пиктограмма задаёт тип урока: видео, статья, подкаст и т.д. */}
                    {iconSrc && (
                      <img
                        src={iconSrc}
                        alt=""
                        className="size-12 rounded-1xl"
                        aria-hidden="true"
                      />
                    )}
                    {/* Название урока — основная информация для пользователя */}
                    <span className="self-center flex-1 text-base font-medium leading-snug text-text-primary">
                      {title}
                    </span>
                    {/* Стрелка показывает, что элемент можно раскрыть в будущем */}
                    {arrowIcon && (
                      <img
                        src={arrowIcon}
                        alt=""
                         className="size-3 shrink-0 self-center"
                          aria-hidden="true"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-[20px] bg-surface-card px-4 py-6 text-center text-sm text-text-secondary shadow-card">
            {/* Плашка-заглушка, если уроки для категории не найдены */}
            Скоро тут появятся уроки
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryScreen
