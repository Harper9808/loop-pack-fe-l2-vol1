import { request } from '../../common/services/httpClient'
import type { Product, SortBy } from '../types'

export interface ProductListParams {
  category: string
  sort: SortBy
  q: string
  page: number
  size: number
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
}

export interface ProductListResponse {
  products: Product[]
  totalCount: number
}

export const productService = {
  getProducts: async (
    params: ProductListParams,
  ): Promise<ProductListResponse> => {
    const searchParams = new URLSearchParams({
      category: params.category,
      sort: params.sort,
      q: params.q,
      page: String(params.page),
      size: String(params.size),
    })
    if (params.minPrice !== undefined) {
      searchParams.set('minPrice', String(params.minPrice))
    }
    if (params.maxPrice !== undefined) {
      searchParams.set('maxPrice', String(params.maxPrice))
    }
    if (params.inStockOnly) searchParams.set('inStock', 'true')

    return request<ProductListResponse>('/api/products', searchParams)
  },
}
