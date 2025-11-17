import { getCategoryIcon, getInterfaceIcon, getLessonTypeIcon } from '../utils/iconLoader.js'
import { getLessonUrl } from '../utils/lessons.js'

const arrowIcon = getInterfaceIcon('iconArrow')
const emptyFavoritesSet = new Set()

function resolveIcon({ type, iconKey }) {
  if (type) {
    const lessonTypeIcon = getLessonTypeIcon(type)
    if (lessonTypeIcon) {
      return lessonTypeIcon
    }
  }

  if (iconKey) {
    return getCategoryIcon(iconKey)
  }

  return null
}

function LessonList({
  lessons = [],
  onLessonClick,
  emptyMessage = 'Ничего не найдено. Попробуйте другой запрос.',
  showCategoryLabel = false,
  showFavoriteToggle = false,
  favoriteLessonIds,
  onToggleFavorite,
}) {
  const hasLessons = lessons.length > 0
  const favoritesSet = favoriteLessonIds ?? emptyFavoritesSet

  const FavoriteIcon = ({ filled }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M18.7663 6.2377C18.3753 5.84531 17.9111 5.53404 17.4002 5.32168C16.8893 5.10931 16.3417 5 15.7887 5C15.2357 5 14.6881 5.10931 14.1772 5.32168C13.6663 5.53404 13.2021 5.84531 12.8112 6.2377L11.9998 7.05166L11.1884 6.2377C10.3987 5.44548 9.32768 5.00041 8.21089 5.00041C7.09409 5.00041 6.02303 5.44548 5.23334 6.2377C4.44365 7.02993 4 8.10441 4 9.22479C4 10.3452 4.44365 11.4196 5.23334 12.2119L6.0447 13.0258L11.9998 19L17.9549 13.0258L18.7663 12.2119C19.1574 11.8197 19.4677 11.354 19.6794 10.8415C19.891 10.3289 20 9.77958 20 9.22479C20 8.67 19.891 8.12064 19.6794 7.60811C19.4677 7.09558 19.1574 6.6299 18.7663 6.2377Z"
        stroke="#BABBC8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? '#BABBC8' : 'none'}
      />
    </svg>
  )

  return (
    <div className="rounded-[20px] bg-surface-card px-4 py-1 shadow-card">
      <div className="custom-divide [--divide-offset:60px]">
        {hasLessons ? (
          lessons.map((lesson) => {
            const { lesson_id, title, categoryTitle } = lesson
            const iconSrc = resolveIcon(lesson)
            const lessonHasUrl = Boolean(getLessonUrl(lesson))
            if (!lesson_id) {
              return null
            }
            const lessonKey = lesson_id
            const isFavorite = favoritesSet.has(lessonKey)

            const handleClick = () => {
              if (!lessonHasUrl || !onLessonClick) return
              onLessonClick(lesson)
            }

            return (
              <button
                key={lessonKey}
                type="button"
                onClick={handleClick}
                disabled={!lessonHasUrl}
                className="flex w-full items-center gap-3 py-3 text-left transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {iconSrc && (
                  <img
                    src={iconSrc}
                    alt=""
                    className={`size-12 rounded-2xl ${(showCategoryLabel || showFavoriteToggle) ? 'self-start' : ''}`}
                    aria-hidden="true"
                  />
                )}

                <span className="flex-1 text-left">
                  <span className="block text-base font-medium leading-snug text-text-primary line-clamp-3">
                    {title}
                  </span>

                  {showCategoryLabel && categoryTitle && (
                    <span className="mt-1 block text-sm font-medium text-[#9F9F9F]">
                      {categoryTitle}
                    </span>
                  )}
                </span>

                {!showFavoriteToggle && arrowIcon && (
                  <img
                    src={arrowIcon}
                    alt=""
                    className="size-3 shrink-0 self-center"
                    aria-hidden="true"
                  />
                )}

                {showFavoriteToggle && (
                  <button
                    type="button"
                    aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                    aria-pressed={isFavorite}
                    className="mt-0.5 flex items-center justify-center self-start"
                    onClick={(event) => {
                      event.stopPropagation()
                      onToggleFavorite?.(lesson, isFavorite)
                    }}
                  >
                    <FavoriteIcon filled={isFavorite} />
                  </button>
                )}
              </button>
            )
          })
        ) : (
          <div className="py-6 text-center text-sm text-text-secondary">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonList
