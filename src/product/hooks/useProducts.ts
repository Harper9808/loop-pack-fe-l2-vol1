import { useEffect, useState } from 'react'
import { productService } from '../services/productService'
import { enrichProduct } from '../utils/productRules'
import type { ProductWithRules, SortBy } from '../types'

export interface UseProductsParams {
  category: string
  minPrice: number | ''
  maxPrice: number | ''
  sortBy: SortBy
  q: string
  page: number
  size: number
  inStockOnly: boolean
}

export interface UseProductsResult {
  products: ProductWithRules[]
  totalCount: number
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useProducts(params: UseProductsParams): UseProductsResult {
  const [products, setProducts] = useState<ProductWithRules[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [refetchToken, setRefetchToken] = useState(0)

  const { category, minPrice, maxPrice, sortBy, q, page, size, inStockOnly } =
    params

  useEffect(() => {
    let ignore = false

    const fetchProducts = async (): Promise<void> => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await productService.getProducts({
          category,
          sort: sortBy,
          q,
          page,
          size,
          minPrice: minPrice === '' ? undefined : minPrice,
          maxPrice: maxPrice === '' ? undefined : maxPrice,
          inStockOnly,
        })
        if (!ignore) {
          setProducts(data.products.map(enrichProduct))
          setTotalCount(data.totalCount)
        }
      } catch (err) {
        if (!ignore) setError(err as Error)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    void fetchProducts()

    return () => {
      ignore = true
    }
  }, [
    category,
    minPrice,
    maxPrice,
    sortBy,
    q,
    page,
    size,
    inStockOnly,
    refetchToken,
  ])

  const refetch = (): void => setRefetchToken((token) => token + 1)

  return { products, totalCount, isLoading, error, refetch }
}
