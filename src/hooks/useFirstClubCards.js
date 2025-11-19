import { useEffect, useState } from 'react'
import { fetchFirstClubCards } from '../api/api.js'

export function useFirstClubCards() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    fetchFirstClubCards()
      .then((data) => {
        if (!active) return
        setCards(data ?? [])
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        setError(err)
        setCards([])
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return { cards, loading, error }
}
