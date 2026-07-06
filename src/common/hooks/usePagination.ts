import { useEffect, useState } from 'react'
import { readUrlParam } from '../utils/readUrlParam'

export interface UsePaginationResult {
  page: number
  setPage: (page: number) => void
  resetPage: () => void
}

export function usePagination(urlKey = 'page'): UsePaginationResult {
  const [page, setPage] = useState(() =>
    readUrlParam(urlKey, 1, (raw) => Number(raw) || 1),
  )

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const resetPage = (): void => setPage(1)

  return { page, setPage, resetPage }
}
