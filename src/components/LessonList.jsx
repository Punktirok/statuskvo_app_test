import { getCategoryIcon, getInterfaceIcon, getLessonTypeIcon } from '../utils/iconLoader.js'
import { getLessonUrl } from '../utils/lessons.js'

const arrowIcon = getInterfaceIcon('iconArrow')

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
}) {
  const hasLessons = lessons.length > 0

  return (
    <div className="rounded-[20px] bg-surface-card px-4 py-1 shadow-card">
      <div className="custom-divide [--divide-offset:60px]">
        {hasLessons ? (
          lessons.map((lesson) => {
            const { id, title, categoryTitle } = lesson
            const iconSrc = resolveIcon(lesson)
            const lessonHasUrl = Boolean(getLessonUrl(lesson))

            const handleClick = () => {
              if (!lessonHasUrl || !onLessonClick) return
              onLessonClick(lesson)
            }

            return (
              <button
                key={id ?? `${title}-${categoryTitle}`}
                type="button"
                onClick={handleClick}
                disabled={!lessonHasUrl}
                className="flex w-full items-center gap-3 py-3 text-left transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {iconSrc && (
                  <img
                    src={iconSrc}
                    alt=""
                    className={`size-12 rounded-2xl ${showCategoryLabel ? 'self-start' : ''}`}
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
