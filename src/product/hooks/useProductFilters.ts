import { useState } from 'react'
import { readUrlParam } from '../../common/utils/readUrlParam'
import { useDebouncedValue } from '../../common/hooks/useDebouncedValue'
import type { Product } from '../types'

export interface UseProductFiltersResult {
  category: 'all' | Product['category']
  setCategory: (value: 'all' | Product['category']) => void
  minPrice: number | ''
  setMinPrice: (value: number | '') => void
  maxPrice: number | ''
  setMaxPrice: (value: number | '') => void
  debouncedMinPrice: number | ''
  debouncedMaxPrice: number | ''
  inStockOnly: boolean
  setInStockOnly: (value: boolean) => void
  resetFilters: () => void
}

export function useProductFilters(): UseProductFiltersResult {
  const [category, setCategory] = useState<'all' | Product['category']>(() =>
    readUrlParam<'all' | Product['category']>(
      'category',
      'all',
      (raw) => raw as 'all' | Product['category'],
    ),
  )
  const [minPrice, setMinPrice] = useState<number | ''>(() =>
    readUrlParam<number | ''>('minPrice', '', (raw) => Number(raw)),
  )
  const [maxPrice, setMaxPrice] = useState<number | ''>(() =>
    readUrlParam<number | ''>('maxPrice', '', (raw) => Number(raw)),
  )
  const [inStockOnly, setInStockOnly] = useState(() =>
    readUrlParam('inStock', false, (raw) => raw === 'true'),
  )

  const debouncedMinPrice = useDebouncedValue(minPrice, 300)
  const debouncedMaxPrice = useDebouncedValue(maxPrice, 300)

  const resetFilters = (): void => {
    setCategory('all')
    setMinPrice('')
    setMaxPrice('')
    setInStockOnly(false)
  }

  return {
    category,
    setCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    debouncedMinPrice,
    debouncedMaxPrice,
    inStockOnly,
    setInStockOnly,
    resetFilters,
  }
}
