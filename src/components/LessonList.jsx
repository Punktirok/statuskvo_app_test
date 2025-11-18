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
        d="M6 5H18V19L12 12.7778L6 19V5Z"
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
            const { lesson_id, title, categoryTitle, primaryCategoryTitle } = lesson
            const iconSrc = resolveIcon(lesson)
            const lessonHasUrl = Boolean(getLessonUrl(lesson))
            if (!lesson_id) {
              return null
            }
            const lessonKey = lesson_id
            const isFavorite = favoritesSet.has(lessonKey)
            const labelCategory = primaryCategoryTitle || categoryTitle

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
                    className={`size-12 rounded-1xl ${(showCategoryLabel || showFavoriteToggle) ? 'self-start' : ''}`}
                    aria-hidden="true"
                  />
                )}

                <span className="flex-1 text-left">
                  <span className="block text-base font-medium leading-snug text-text-primary line-clamp-3">
                    {title}
                  </span>

                  {showCategoryLabel && labelCategory && (
                    <span className="mt-1 block text-sm font-medium text-[#9F9F9F]">
                      {labelCategory}
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
