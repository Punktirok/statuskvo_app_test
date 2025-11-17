import { getInterfaceIcon } from '../utils/iconLoader.js'

const arrowIcon = getInterfaceIcon('iconArrow')
const bannerImage = getInterfaceIcon('imgImNew')

const getIcon = (name) =>
  new URL(`../assets/icons/category/category/${name}.png`, import.meta.url).href

const infoSections = [
  {
    title: 'Доступ в чат клуба',
    icon: getIcon('iconChat'),
  },
  {
    title: 'Ответы на вопросы',
    icon: getIcon('iconFAQ'),
  },
  {
    title: 'Написать в поддержку',
    icon: getIcon('iconSupport'),
  },
  {
    title: 'Юридическое',
    icon: getIcon('iconJustice'),
  },
]

function InfoScreen() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight text-text-primary text-center">
        Всякое важное
      </h2>

      <div className="relative flex h-[79px] items-center overflow-hidden rounded-[20px] bg-[#FF57B4] py-4 pl-6 pr-4">
        <p className="z-10 max-w-[200px] text-base font-semibold leading-snug text-white">
          Я впервые в клубе,
          <br />
          с чего начать?
        </p>
        {bannerImage && (
          <img
            src={bannerImage}
            alt=""
            className="pointer-events-none absolute right-0 top-1/2 max-h-full -translate-y-1/2"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="rounded-[20px] bg-surface-card px-4 py-2 shadow-card">
        <div className="custom-divide [&>*:last-child]:pb-1.5">
          {infoSections.map(({ title, icon }) => (
            <button
              key={title}
              type="button"
              className="flex w-full items-center justify-between gap-3 py-3 first:pt-1 last:pb-1 text-left transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="flex items-center gap-3">
                <img
                  src={icon}
                  alt=""
                  className="size-5 rounded-1xl"
                  aria-hidden="true"
                />
                <span className="text-base font-medium text-text-primary">{title}</span>
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
    </div>
  )
}

export default InfoScreen
