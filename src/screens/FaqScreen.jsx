import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFaqCards } from '../hooks/useFaqCards.js'
import { getInterfaceIcon } from '../utils/iconLoader.js'
import { parseMarkdownText } from '../utils/markdown.js'
import { openExternalUrl } from '../utils/externalLinks.js'

const backIcon = getInterfaceIcon('iconBack')
const dropDownIcon = getInterfaceIcon('iconDropDown')

const AnswerText = ({ text, onLinkClick }) => {
  if (!text) return null

  const lines = parseMarkdownText(text)
  return (
    <p className="mt-3 text-sm font-medium leading-5 text-text-primary/80">
      {lines.map(({ segments, raw }, lineIndex) => (
        <span key={`faq-line-${lineIndex}`}>
          {lineIndex > 0 && <br />}
          {segments.length > 0
            ? segments.map((segment, segmentIndex) => {
                if (segment.type === 'link') {
                  return (
                    <button
                      key={`${segment.label}-${segmentIndex}`}
                      type="button"
                      className="font-semibold text-accent"
                      onClick={() => onLinkClick?.(segment.href)}
                    >
                      {segment.label}
                    </button>
                  )
                }
                return <span key={segmentIndex}>{segment.value}</span>
              })
            : raw}
        </span>
      ))}
    </p>
  )
}

function FaqScreen() {
  const navigate = useNavigate()
  const { cards, loading, error } = useFaqCards()
  const [expandedId, setExpandedId] = useState(null)

  const handleToggle = (cardId) => {
    setExpandedId((prev) => (prev === cardId ? null : cardId))
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-surface-primary px-4 pb-8 pt-3 md:max-w-[540px]">
      <header className="relative flex items-center justify-center">
        <button
          type="button"
          aria-label="Назад"
          onClick={() => navigate(-1)}
          className="absolute left-0 flex h-[32px] w-[46px] items-center justify-center rounded-full bg-surface-card shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {backIcon && (
            <img src={backIcon} alt="" className="size-5" aria-hidden="true" />
          )}
        </button>
        <h1 className="mx-[46px] text-center text-base font-semibold tracking-tight text-text-primary">
          Ответы на вопросы
        </h1>
      </header>

      <div className="mt-4 flex flex-1 flex-col gap-3">
        {loading && (
          <div className="flex flex-1 flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`faq-skeleton-${index}`}
                className="animate-pulse rounded-[20px] bg-surface-card px-5 py-4 shadow-card"
              >
                <div className="h-4 w-2/3 rounded-full bg-[#F2F2F6]" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full rounded-full bg-[#F2F2F6]" />
                  <div className="h-3 w-4/5 rounded-full bg-[#F2F2F6]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-[20px] bg-surface-card px-5 py-4 text-center text-sm text-text-secondary shadow-card">
            Не удалось загрузить вопросы. Попробуйте позже.
          </div>
        )}

        {!loading &&
          !error &&
          cards.map((card) => {
            const isOpen = expandedId === card.faq_cardId
            return (
              <div
                key={card.faq_cardId}
                className="rounded-[20px] bg-surface-card px-5 py-4 shadow-card"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 text-left"
                  onClick={() => handleToggle(card.faq_cardId)}
                >
                  <span className="text-base font-semibold leading-6 text-text-primary">
                    {card.faq_cardTitle}
                  </span>
                  {dropDownIcon && (
                    <img
                      src={dropDownIcon}
                      alt=""
                      className={`size-4 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </button>
                {isOpen && card.faq_cardText && (
                  <AnswerText
                    text={card.faq_cardText}
                    onLinkClick={(href) => {
                      if (!href) return
                      openExternalUrl(href)
                    }}
                  />
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default FaqScreen
