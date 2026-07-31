import { useState } from 'react'
import { readUrlParam } from '../../common/utils/readUrlParam'
import { useDebouncedValue } from '../../common/hooks/useDebouncedValue'

export interface UseProductSearchResult {
  searchQuery: string
  setSearchQuery: (value: string) => void
  debouncedQuery: string
}

export function useProductSearch(): UseProductSearchResult {
  const [searchQuery, setSearchQuery] = useState(() =>
    readUrlParam('q', '', (raw) => raw),
  )
  const debouncedQuery = useDebouncedValue(searchQuery, 300)

  return { searchQuery, setSearchQuery, debouncedQuery }
}
