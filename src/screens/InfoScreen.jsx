import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInterfaceIcon } from '../utils/iconLoader.js'

const arrowIcon = getInterfaceIcon('iconArrow')
const bannerImage = getInterfaceIcon('imgImNew')

const getIcon = (name) =>
  new URL(`../assets/icons/category/category/${name}.png`, import.meta.url).href

function InfoScreen() {
  const navigate = useNavigate()
  const [legalMenuOpen, setLegalMenuOpen] = useState(false)

  const openExternalLink = (url) => {
    if (typeof window === 'undefined') {
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleSupportClick = () => {
    openExternalLink('https://t.me/StatusKvoBot')
  }

  const sections = [
    {
      title: 'Доступ в чат клуба',
      icon: getIcon('iconChat'),
      onClick: () => openExternalLink('https://t.me/c/2801309173/13'),
    },
    {
      title: 'Ответы на вопросы',
      icon: getIcon('iconFAQ'),
    },
    {
      title: 'Написать в поддержку',
      icon: getIcon('iconSupport'),
      onClick: handleSupportClick,
    },
    {
      title: 'Юридическое',
      icon: getIcon('iconJustice'),
      onClick: () => setLegalMenuOpen(true),
    },
  ]

  return (
    <div className="relative flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight text-text-primary text-center">
        Всякое важное
      </h2>

      <button
        type="button"
        onClick={() => navigate('/first-club', { state: { fromTab: 'info' } })}
        className="relative flex h-[79px] items-center overflow-hidden rounded-[20px] bg-[#FF57B4] py-4 pl-6 pr-4 text-left transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white hover:opacity-90"
      >
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
      </button>

      <div className="rounded-[20px] bg-surface-card px-4 py-2 shadow-card">
        <div className="custom-divide [&>*:last-child]:pb-1.5">
          {sections.map(({ title, icon, onClick }) => (
            <button
              key={title}
              type="button"
              className="flex w-full items-center justify-between gap-3 py-3 first:pt-1 last:pb-1 text-left transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={onClick}
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

      {legalMenuOpen && (
        <div className="pointer-events-auto fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[320px] overflow-hidden rounded-[24px] bg-white text-center shadow-card">
            <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
              <button
                type="button"
                className="text-base font-medium text-text-primary"
                onClick={() => openExternalLink('https://sanya-kvo.ru/status/oferta')}
              >
                Договор-оферта
              </button>
              <button
                type="button"
                className="text-base font-medium text-text-primary"
                onClick={() => openExternalLink('https://sanya-kvo.ru/policy')}
              >
                Обработка данных
              </button>
            </div>
            <button
              type="button"
              className="w-full border-t border-black/10 px-4 py-3 text-base font-semibold text-text-primary transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={() => setLegalMenuOpen(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoScreen
