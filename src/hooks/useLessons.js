import { useEffect, useState } from 'react'
import { fetchAllLessons, fetchLessonsByCategory } from '../api/lessons.js'

const initialState = {
  data: [],
  loading: true,
  error: null,
}

const createAsyncState = (updater) => {
  const state = { ...initialState }
  updater(state)
  return state
}

export const useAllLessons = () => {
  const [{ data, loading, error }, setState] = useState(initialState)

  useEffect(() => {
    let active = true

    setState((prev) => ({ ...prev, loading: true }))
    fetchAllLessons()
      .then((lessonList) => {
        if (!active) return
        setState(createAsyncState((draft) => {
          draft.data = lessonList
          draft.loading = false
        }))
      })
      .catch((err) => {
        if (!active) return
        setState(createAsyncState((draft) => {
          draft.error = err
          draft.loading = false
        }))
      })

    return () => {
      active = false
    }
  }, [])

  return { lessons: data, loading, error }
}

export const useLessonsByCategory = (categoryTitle) => {
  const [{ data, loading, error }, setState] = useState(initialState)

  useEffect(() => {
    let active = true

    if (!categoryTitle) {
      setState(createAsyncState((draft) => {
        draft.loading = false
      }))
      return () => {
        active = false
      }
    }

    setState((prev) => ({ ...prev, loading: true }))
    fetchLessonsByCategory(categoryTitle)
      .then((lessons) => {
        if (!active) return
        setState(createAsyncState((draft) => {
          draft.data = lessons
          draft.loading = false
        }))
      })
      .catch((err) => {
        if (!active) return
        setState(createAsyncState((draft) => {
          draft.error = err
          draft.loading = false
        }))
      })

    return () => {
      active = false
    }
  }, [categoryTitle])

  return { lessons: data, loading, error }
}
