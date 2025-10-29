// Библиотечные хуки React для хранения данных и реакции на изменения
import { useEffect, useMemo, useState } from 'react'
// Позволяет переключаться между экранами без перезагрузки страницы
import { useNavigate } from 'react-router-dom'
// Повторно используемая строка поиска
import SearchBar from '../components/SearchBar.jsx'
// Временная функция, которая возвращает список категорий (позже заменим на API)
import { fetchCategories } from '../api/api.js'
// Утилита для подстановки нужных иконок по имени файла
import { getCategoryIcon, getInterfaceIcon } from '../utils/iconLoader.js'

const arrowIcon = getInterfaceIcon('iconArrow')

function HomeScreen() {
  const navigate = useNavigate()
  // Сохраняем полный список категорий, который получаем из временного API
  const [categories, setCategories] = useState([])
  // Значение, которое пользователь вводит в поле поиска
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let isMounted = true

    // Получаем данные и сохраняем в состоянии, чтобы отрисовать список на экране
    fetchCategories().then((data) => {
      if (isMounted) {
        setCategories(data)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  // Отфильтрованный список категорий, который обновляется при вводе в поиск
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return categories
    }

    const normalizedTerm = searchTerm.toLowerCase()
    return categories.filter(({ title }) =>
      title.toLowerCase().includes(normalizedTerm),
    )
  }, [categories, searchTerm])

  // Открываем экран выбранной категории и передаём её название через адрес страницы
  const handleCategoryClick = (categoryTitle) => {
    navigate(`/category/${encodeURIComponent(categoryTitle)}`)
  }

  const hasCategories = filteredCategories.length > 0
  // Отдельно выделяем первую категорию для крупной карточки
  const primaryCategory = hasCategories ? filteredCategories[0] : null
  // Остальные категории собираем в группы
  const secondaryCategories = hasCategories ? filteredCategories.slice(1) : []

  // Разметка экрана: контейнеры и карточки повторяют дизайн макета
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-surface-primary px-4 pb-12 pt-3.5 md:max-w-[540px]">
      {/* Основная колонка с отступами, чтобы интерфейс выглядел как в макете */}
      <div className="flex flex-col gap-4">
        {/* Поисковый блок для фильтрации категорий */}
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          className="h-12 rounded-[41px] border border-black/5 px-5 py-2.5 shadow-none"
        />

        {hasCategories ? (
          <div className="flex flex-col gap-3">
            {/* Первый промо-блок категории */}
            {primaryCategory && (
              <button
                type="button"
                onClick={() => handleCategoryClick(primaryCategory.title)}
                className="flex w-full items-center justify-between gap-3 rounded-[20px] bg-surface-card py-3 px-4 text-left transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"

              >
                <span className="flex items-center gap-3">
                  {/* Большая иконка помогает сразу понять тематику категории */}
                  {getCategoryIcon(primaryCategory.iconKey) && (
                    <img
                      src={getCategoryIcon(primaryCategory.iconKey)}
                      alt=""
                      className="size-5 rounded-1xl"
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-base font-medium text-text-primary">
                    {primaryCategory.title}
                  </span>
                </span>
                {/* Стрелка показывает, что можно перейти к экрану категории */}
                {arrowIcon && (
                  <img
                    src={arrowIcon}
                    alt=""
                    className="size-3 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </button>
            )}
            {/* Основной список категорий, разбитый на визуальные секции */}
            {secondaryCategories.length > 0 && (
              <div className="space-y-3">
                {/* Секции с категориями: в точности повторяют сетку с макета */}
                {/* Первая карточка с категориями */}
                <div className="rounded-[20px] bg-surface-card px-4 py-2 shadow-card">
                <div className="custom-divide [&>*:last-child]:pb-1.5">
                    {/* Перебираем первые шесть категорий и показываем их построчно */}
                    {secondaryCategories.slice(0, 6).map(({ title, iconKey }) => {
                      const iconSrc = getCategoryIcon(iconKey)
                      return (
                        <button
                          key={title}
                          type="button"
                          onClick={() => handleCategoryClick(title)}
                          className="flex w-full items-center justify-between gap-3 py-3 first:pt-1 last:pb-1 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent hover:text-accent"
                        >
                          <span className="flex items-center gap-3">
                            {/* Компактные иконки для наглядности списка */}
                            {iconSrc && (
                              <img
                                src={iconSrc}
                                alt=""
                                className="size-5 rounded-1xl"
                                aria-hidden="true"
                              />
                            )}
                            <span className="text-base font-medium text-text-primary">
                              {title}
                            </span>
                          </span>
                          {/* Стрелка показывает, что можно перейти к экрану категории */}
                          {arrowIcon && (
                            <img
                              src={arrowIcon}
                              alt=""
                              className="size-3 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Дополнительная карточка категорий, если элементов больше */}
                {secondaryCategories.length > 6 && (
                  <div className="rounded-[20px] bg-surface-card px-4 py-2 shadow-card">
                    {/* Если категорий много, показываем вторую карточку — пользователю понятно, что это продолжение списка */}
                    <div className="custom-divide [&>*:last-child]:pb-1.5">
                      {/* Остальные категории попадают во вторую группу */}
                      {secondaryCategories.slice(6).map(({ title, iconKey }) => {
                        const iconSrc = getCategoryIcon(iconKey)
                        return (
                          <button
                            key={title}
                            type="button"
                            onClick={() => handleCategoryClick(title)}
                            className="flex w-full items-center justify-between gap-3 py-3 first:pt-1 last:pb-1  text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent hover:text-accent"
                          >
                            <span className="flex items-center gap-3">
                              {/* Повторяем иконку, чтобы человек сразу узнал категорию */}
                              {iconSrc && (
                                <img
                                  src={iconSrc}
                                  alt=""
                                  className="size-5 rounded-1xl"
                                  aria-hidden="true"
                                />
                              )}
                              <span className="text-base font-medium text-text-primary">
                                {title}
                              </span>
                            </span>
                            {/* Та же стрелка для перехода к деталям */}
                            {arrowIcon && (
                              <img
                                src={arrowIcon}
                                alt=""
                                className="size-3 shrink-0"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[20px] bg-surface-card px-4 py-6 text-center text-sm text-text-secondary shadow-card">
            {/* Плашка с сообщением, если ничего не найдено */}
            Кажется, такого нет
          </div>
        )}
      </div>
    </div>
  )
}

export default HomeScreen
