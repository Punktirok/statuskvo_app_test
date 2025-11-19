import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFirstClubCards } from '../hooks/useFirstClubCards.js'
import { getInterfaceIcon } from '../utils/iconLoader.js'

const backIcon = getInterfaceIcon('iconBack')

const parseLineSegments = (line) => {
  const segments = []
  if (!line) return segments

  const pattern = /\[([^[\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: line.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'link', label: match[1], href: match[2] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < line.length) {
    segments.push({ type: 'text', value: line.slice(lastIndex) })
  }

  return segments
}

const CardText = ({ text, className, onLinkClick }) => {
  if (!text) return null

  const lines = text.split('\n')

  return (
    <p className={className}>
      {lines.map((line, lineIndex) => {
        const segments = parseLineSegments(line)
        return (
          <span key={`line-${lineIndex}`}>
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
              : line}
          </span>
        )
      })}
    </p>
  )
}

function FirstClubScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cards, loading, error } = useFirstClubCards()

  const openExternalLink = (url) => {
    if (!url) return
    if (typeof window === 'undefined') return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const content = useMemo(() => cards ?? [], [cards])

  const handleBack = () => {
    const targetTab = location.state?.fromTab ?? 'home'
    navigate('/', { replace: true, state: { tab: targetTab } })
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-surface-primary px-4 pb-8 pt-3 md:max-w-[540px]">
      <header className="relative flex items-center justify-center">
        <button
          type="button"
          aria-label="Назад"
          onClick={handleBack}
          className="absolute left-0 flex h-[32px] w-[46px] items-center justify-center rounded-full bg-surface-card shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {backIcon && (
            <img src={backIcon} alt="" className="size-5" aria-hidden="true" />
          )}
        </button>
        <h1 className="mx-[46px] text-center text-base font-semibold tracking-tight text-text-primary">
          Впервые в клубе
        </h1>
      </header>

      <p className="mt-6 text-left text-base font-semibold text-accent">
        Прочитай карточки ниже, они помогут тебе влиться в клуб
      </p>

      <div className="mt-3 flex flex-col gap-3">
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="animate-pulse rounded-[20px] bg-surface-card px-5 pt-4 pb-5 shadow-card"
              >
                <div className="mb-3 h-4 w-3/5 rounded-full bg-[#F2F2F6]" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full bg-[#F2F2F6]" />
                  <div className="h-3 w-4/5 rounded-full bg-[#F2F2F6]" />
                  <div className="h-3 w-2/3 rounded-full bg-[#F2F2F6]" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && !loading && (
          <div className="rounded-[20px] bg-surface-card px-5 py-4 text-center text-sm text-text-secondary shadow-card">
            Не удалось загрузить карточки. Попробуйте позже.
          </div>
        )}
        {!loading &&
          !error &&
          content.map((card) => (
            <div
              key={card.card_id}
              className="rounded-[20px] bg-surface-card px-5 pt-4 pb-5 shadow-card"
            >
              <p className="text-base font-semibold leading-6 text-text-primary">
                {card.card_title}
              </p>
              <CardText
                text={card.card_text}
                className="mt-2 text-sm font-medium leading-5 text-text-primary/80"
                onLinkClick={openExternalLink}
              />
              {card.card_textMuted && (
                <CardText
                  text={card.card_textMuted}
                  className="mt-2 text-sm font-medium leading-5 text-text-primary/60"
                  onLinkClick={openExternalLink}
                />
              )}
            </div>
          ))}
      </div>
    </div>
  )
}

export default FirstClubScreen
